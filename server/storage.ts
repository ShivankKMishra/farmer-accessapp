import {
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  discussions, type Discussion, type InsertDiscussion,
  comments, type Comment, type InsertComment,
  crops, type Crop, type InsertCrop,
  expenses, type Expense, type InsertExpense,
  weatherData, type WeatherData, type InsertWeatherData,
  auctions, type Auction, type InsertAuction,
  bids, type Bid, type InsertBid,
  messages, type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filters?: Partial<Product>): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Discussion operations
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getDiscussions(filters?: Partial<Discussion>): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  
  // Comment operations
  getComments(discussionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Crop operations
  getCrop(id: number): Promise<Crop | undefined>;
  getCropsByFarmer(farmerId: number): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: number, cropData: Partial<InsertCrop>): Promise<Crop | undefined>;
  
  // Expense operations
  getExpense(id: number): Promise<Expense | undefined>;
  getExpensesByFarmer(farmerId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  
  // Weather data operations
  getWeatherData(location: string): Promise<WeatherData | undefined>;
  saveWeatherData(weatherData: InsertWeatherData): Promise<WeatherData>;
  
  // Auction operations
  getAuction(id: number): Promise<Auction | undefined>;
  getAuctions(filters?: Partial<Auction>): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, auctionData: Partial<InsertAuction>): Promise<Auction | undefined>;
  
  // Bid operations
  getBidsByAuction(auctionId: number): Promise<Bid[]>;
  getBidsByBidder(bidderId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: number, status: string): Promise<Bid | undefined>;
  
  // Message operations
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: number, senderId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private discussions: Map<number, Discussion>;
  private comments: Map<number, Comment>;
  private crops: Map<number, Crop>;
  private expenses: Map<number, Expense>;
  private weatherData: Map<string, WeatherData>;
  private auctions: Map<number, Auction>;
  private bids: Map<number, Bid>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private discussionIdCounter: number;
  private commentIdCounter: number;
  private cropIdCounter: number;
  private expenseIdCounter: number;
  private weatherIdCounter: number;
  private auctionIdCounter: number;
  private bidIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.discussions = new Map();
    this.comments = new Map();
    this.crops = new Map();
    this.expenses = new Map();
    this.weatherData = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.discussionIdCounter = 1;
    this.commentIdCounter = 1;
    this.cropIdCounter = 1;
    this.expenseIdCounter = 1;
    this.weatherIdCounter = 1;
    this.auctionIdCounter = 1;
    this.bidIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Add some sample data
    this.initSampleData();
  }

  // Sample data initialization for testing
  private initSampleData() {
    // Add sample users
    const user1: User = {
      id: this.userIdCounter++,
      username: "rajpatel",
      password: "password123",
      name: "Raj Patel",
      phone: "9876543210",
      email: "raj@example.com",
      role: "farmer",
      location: "Nagpur, Maharashtra",
      profile_pic: "https://randomuser.me/api/portraits/men/32.jpg",
      farmSize: "10",
      cropTypes: "Wheat, Tomatoes",
      bio: "Experienced farmer with 15 years in organic farming."
    };
    
    const user2: User = {
      id: this.userIdCounter++,
      username: "harpreetkaur",
      password: "password123",
      name: "Harpreet Kaur",
      phone: "9876543211",
      email: "harpreet@example.com",
      role: "farmer",
      location: "Ludhiana, Punjab",
      profile_pic: "https://randomuser.me/api/portraits/women/45.jpg",
      farmSize: "15",
      cropTypes: "Wheat, Rice",
      bio: "Second generation farmer specializing in wheat and rice cultivation."
    };
    
    const user3: User = {
      id: this.userIdCounter++,
      username: "mohanverma",
      password: "password123",
      name: "Mohan Verma",
      phone: "9876543212",
      email: "mohan@example.com",
      role: "buyer",
      location: "Indore, Madhya Pradesh",
      profile_pic: "https://randomuser.me/api/portraits/men/67.jpg",
      farmSize: "",
      cropTypes: "",
      bio: "Agricultural product buyer with extensive market connections."
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filters?: Partial<Product>): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      products = products.filter(product => {
        for (const [key, value] of Object.entries(filters)) {
          if (product[key as keyof Product] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return products;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id,
      created_at: now
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = await this.getProduct(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Discussion operations
  async getDiscussion(id: number): Promise<Discussion | undefined> {
    return this.discussions.get(id);
  }

  async getDiscussions(filters?: Partial<Discussion>): Promise<Discussion[]> {
    let discussions = Array.from(this.discussions.values());
    
    if (filters) {
      discussions = discussions.filter(discussion => {
        for (const [key, value] of Object.entries(filters)) {
          if (discussion[key as keyof Discussion] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return discussions;
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const id = this.discussionIdCounter++;
    const now = new Date();
    const discussion: Discussion = { 
      ...insertDiscussion, 
      id,
      created_at: now
    };
    this.discussions.set(id, discussion);
    return discussion;
  }

  // Comment operations
  async getComments(discussionId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      comment => comment.discussion_id === discussionId
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id,
      created_at: now
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Crop operations
  async getCrop(id: number): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async getCropsByFarmer(farmerId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      crop => crop.farmer_id === farmerId
    );
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = this.cropIdCounter++;
    const crop: Crop = { ...insertCrop, id };
    this.crops.set(id, crop);
    return crop;
  }

  async updateCrop(id: number, cropData: Partial<InsertCrop>): Promise<Crop | undefined> {
    const existingCrop = await this.getCrop(id);
    if (!existingCrop) return undefined;
    
    const updatedCrop = { ...existingCrop, ...cropData };
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }

  // Expense operations
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByFarmer(farmerId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => expense.farmer_id === farmerId
    );
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const expense: Expense = { ...insertExpense, id };
    this.expenses.set(id, expense);
    return expense;
  }

  // Weather data operations
  async getWeatherData(location: string): Promise<WeatherData | undefined> {
    return this.weatherData.get(location);
  }

  async saveWeatherData(insertWeatherData: InsertWeatherData): Promise<WeatherData> {
    const id = this.weatherIdCounter++;
    const now = new Date();
    const weatherData: WeatherData = { 
      ...insertWeatherData, 
      id,
      timestamp: now
    };
    this.weatherData.set(insertWeatherData.location, weatherData);
    return weatherData;
  }

  // Auction operations
  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }

  async getAuctions(filters?: Partial<Auction>): Promise<Auction[]> {
    let auctions = Array.from(this.auctions.values());
    
    if (filters) {
      auctions = auctions.filter(auction => {
        for (const [key, value] of Object.entries(filters)) {
          if (auction[key as keyof Auction] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return auctions;
  }

  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const id = this.auctionIdCounter++;
    const now = new Date();
    const auction: Auction = { 
      ...insertAuction, 
      id,
      created_at: now
    };
    this.auctions.set(id, auction);
    return auction;
  }

  async updateAuction(id: number, auctionData: Partial<InsertAuction>): Promise<Auction | undefined> {
    const existingAuction = await this.getAuction(id);
    if (!existingAuction) return undefined;
    
    const updatedAuction = { ...existingAuction, ...auctionData };
    this.auctions.set(id, updatedAuction);
    return updatedAuction;
  }

  // Bid operations
  async getBidsByAuction(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.auction_id === auctionId
    );
  }

  async getBidsByBidder(bidderId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.bidder_id === bidderId
    );
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidIdCounter++;
    const now = new Date();
    const bid: Bid = { 
      ...insertBid, 
      id,
      created_at: now
    };
    this.bids.set(id, bid);
    return bid;
  }

  async updateBid(id: number, status: string): Promise<Bid | undefined> {
    const existingBid = this.bids.get(id);
    if (!existingBid) return undefined;
    
    const updatedBid = { ...existingBid, status };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  // Message operations
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.sender_id === userId || message.receiver_id === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id,
      created_at: now,
      read: false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(userId: number, senderId: number): Promise<boolean> {
    const userMessages = await this.getMessagesByUser(userId);
    
    for (const message of userMessages) {
      if (message.sender_id === senderId && message.receiver_id === userId && !message.read) {
        message.read = true;
        this.messages.set(message.id, message);
      }
    }
    
    return true;
  }
}

export const storage = new MemStorage();
