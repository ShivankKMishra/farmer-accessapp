import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  role: text("role").default("farmer"),
  location: text("location"),
  profile_pic: text("profile_pic"),
  farmSize: text("farm_size"),
  cropTypes: text("crop_types"),
  bio: text("bio"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  location: true,
  profile_pic: true,
  farmSize: true,
  cropTypes: true,
  bio: true,
});

// Products Model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  location: text("location").notNull(),
  image: text("image"),
  seller_id: integer("seller_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  is_organic: boolean("is_organic").default(false),
  available: boolean("available").default(true),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  category: true,
  price: true,
  quantity: true,
  unit: true,
  location: true,
  image: true,
  seller_id: true,
  is_organic: true,
  available: true,
});

// Discussions Model
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author_id: integer("author_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  category: text("category").notNull(),
});

export const insertDiscussionSchema = createInsertSchema(discussions).pick({
  title: true,
  content: true,
  author_id: true,
  category: true,
});

// Comments Model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author_id: integer("author_id").notNull(),
  discussion_id: integer("discussion_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  author_id: true,
  discussion_id: true,
});

// Crop Management
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  variety: text("variety"),
  farmer_id: integer("farmer_id").notNull(),
  area: integer("area").notNull(),
  area_unit: text("area_unit").default("acres"),
  planting_date: timestamp("planting_date").notNull(),
  expected_harvest_date: timestamp("expected_harvest_date"),
  status: text("status").default("active"),
  notes: text("notes"),
});

export const insertCropSchema = createInsertSchema(crops).pick({
  name: true,
  variety: true,
  farmer_id: true,
  area: true,
  area_unit: true,
  planting_date: true,
  expected_harvest_date: true,
  status: true,
  notes: true,
});

// Farm Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  farmer_id: integer("farmer_id").notNull(),
  notes: text("notes"),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  title: true,
  amount: true,
  category: true,
  date: true,
  farmer_id: true,
  notes: true,
});

// Weather Data
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).pick({
  location: true,
  data: true,
});

// Bidding Auctions
export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  crop_name: text("crop_name").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  min_price: integer("min_price"),
  seller_id: integer("seller_id").notNull(),
  end_time: timestamp("end_time").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  status: text("status").default("active"),
  description: text("description"),
});

export const insertAuctionSchema = createInsertSchema(auctions).pick({
  title: true,
  crop_name: true,
  quantity: true,
  unit: true,
  min_price: true,
  seller_id: true,
  end_time: true,
  status: true,
  description: true,
});

// Bids
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auction_id: integer("auction_id").notNull(),
  bidder_id: integer("bidder_id").notNull(),
  amount: integer("amount").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  status: text("status").default("pending"),
});

export const insertBidSchema = createInsertSchema(bids).pick({
  auction_id: true,
  bidder_id: true,
  amount: true,
  status: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender_id: integer("sender_id").notNull(),
  receiver_id: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sender_id: true,
  receiver_id: true,
  content: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
