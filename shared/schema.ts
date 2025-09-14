import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  json, 
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const leadStatusEnum = pgEnum('lead_status', ['lead', 'contacted', 'proposal', 'booked', 'won', 'lost']);
export const clientStatusEnum = pgEnum('client_status', ['active', 'inactive', 'prospect']);
export const jobStatusEnum = pgEnum('job_status', ['scheduled', 'in-progress', 'completed', 'cancelled']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'completed', 'cancelled']);
export const messageTypeEnum = pgEnum('message_type', ['sms', 'email']);
export const messageDirectionEnum = pgEnum('message_direction', ['inbound', 'outbound']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read', 'failed']);
export const propertyTypeEnum = pgEnum('property_type', ['house', 'apartment', 'condo', 'townhouse', 'office', 'commercial']);
export const activityTypeEnum = pgEnum('activity_type', ['call', 'email', 'sms', 'visit', 'estimate', 'follow_up', 'booking', 'payment']);
export const followUpTypeEnum = pgEnum('follow_up_type', ['call', 'email', 'sms', 'visit']);
export const followUpStatusEnum = pgEnum('follow_up_status', ['pending', 'completed', 'cancelled']);

// Users table (staff/admin users)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default('staff'), // admin, manager, staff
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table (enhanced for comprehensive contact management)
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  tags: json("tags").$type<string[]>().default([]),
  status: clientStatusEnum("status").default('active'),
  notes: text("notes").default(''),
  emergencyContact: json("emergency_contact").$type<{name?: string; phone?: string; relationship?: string}>(),
  preferredContactMethod: text("preferred_contact_method").default('phone'), // phone, email, sms
  preferredTimeSlot: text("preferred_time_slot"), // morning, afternoon, evening
  servicePreferences: json("service_preferences").$type<{
    products?: string[]; // eco-friendly, regular, etc.
    frequency?: string; // weekly, biweekly, monthly
    specialInstructions?: string;
  }>().default({}),
  source: text("source"), // Website, Referral, Google Ads, etc.
  referredBy: varchar("referred_by"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default('0'),
  joinDate: timestamp("join_date").defaultNow(),
  lastServiceDate: timestamp("last_service_date"),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table (sales pipeline)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  service: text("service").notNull(),
  source: text("source").notNull(), // Website, Referral, Google Ads, etc.
  status: leadStatusEnum("status").default('lead'),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  lastContactDate: timestamp("last_contact_date"),
  notes: text("notes").default(''),
  assignedTo: varchar("assigned_to").references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id), // Set when lead becomes client
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  service: text("service").notNull(),
  description: text("description").default(''),
  address: text("address").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // minutes
  actualDuration: integer("actual_duration"), // minutes
  status: jobStatusEnum("status").default('scheduled'),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  tips: decimal("tips", { precision: 10, scale: 2 }).default('0'),
  materials: json("materials").$type<string[]>().default([]),
  staff: json("staff").$type<string[]>().default([]),
  notes: text("notes").default(''),
  photos: json("photos").$type<string[]>().default([]),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  jobId: varchar("job_id").references(() => jobs.id),
  service: text("service").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(), // minutes
  staff: json("staff").$type<string[]>().default([]),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  status: bookingStatusEnum("status").default('pending'),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes").default(''),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table (SMS/Email communications)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  type: messageTypeEnum("type").notNull(),
  direction: messageDirectionEnum("direction").notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default('sent'),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  sentBy: varchar("sent_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services table (predefined services)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").default(''),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Details table (for comprehensive property information)
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  propertyType: propertyTypeEnum("property_type").notNull(),
  address: text("address").notNull(),
  squareFootage: integer("square_footage"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  floors: integer("floors").default(1),
  hasBasement: boolean("has_basement").default(false),
  hasGarage: boolean("has_garage").default(false),
  hasPets: boolean("has_pets").default(false),
  petDetails: text("pet_details"),
  specialRequirements: text("special_requirements"),
  accessInstructions: text("access_instructions"),
  alarmCode: text("alarm_code"),
  keyLocation: text("key_location"),
  notes: text("notes").default(''),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Activities table (comprehensive activity tracking)
export const contactActivities = pgTable("contact_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  activityType: activityTypeEnum("activity_type").notNull(),
  title: text("title").notNull(),
  description: text("description").default(''),
  outcome: text("outcome"),
  duration: integer("duration"), // minutes
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  relatedJobId: varchar("related_job_id").references(() => jobs.id),
  relatedLeadId: varchar("related_lead_id").references(() => leads.id),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follow-ups table (scheduled follow-up actions)
export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  leadId: varchar("lead_id").references(() => leads.id),
  followUpType: followUpTypeEnum("follow_up_type").notNull(),
  title: text("title").notNull(),
  description: text("description").default(''),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: followUpStatusEnum("status").default('pending'),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  notes: text("notes").default(''),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients, {
  tags: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  servicePreferences: z.object({
    products: z.array(z.string()).optional(),
    frequency: z.string().optional(),
    specialInstructions: z.string().optional(),
  }).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs, {
  materials: z.array(z.string()).optional(),
  staff: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings, {
  staff: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactActivitySchema = createInsertSchema(contactActivities, {
  metadata: z.record(z.any()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertContactActivity = z.infer<typeof insertContactActivitySchema>;
export type ContactActivity = typeof contactActivities.$inferSelect;

export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;