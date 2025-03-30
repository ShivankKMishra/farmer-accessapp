import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertDiscussionSchema, insertCommentSchema, insertCropSchema, insertExpenseSchema, insertAuctionSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET || "farmer-access-secret-key";

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid authentication" });
    }
    
    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or phone already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (userData.phone) {
        const existingUserByPhone = await storage.getUserByPhone(userData.phone);
        if (existingUserByPhone) {
          return res.status(400).json({ message: "Phone number already registered" });
        }
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/phone-login", async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const user = await storage.getUserByPhone(phone);
      
      // In a real application, we would send an OTP and verify
      // For this demo, we'll just check if the user exists
      
      if (!user) {
        return res.status(404).json({ message: "User not found, please register" });
      }
      
      // Mock OTP verification here
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/auth/me", authenticate, async (req, res) => {
    const user = (req as any).user;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // User Profile Routes
  app.put("/api/users/profile", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userData = req.body;
      
      // Prevent password update through this endpoint
      delete userData.password;
      
      const updatedUser = await storage.updateUser(user.id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Products Routes
  app.get("/api/products", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters if provided
      if (req.query.category) filters.category = req.query.category;
      if (req.query.location) filters.location = req.query.location;
      if (req.query.seller_id) filters.seller_id = Number(req.query.seller_id);
      if (req.query.available) filters.available = req.query.available === 'true';
      
      const products = await storage.getProducts(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Fetch seller information for each product
      const productsWithSeller = await Promise.all(products.map(async (product) => {
        const seller = await storage.getUser(product.seller_id);
        return {
          ...product,
          seller: seller ? {
            id: seller.id,
            name: seller.name,
            username: seller.username,
            location: seller.location,
            profile_pic: seller.profile_pic
          } : null
        };
      }));
      
      res.json(productsWithSeller);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const seller = await storage.getUser(product.seller_id);
      
      res.json({
        ...product,
        seller: seller ? {
          id: seller.id,
          name: seller.name,
          username: seller.username,
          location: seller.location,
          profile_pic: seller.profile_pic
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/products", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const productData = insertProductSchema.parse({
        ...req.body,
        seller_id: user.id
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/products/:id", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const productId = parseInt(req.params.id);
      const productData = req.body;
      
      const existingProduct = await storage.getProduct(productId);
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller_id !== user.id) {
        return res.status(403).json({ message: "You can only update your own products" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/products/:id", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const productId = parseInt(req.params.id);
      
      const existingProduct = await storage.getProduct(productId);
      
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.seller_id !== user.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
      
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Discussion Routes
  app.get("/api/discussions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) filters.category = req.query.category;
      if (req.query.author_id) filters.author_id = Number(req.query.author_id);
      
      const discussions = await storage.getDiscussions(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Fetch author information and comment count for each discussion
      const discussionsWithDetails = await Promise.all(discussions.map(async (discussion) => {
        const author = await storage.getUser(discussion.author_id);
        const comments = await storage.getComments(discussion.id);
        
        return {
          ...discussion,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            profile_pic: author.profile_pic
          } : null,
          commentCount: comments.length
        };
      }));
      
      res.json(discussionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/discussions/:id", async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      const author = await storage.getUser(discussion.author_id);
      const comments = await storage.getComments(discussionId);
      
      // Fetch author information for each comment
      const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
        const commentAuthor = await storage.getUser(comment.author_id);
        return {
          ...comment,
          author: commentAuthor ? {
            id: commentAuthor.id,
            name: commentAuthor.name,
            username: commentAuthor.username,
            profile_pic: commentAuthor.profile_pic
          } : null
        };
      }));
      
      res.json({
        ...discussion,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          profile_pic: author.profile_pic
        } : null,
        comments: commentsWithAuthor
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/discussions", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const discussionData = insertDiscussionSchema.parse({
        ...req.body,
        author_id: user.id
      });
      
      const discussion = await storage.createDiscussion(discussionData);
      res.status(201).json(discussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/discussions/:id/comments", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const discussionId = parseInt(req.params.id);
      
      const discussion = await storage.getDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        content: req.body.content,
        author_id: user.id,
        discussion_id: discussionId
      });
      
      const comment = await storage.createComment(commentData);
      
      // Include author information in response
      const author = await storage.getUser(user.id);
      
      res.status(201).json({
        ...comment,
        author: {
          id: author!.id,
          name: author!.name,
          username: author!.username,
          profile_pic: author!.profile_pic
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Farm Management Routes
  app.get("/api/crops", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const crops = await storage.getCropsByFarmer(user.id);
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/crops", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const cropData = insertCropSchema.parse({
        ...req.body,
        farmer_id: user.id
      });
      
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/crops/:id", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const cropId = parseInt(req.params.id);
      const cropData = req.body;
      
      const existingCrop = await storage.getCrop(cropId);
      
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.farmer_id !== user.id) {
        return res.status(403).json({ message: "You can only update your own crops" });
      }
      
      const updatedCrop = await storage.updateCrop(cropId, cropData);
      res.json(updatedCrop);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/expenses", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const expenses = await storage.getExpensesByFarmer(user.id);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/expenses", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        farmer_id: user.id
      });
      
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Weather API
  app.get("/api/weather", async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }
      
      // Check if we have cached weather data
      const cachedData = await storage.getWeatherData(location as string);
      
      // If data exists and is less than 3 hours old, return it
      if (cachedData && (new Date().getTime() - cachedData.timestamp.getTime() < 3 * 60 * 60 * 1000)) {
        return res.json(cachedData.data);
      }
      
      // For demo purposes, return mock weather data
      const weatherData = {
        location: location,
        current: {
          temp_c: 28,
          condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
          },
          humidity: 65,
          wind_kph: 12
        },
        forecast: {
          forecastday: [
            {
              date: new Date().toISOString().split('T')[0],
              day: {
                maxtemp_c: 32,
                mintemp_c: 24,
                condition: {
                  text: "Sunny",
                  icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
                }
              }
            },
            {
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 29,
                mintemp_c: 22,
                condition: {
                  text: "Patchy rain possible",
                  icon: "//cdn.weatherapi.com/weather/64x64/day/176.png"
                }
              }
            },
            {
              date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 27,
                mintemp_c: 21,
                condition: {
                  text: "Thunderstorms",
                  icon: "//cdn.weatherapi.com/weather/64x64/day/200.png"
                }
              }
            },
            {
              date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 30,
                mintemp_c: 23,
                condition: {
                  text: "Sunny",
                  icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
                }
              }
            }
          ]
        }
      };
      
      // Cache the weather data
      await storage.saveWeatherData({
        location: location as string,
        data: weatherData
      });
      
      res.json(weatherData);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Auction Routes
  app.get("/api/auctions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.status) filters.status = req.query.status;
      if (req.query.seller_id) filters.seller_id = Number(req.query.seller_id);
      
      const auctions = await storage.getAuctions(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Fetch seller information and highest bid for each auction
      const auctionsWithDetails = await Promise.all(auctions.map(async (auction) => {
        const seller = await storage.getUser(auction.seller_id);
        const bids = await storage.getBidsByAuction(auction.id);
        
        // Calculate highest bid
        let highestBid = null;
        if (bids.length > 0) {
          highestBid = bids.reduce((highest, bid) => 
            highest.amount > bid.amount ? highest : bid
          );
        }
        
        return {
          ...auction,
          seller: seller ? {
            id: seller.id,
            name: seller.name,
            username: seller.username,
            location: seller.location,
            profile_pic: seller.profile_pic
          } : null,
          highestBid: highestBid ? highestBid.amount : null,
          bidCount: bids.length
        };
      }));
      
      res.json(auctionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/auctions/:id", async (req, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      const auction = await storage.getAuction(auctionId);
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      const seller = await storage.getUser(auction.seller_id);
      const bids = await storage.getBidsByAuction(auctionId);
      
      // Fetch bidder information for each bid
      const bidsWithBidder = await Promise.all(bids.map(async (bid) => {
        const bidder = await storage.getUser(bid.bidder_id);
        return {
          ...bid,
          bidder: bidder ? {
            id: bidder.id,
            name: bidder.name,
            username: bidder.username,
            profile_pic: bidder.profile_pic
          } : null
        };
      }));
      
      // Sort bids by amount in descending order
      bidsWithBidder.sort((a, b) => b.amount - a.amount);
      
      res.json({
        ...auction,
        seller: seller ? {
          id: seller.id,
          name: seller.name,
          username: seller.username,
          location: seller.location,
          profile_pic: seller.profile_pic
        } : null,
        bids: bidsWithBidder
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auctions", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const auctionData = insertAuctionSchema.parse({
        ...req.body,
        seller_id: user.id
      });
      
      const auction = await storage.createAuction(auctionData);
      res.status(201).json(auction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auctions/:id/bids", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const auctionId = parseInt(req.params.id);
      
      const auction = await storage.getAuction(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      if (auction.seller_id === user.id) {
        return res.status(400).json({ message: "You cannot bid on your own auction" });
      }
      
      if (auction.status !== "active") {
        return res.status(400).json({ message: "This auction is no longer active" });
      }
      
      const bidData = insertBidSchema.parse({
        auction_id: auctionId,
        bidder_id: user.id,
        amount: req.body.amount,
        status: "pending"
      });
      
      // Check if bid is higher than previous bids
      const existingBids = await storage.getBidsByAuction(auctionId);
      const highestBid = existingBids.length > 0 
        ? existingBids.reduce((highest, bid) => highest.amount > bid.amount ? highest : bid)
        : null;
      
      if (highestBid && bidData.amount <= highestBid.amount) {
        return res.status(400).json({ 
          message: "Your bid must be higher than the current highest bid",
          currentHighestBid: highestBid.amount
        });
      }
      
      const bid = await storage.createBid(bidData);
      
      // Include bidder information in response
      const bidder = await storage.getUser(user.id);
      
      res.status(201).json({
        ...bid,
        bidder: {
          id: bidder!.id,
          name: bidder!.name,
          username: bidder!.username,
          profile_pic: bidder!.profile_pic
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/auctions/:id", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const auctionId = parseInt(req.params.id);
      const { status } = req.body;
      
      const auction = await storage.getAuction(auctionId);
      
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      if (auction.seller_id !== user.id) {
        return res.status(403).json({ message: "You can only update your own auctions" });
      }
      
      const updatedAuction = await storage.updateAuction(auctionId, { status });
      res.json(updatedAuction);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Messaging Routes
  app.get("/api/messages", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const messages = await storage.getMessagesByUser(user.id);
      
      // Group messages by conversation
      const conversations = new Map();
      
      for (const message of messages) {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        
        if (!conversations.has(otherUserId)) {
          const otherUser = await storage.getUser(otherUserId);
          
          if (!otherUser) continue;
          
          conversations.set(otherUserId, {
            user: {
              id: otherUser.id,
              name: otherUser.name,
              username: otherUser.username,
              profile_pic: otherUser.profile_pic
            },
            messages: [],
            lastMessageAt: null,
            unreadCount: 0
          });
        }
        
        const conversation = conversations.get(otherUserId);
        conversation.messages.push(message);
        
        // Update last message timestamp
        if (!conversation.lastMessageAt || message.created_at > conversation.lastMessageAt) {
          conversation.lastMessageAt = message.created_at;
        }
        
        // Count unread messages
        if (message.sender_id === otherUserId && !message.read) {
          conversation.unreadCount++;
        }
      }
      
      // Convert Map to array and sort by lastMessageAt
      const result = Array.from(conversations.values())
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
        .map(conversation => ({
          ...conversation,
          lastMessage: conversation.messages.reduce((latest, msg) => 
            !latest || msg.created_at > latest.created_at ? msg : latest
          , null)
        }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/messages/:userId", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const otherUserId = parseInt(req.params.userId);
      
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const allMessages = await storage.getMessagesByUser(user.id);
      
      // Filter messages between the two users
      const messages = allMessages.filter(message => 
        (message.sender_id === user.id && message.receiver_id === otherUserId) ||
        (message.sender_id === otherUserId && message.receiver_id === user.id)
      );
      
      // Sort messages by created_at
      messages.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      
      // Mark messages as read
      await storage.markMessagesAsRead(user.id, otherUserId);
      
      res.json({
        user: {
          id: otherUser.id,
          name: otherUser.name,
          username: otherUser.username,
          profile_pic: otherUser.profile_pic
        },
        messages
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/messages", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { receiver_id, content } = req.body;
      
      if (!receiver_id || !content) {
        return res.status(400).json({ message: "Receiver ID and content are required" });
      }
      
      const receiver = await storage.getUser(parseInt(receiver_id));
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const messageData = insertMessageSchema.parse({
        sender_id: user.id,
        receiver_id: parseInt(receiver_id),
        content
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
