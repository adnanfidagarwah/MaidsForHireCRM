import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  clients, 
  leads, 
  jobs, 
  bookings, 
  messages, 
  services 
} from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const connection = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(connection);

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data first
    console.log("Clearing existing data...");
    await db.delete(messages);
    await db.delete(bookings);
    await db.delete(jobs);
    await db.delete(leads);
    await db.delete(clients);
    await db.delete(services);

    // Add services first
    console.log("Adding services...");
    const servicesData = [
      {
        name: "Regular Cleaning",
        description: "Standard house cleaning service",
        basePrice: "120.00",
        estimatedDuration: 120,
        isActive: true
      },
      {
        name: "Deep Cleaning",
        description: "Thorough deep cleaning service",
        basePrice: "250.00",
        estimatedDuration: 240,
        isActive: true
      },
      {
        name: "Move-out Cleaning",
        description: "Complete cleaning for move-out",
        basePrice: "300.00",
        estimatedDuration: 300,
        isActive: true
      },
      {
        name: "Office Cleaning",
        description: "Commercial office cleaning",
        basePrice: "180.00",
        estimatedDuration: 180,
        isActive: true
      }
    ];

    const insertedServices = await db.insert(services).values(servicesData).returning();
    console.log(`Added ${insertedServices.length} services`);

    // Add clients
    console.log("Adding clients...");
    const clientsData = [
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "(555) 123-4567",
        address: "123 Oak Street, Downtown",
        tags: ["VIP", "Recurring"],
        status: "active" as const,
        notes: "Prefers morning appointments. Has two cats."
      },
      {
        name: "Mike Chen",
        email: "mike@example.com", 
        phone: "(555) 234-5678",
        address: "456 Pine Avenue, Midtown",
        tags: ["Pet Owner"],
        status: "active" as const,
        notes: "Has a dog that needs to be contained during service."
      },
      {
        name: "Emma Davis",
        email: "emma@example.com",
        phone: "(555) 345-6789", 
        address: "789 Elm Drive, Suburbs",
        tags: ["New Client"],
        status: "active" as const,
        notes: "New client, very particular about eco-friendly products."
      },
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "(555) 456-7890",
        address: "321 Maple Street, Downtown", 
        tags: ["Regular"],
        status: "active" as const,
        notes: "Bi-weekly service client."
      },
      {
        name: "Alice Brown",
        email: "alice@example.com",
        phone: "(555) 567-8901",
        address: "654 Cedar Lane, Uptown",
        tags: ["Commercial"],
        status: "active" as const, 
        notes: "Office cleaning client."
      }
    ];

    const insertedClients = await db.insert(clients).values(clientsData).returning();
    console.log(`Added ${insertedClients.length} clients`);

    // Add leads
    console.log("Adding leads...");
    const leadsData = [
      {
        name: "Jennifer Williams",
        email: "jennifer@example.com",
        phone: "(555) 678-9012",
        address: "987 Birch Road, Suburbs",
        service: "Deep Cleaning",
        source: "Website",
        status: "lead" as const,
        value: "275.00",
        notes: "Interested in monthly deep cleaning service."
      },
      {
        name: "Robert Taylor",
        email: "robert@example.com",
        phone: "(555) 789-0123", 
        address: "147 Willow Ave, Downtown",
        service: "Regular Cleaning",
        source: "Referral",
        status: "contacted" as const,
        value: "150.00",
        notes: "Referred by Sarah Johnson. Needs weekly service."
      },
      {
        name: "Lisa Anderson",
        email: "lisa@example.com",
        phone: "(555) 890-1234",
        address: "258 Spruce St, Midtown", 
        service: "Move-out Cleaning",
        source: "Google Ads",
        status: "proposal" as const,
        value: "320.00",
        notes: "Moving out next month, needs thorough cleaning."
      }
    ];

    const insertedLeads = await db.insert(leads).values(leadsData).returning();
    console.log(`Added ${insertedLeads.length} leads`);

    // Add jobs
    console.log("Adding jobs...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const jobsData = [
      {
        clientId: insertedClients[0].id, // Sarah Johnson
        service: "Regular Cleaning",
        description: "Weekly cleaning service",
        address: insertedClients[0].address,
        scheduledDate: today,
        scheduledTime: "09:00",
        estimatedDuration: 120,
        status: "scheduled" as const,
        cost: "120.00",
        tips: "0.00",
        materials: ["All-purpose cleaner", "Glass cleaner", "Microfiber cloths"],
        staff: ["Maria Rodriguez"],
        notes: "Regular weekly appointment"
      },
      {
        clientId: insertedClients[1].id, // Mike Chen
        service: "Deep Cleaning",
        description: "Monthly deep cleaning",
        address: insertedClients[1].address,
        scheduledDate: today,
        scheduledTime: "14:00",
        estimatedDuration: 240,
        status: "in-progress" as const,
        cost: "250.00",
        tips: "25.00",
        materials: ["Heavy-duty cleaner", "Scrub brushes", "Vacuum"],
        staff: ["Ana Martinez", "Lisa Thompson"],
        notes: "Deep clean including appliances"
      },
      {
        clientId: insertedClients[2].id, // Emma Davis
        service: "Regular Cleaning", 
        description: "Bi-weekly cleaning",
        address: insertedClients[2].address,
        scheduledDate: tomorrow,
        scheduledTime: "10:30",
        estimatedDuration: 120,
        status: "scheduled" as const,
        cost: "120.00",
        tips: "0.00",
        materials: ["Eco-friendly cleaners", "Microfiber cloths"],
        staff: ["Maria Rodriguez"],
        notes: "Use only eco-friendly products"
      },
      {
        clientId: insertedClients[3].id, // John Smith  
        service: "Regular Cleaning",
        description: "Completed job",
        address: insertedClients[3].address,
        scheduledDate: new Date(today.getTime() - 86400000), // Yesterday
        scheduledTime: "11:00",
        estimatedDuration: 120,
        actualDuration: 110,
        status: "completed" as const,
        cost: "120.00", 
        tips: "15.00",
        materials: ["Standard cleaning supplies"],
        staff: ["Lisa Thompson"],
        notes: "Job completed successfully",
        completedAt: new Date(today.getTime() - 82800000) // Yesterday + 1 hour
      }
    ];

    const insertedJobs = await db.insert(jobs).values(jobsData).returning();
    console.log(`Added ${insertedJobs.length} jobs`);

    // Add bookings
    console.log("Adding bookings...");
    const bookingsData = [
      {
        clientId: insertedClients[4].id, // Alice Brown
        service: "Office Cleaning", 
        date: tomorrow,
        time: "08:00",
        duration: 180,
        staff: ["Ana Martinez", "Lisa Thompson"],
        address: insertedClients[4].address,
        phone: insertedClients[4].phone,
        status: "pending" as const,
        estimatedCost: "180.00",
        notes: "Office cleaning - needs confirmation"
      },
      {
        clientId: insertedClients[0].id, // Sarah Johnson
        service: "Deep Cleaning",
        date: new Date(tomorrow.getTime() + 86400000), // Day after tomorrow
        time: "13:00", 
        duration: 240,
        staff: ["Maria Rodriguez", "Ana Martinez"],
        address: insertedClients[0].address,
        phone: insertedClients[0].phone,
        status: "confirmed" as const,
        estimatedCost: "250.00",
        notes: "Monthly deep cleaning session"
      }
    ];

    const insertedBookings = await db.insert(bookings).values(bookingsData).returning();
    console.log(`Added ${insertedBookings.length} bookings`);

    // Add messages
    console.log("Adding messages...");
    const messagesData = [
      {
        clientId: insertedClients[0].id, // Sarah Johnson
        type: "sms" as const,
        direction: "outbound" as const, 
        content: "Hi Sarah! Your cleaning is scheduled for tomorrow at 9 AM. Our team will arrive on time. Thank you!",
        status: "delivered" as const,
        sentAt: new Date(today.getTime() - 3600000) // 1 hour ago
      },
      {
        clientId: insertedClients[0].id,
        type: "sms" as const,
        direction: "inbound" as const,
        content: "Perfect! Thank you for the reminder. See you tomorrow!",
        status: "read" as const,
        sentAt: new Date(today.getTime() - 1800000) // 30 min ago
      },
      {
        clientId: insertedClients[1].id, // Mike Chen
        type: "sms" as const, 
        direction: "inbound" as const,
        content: "Hi, can we reschedule today's appointment to 2 PM instead of 11 AM?",
        status: "read" as const,
        sentAt: new Date(today.getTime() - 7200000) // 2 hours ago
      },
      {
        clientId: insertedClients[1].id,
        type: "sms" as const,
        direction: "outbound" as const,
        content: "Absolutely! I've updated your appointment to 2 PM today. Thanks for letting us know!",
        status: "delivered" as const, 
        sentAt: new Date(today.getTime() - 6900000) // 1 hour 55 min ago
      }
    ];

    const insertedMessages = await db.insert(messages).values(messagesData).returning();
    console.log(`Added ${insertedMessages.length} messages`);

    console.log("Database seeding completed successfully!");
    console.log("Summary:");
    console.log(`- Services: ${insertedServices.length}`);
    console.log(`- Clients: ${insertedClients.length}`);
    console.log(`- Leads: ${insertedLeads.length}`);
    console.log(`- Jobs: ${insertedJobs.length}`);
    console.log(`- Bookings: ${insertedBookings.length}`);
    console.log(`- Messages: ${insertedMessages.length}`);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDatabase().catch(console.error);