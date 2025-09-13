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
  users,
  clients,
  leads,
  jobs,
  bookings,
  messages,
  services
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, sql, and, ilike, or, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const connection = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 10,
});
const db = drizzle(connection);

// Enhanced storage interface with all CRM operations
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

export class DatabaseStorage implements IStorage {
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
      // Use drizzle ORM queries instead of raw SQL to avoid date issues
      const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients).where(eq(clients.status, 'active'));
      const totalJobs = await db.select({ count: sql<number>`count(*)` }).from(jobs);
      const totalRevenue = await db.select({ total: sql<number>`COALESCE(SUM(CAST(${jobs.cost} AS DECIMAL)), 0)` }).from(jobs).where(eq(jobs.status, 'completed'));
      const activeLeads = await db.select({ count: sql<number>`count(*)` }).from(leads).where(sql`${leads.status} IN ('lead', 'contacted', 'proposal')`);
      const completedJobsThisMonth = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'completed'));
      const pendingBookings = await db.select({ count: sql<number>`count(*)` }).from(bookings).where(eq(bookings.status, 'pending'));

      return {
        totalClients: totalClients[0]?.count || 0,
        totalJobs: totalJobs[0]?.count || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeLeads: activeLeads[0]?.count || 0,
        completedJobsThisMonth: completedJobsThisMonth[0]?.count || 0,
        pendingBookings: pendingBookings[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();