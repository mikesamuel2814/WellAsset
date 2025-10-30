import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, decimal, timestamp, boolean, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
});

export const properties = mysqlTable("properties", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 500 }).notNull(),
  titleBn: varchar("title_bn", { length: 500 }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  locationBn: varchar("location_bn", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  bedrooms: int("bedrooms").notNull(),
  bathrooms: int("bathrooms").notNull(),
  area: int("area").notNull(),
  description: text("description").notNull(),
  descriptionBn: text("description_bn"),
  features: json("features").$type<string[]>().notNull(),
  featuresBn: json("features_bn").$type<string[]>(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  images: json("images").$type<string[]>().notNull(),
  videos: json("videos").$type<string[]>(),
  agentId: int("agent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  profileImage: text("profile_image"),
});

export const inquiries = mysqlTable("inquiries", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  message: text("message").notNull(),
  propertyId: int("property_id"),
  status: varchar("status", { length: 50 }).notNull().default("unread"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  valueBn: text("value_bn"),
  category: varchar("category", { length: 50 }).notNull(), // 'contact', 'about', 'general'
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialMedia = mysqlTable("social_media", {
  id: int("id").primaryKey().autoincrement(),
  platform: varchar("platform", { length: 50 }).notNull(), // 'facebook', 'instagram', 'linkedin', 'twitter'
  url: varchar("url", { length: 500 }).notNull(),
  icon: varchar("icon", { length: 50 }), // icon name from lucide-react
  isActive: boolean("is_active").notNull().default(true),
  order: int("order").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
}).extend({
  price: z.string().min(1, "Price is required"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  area: z.number().min(1),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20, "Phone number is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSocialMediaSchema = createInsertSchema(socialMedia).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>;
export type SocialMedia = typeof socialMedia.$inferSelect;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100, "Password is too long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
