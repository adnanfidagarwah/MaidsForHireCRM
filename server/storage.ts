import { 
  type User, 
  type InsertUser,
  type Client,
  type InsertClient,
  type Lead,
  type InsertLead,
  type Job,
  type InsertJob,
  type Booking,
  type InsertBooking,
  type Message,
  type InsertMessage,
  type Service,
  type InsertService,
  type Property,
  type InsertProperty,
  type ContactActivity,
  type InsertContactActivity,
  type FollowUp,
  type InsertFollowUp,
  users,
  clients,
  leads,
  jobs,
  bookings,
  messages,
  services,
  properties,
  contactActivities,
  followUps
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, sql, and, ilike, or, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Handle special characters in the database URL by manually encoding the password
function fixSupabaseUrl(url: string): string {
  // Find the last @ symbol which separates password from host
  const lastAtIndex = url.lastIndexOf('@');
  if (lastAtIndex === -1) {
    return url;
  }
  
  // Split into prefix (postgresql://user:password) and suffix (host:port/database)
  const prefix = url.substring(0, lastAtIndex);
  const suffix = url.substring(lastAtIndex + 1);
  
  // Extract user and password from prefix
  const colonIndex = prefix.indexOf(':', 'postgresql://'.length);
  if (colonIndex === -1) {
    return url;
  }
  
  const userPart = prefix.substring(0, colonIndex);
  const password = prefix.substring(colonIndex + 1);
  const encodedPassword = encodeURIComponent(password);
  
  const fixedUrl = `${userPart}:${encodedPassword}@${suffix}`;
  return fixedUrl;
}

let databaseUrl = process.env.DATABASE_URL;
databaseUrl = fixSupabaseUrl(databaseUrl);

const connection = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  max: 5,
});
const db = drizzle(connection);

// Enhanced storage interface with all CRM operations
export interface IStorage {
  // Session management
  sessionStore: session.Store;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  searchClients(searchTerm: string): Promise<Client[]>;

  // Leads (Sales Pipeline)
  getLead(id: string): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  convertLeadToClient(leadId: string): Promise<{ lead: Lead; client: Client } | undefined>;

  // Jobs
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByStatus(status: string): Promise<Job[]>;
  getJobsByClient(clientId: string): Promise<Job[]>;
  getJobsByDateRange(startDate: Date, endDate: Date): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  getBookingsByDate(date: Date): Promise<Booking[]>;
  getBookingsByClient(clientId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByClient(clientId: string): Promise<Message[]>;
  getAllMessages(): Promise<Message[]>;
  getConversations(): Promise<Array<{ clientId: string; lastMessage: Message; unreadCount: number }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<Message | undefined>;

  // Services
  getService(id: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByClient(clientId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Contact Activities
  getContactActivity(id: string): Promise<ContactActivity | undefined>;
  getActivitiesByClient(clientId: string): Promise<ContactActivity[]>;
  getActivitiesByType(activityType: string): Promise<ContactActivity[]>;
  createContactActivity(activity: InsertContactActivity): Promise<ContactActivity>;
  updateContactActivity(id: string, updates: Partial<InsertContactActivity>): Promise<ContactActivity | undefined>;
  deleteContactActivity(id: string): Promise<boolean>;

  // Follow-ups
  getFollowUp(id: string): Promise<FollowUp | undefined>;
  getFollowUpsByClient(clientId: string): Promise<FollowUp[]>;
  getFollowUpsByAssignee(assignedTo: string): Promise<FollowUp[]>;
  getPendingFollowUps(): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: string, updates: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;
  deleteFollowUp(id: string): Promise<boolean>;

  // Analytics
  getDashboardStats(): Promise<{
    totalClients: number;
    totalJobs: number;
    totalRevenue: number;
    activeLeads: number;
    completedJobsThisMonth: number;
    pendingBookings: number;
  }>;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: databaseUrl,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const userWithHashedPassword = { ...user, password: hashedPassword };
    
    const result = await db.insert(users).values(userWithHashedPassword).returning();
    return result[0];
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0];
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db.update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  async searchClients(searchTerm: string): Promise<Client[]> {
    return await db.select().from(clients)
      .where(
        or(
          ilike(clients.name, `%${searchTerm}%`),
          ilike(clients.email, `%${searchTerm}%`),
          ilike(clients.phone, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(clients.createdAt));
  }

  // Leads
  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.status, status as any)).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  async convertLeadToClient(leadId: string): Promise<{ lead: Lead; client: Client } | undefined> {
    const lead = await this.getLead(leadId);
    if (!lead) return undefined;

    // Create client from lead data
    const client = await this.createClient({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address || '',
      tags: [],
      status: 'active',
      notes: lead.notes || '',
    });

    // Update lead with client reference and mark as won
    const updatedLead = await this.updateLead(leadId, {
      status: 'won',
      clientId: client.id,
    });

    if (!updatedLead) return undefined;

    return { lead: updatedLead, client };
  }

  // Jobs
  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, status as any)).orderBy(desc(jobs.scheduledDate));
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.clientId, clientId)).orderBy(desc(jobs.scheduledDate));
  }

  async getJobsByDateRange(startDate: Date, endDate: Date): Promise<Job[]> {
    return await db.select().from(jobs)
      .where(
        and(
          gte(jobs.scheduledDate, startDate),
          lte(jobs.scheduledDate, endDate)
        )
      )
      .orderBy(jobs.scheduledDate);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.status, status as any)).orderBy(bookings.date);
  }

  async getBookingsByDate(date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(bookings)
      .where(
        and(
          gte(bookings.date, startOfDay),
          lte(bookings.date, endOfDay)
        )
      )
      .orderBy(bookings.time);
  }

  async getBookingsByClient(clientId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.clientId, clientId)).orderBy(desc(bookings.date));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async getMessagesByClient(clientId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.clientId, clientId)).orderBy(messages.sentAt);
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.sentAt));
  }

  async getConversations(): Promise<Array<{ clientId: string; lastMessage: Message; unreadCount: number }>> {
    // Get the latest message for each client
    const latestMessages = await db.execute(sql`
      SELECT DISTINCT ON (client_id) 
        client_id, 
        id, 
        type, 
        direction, 
        content, 
        status, 
        sent_at, 
        delivered_at, 
        read_at, 
        sent_by, 
        created_at
      FROM messages 
      ORDER BY client_id, sent_at DESC
    `);

    // Get unread counts for each client
    const unreadCounts = await db.execute(sql`
      SELECT client_id, COUNT(*) as unread_count
      FROM messages 
      WHERE direction = 'inbound' AND status != 'read'
      GROUP BY client_id
    `);

    const unreadMap = new Map();
    (unreadCounts as any).forEach((row: any) => {
      unreadMap.set(row.client_id, parseInt(row.unread_count));
    });

    return (latestMessages as any).map((row: any) => ({
      clientId: row.client_id,
      lastMessage: {
        id: row.id,
        clientId: row.client_id,
        type: row.type,
        direction: row.direction,
        content: row.content,
        status: row.status,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        readAt: row.read_at,
        sentBy: row.sent_by,
        createdAt: row.created_at,
      },
      unreadCount: unreadMap.get(row.client_id) || 0,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set({ status: 'read', readAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  // Services
  async getService(id: string): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.name);
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db.update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return result[0];
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  // Debug method to check database connection
  async getDebugInfo(): Promise<any> {
    const [
      clientsCount,
      leadsCount,
      jobsCount,
      bookingsCount,
      messagesCount,
      servicesCount,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM clients`),
      db.execute(sql`SELECT COUNT(*) as count FROM leads`),
      db.execute(sql`SELECT COUNT(*) as count FROM jobs`),
      db.execute(sql`SELECT COUNT(*) as count FROM bookings`),
      db.execute(sql`SELECT COUNT(*) as count FROM messages`),
      db.execute(sql`SELECT COUNT(*) as count FROM services`),
    ]);

    return {
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      table_counts: {
        clients: (clientsCount as any)[0]?.count || 0,
        leads: (leadsCount as any)[0]?.count || 0,
        jobs: (jobsCount as any)[0]?.count || 0,
        bookings: (bookingsCount as any)[0]?.count || 0,
        messages: (messagesCount as any)[0]?.count || 0,
        services: (servicesCount as any)[0]?.count || 0,
      }
    };
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalClients: number;
    totalJobs: number;
    totalRevenue: number;
    activeLeads: number;
    completedJobsThisMonth: number;
    pendingBookings: number;
  }> {
    try {
      // Use proper SQL with explicit casting to avoid serialization issues
      const [
        totalClientsResult,
        totalJobsResult,
        totalRevenueResult,
        activeLeadsResult,
        completedJobsThisMonthResult,
        pendingBookingsResult,
      ] = await Promise.all([
        db.execute(sql`SELECT COUNT(*)::int as count FROM clients WHERE status = 'active'`),
        db.execute(sql`SELECT COUNT(*)::int as count FROM jobs`),
        db.execute(sql`SELECT COALESCE(SUM(cost::numeric), 0)::numeric as total FROM jobs WHERE status = 'completed'`),
        db.execute(sql`SELECT COUNT(*)::int as count FROM leads WHERE status IN ('lead', 'contacted', 'proposal')`),
        db.execute(sql`SELECT COUNT(*)::int as count FROM jobs WHERE status = 'completed' AND completed_at >= date_trunc('month', now())`),
        db.execute(sql`SELECT COUNT(*)::int as count FROM bookings WHERE status = 'pending'`),
      ]);

      return {
        totalClients: Number((totalClientsResult as any)[0]?.count || 0),
        totalJobs: Number((totalJobsResult as any)[0]?.count || 0),
        totalRevenue: Number((totalRevenueResult as any)[0]?.total || 0),
        activeLeads: Number((activeLeadsResult as any)[0]?.count || 0),
        completedJobsThisMonth: Number((completedJobsThisMonthResult as any)[0]?.count || 0),
        pendingBookings: Number((pendingBookingsResult as any)[0]?.count || 0),
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      // Fallback to safe values if database query fails
      return {
        totalClients: 0,
        totalJobs: 0,
        totalRevenue: 0,
        activeLeads: 0,
        completedJobsThisMonth: 0,
        pendingBookings: 0,
      };
    }
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result[0];
  }

  async getPropertiesByClient(clientId: string): Promise<Property[]> {
    return await db.select().from(properties)
      .where(and(eq(properties.clientId, clientId), eq(properties.isActive, true)))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const result = await db.update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return result[0];
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.update(properties)
      .set({ isActive: false })
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  // Contact Activities
  async getContactActivity(id: string): Promise<ContactActivity | undefined> {
    const result = await db.select().from(contactActivities).where(eq(contactActivities.id, id)).limit(1);
    return result[0];
  }

  async getActivitiesByClient(clientId: string): Promise<ContactActivity[]> {
    return await db.select().from(contactActivities)
      .where(eq(contactActivities.clientId, clientId))
      .orderBy(desc(contactActivities.scheduledAt));
  }

  async getActivitiesByType(activityType: string): Promise<ContactActivity[]> {
    return await db.select().from(contactActivities)
      .where(eq(contactActivities.activityType, activityType as any))
      .orderBy(desc(contactActivities.scheduledAt));
  }

  async createContactActivity(activity: InsertContactActivity): Promise<ContactActivity> {
    const result = await db.insert(contactActivities).values(activity).returning();
    return result[0];
  }

  async updateContactActivity(id: string, updates: Partial<InsertContactActivity>): Promise<ContactActivity | undefined> {
    const result = await db.update(contactActivities)
      .set(updates)
      .where(eq(contactActivities.id, id))
      .returning();
    return result[0];
  }

  async deleteContactActivity(id: string): Promise<boolean> {
    const result = await db.delete(contactActivities).where(eq(contactActivities.id, id)).returning();
    return result.length > 0;
  }

  // Follow-ups
  async getFollowUp(id: string): Promise<FollowUp | undefined> {
    const result = await db.select().from(followUps).where(eq(followUps.id, id)).limit(1);
    return result[0];
  }

  async getFollowUpsByClient(clientId: string): Promise<FollowUp[]> {
    return await db.select().from(followUps)
      .where(eq(followUps.clientId, clientId))
      .orderBy(followUps.scheduledDate);
  }

  async getFollowUpsByAssignee(assignedTo: string): Promise<FollowUp[]> {
    return await db.select().from(followUps)
      .where(eq(followUps.assignedTo, assignedTo))
      .orderBy(followUps.scheduledDate);
  }

  async getPendingFollowUps(): Promise<FollowUp[]> {
    return await db.select().from(followUps)
      .where(eq(followUps.status, 'pending'))
      .orderBy(followUps.scheduledDate);
  }

  async createFollowUp(followUp: InsertFollowUp): Promise<FollowUp> {
    const result = await db.insert(followUps).values(followUp).returning();
    return result[0];
  }

  async updateFollowUp(id: string, updates: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const result = await db.update(followUps)
      .set(updates)
      .where(eq(followUps.id, id))
      .returning();
    return result[0];
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const result = await db.delete(followUps).where(eq(followUps.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();