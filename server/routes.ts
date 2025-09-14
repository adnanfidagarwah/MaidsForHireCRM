import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertLeadSchema, insertJobSchema, insertBookingSchema, insertMessageSchema, insertServiceSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first - based on blueprint:javascript_auth_all_persistance
  setupAuth(app);
  // Helper function for error handling
  const handleError = (res: any, error: unknown) => {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  };

  // DASHBOARD ANALYTICS
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  // DEBUG ENDPOINT - Check database connection and table counts
  app.get("/api/debug/db-info", async (req, res) => {
    try {
      const debugInfo = await storage.getDebugInfo();
      res.json(debugInfo);
    } catch (error) {
      handleError(res, error);
    }
  });

  // CLIENTS ENDPOINTS
  app.get("/api/clients", async (req, res) => {
    try {
      const { search } = req.query;
      let clients;
      
      if (search && typeof search === 'string') {
        clients = await storage.searchClients(search);
      } else {
        clients = await storage.getAllClients();
      }
      
      res.json(clients);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid client data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, updates);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // LEADS ENDPOINTS (Sales Pipeline)
  app.get("/api/leads", async (req, res) => {
    try {
      const { status } = req.query;
      let leads;
      
      if (status && typeof status === 'string') {
        leads = await storage.getLeadsByStatus(status);
      } else {
        leads = await storage.getAllLeads();
      }
      
      res.json(leads);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const updates = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, updates);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/leads/:id/convert", async (req, res) => {
    try {
      const result = await storage.convertLeadToClient(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Lead not found or conversion failed" });
      }
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  // JOBS ENDPOINTS
  app.get("/api/jobs", async (req, res) => {
    try {
      const { status, clientId, startDate, endDate } = req.query;
      let jobs;
      
      if (status && typeof status === 'string') {
        jobs = await storage.getJobsByStatus(status);
      } else if (clientId && typeof clientId === 'string') {
        jobs = await storage.getJobsByClient(clientId);
      } else if (startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
        jobs = await storage.getJobsByDateRange(new Date(startDate), new Date(endDate));
      } else {
        jobs = await storage.getAllJobs();
      }
      
      res.json(jobs);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const updates = insertJobSchema.partial().parse(req.body);
      
      // If completing a job, set completedAt
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
      }
      
      const job = await storage.updateJob(req.params.id, updates);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // BOOKINGS ENDPOINTS
  app.get("/api/bookings", async (req, res) => {
    try {
      const { status, date, clientId } = req.query;
      let bookings;
      
      if (status && typeof status === 'string') {
        bookings = await storage.getBookingsByStatus(status);
      } else if (date && typeof date === 'string') {
        bookings = await storage.getBookingsByDate(new Date(date));
      } else if (clientId && typeof clientId === 'string') {
        bookings = await storage.getBookingsByClient(clientId);
      } else {
        bookings = await storage.getAllBookings();
      }
      
      res.json(bookings);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const updates = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // MESSAGES ENDPOINTS (Messaging Center)
  app.get("/api/messages", async (req, res) => {
    try {
      const { clientId } = req.query;
      let messages;
      
      if (clientId && typeof clientId === 'string') {
        messages = await storage.getMessagesByClient(clientId);
      } else {
        messages = await storage.getAllMessages();
      }
      
      res.json(messages);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // TODO: Integrate with Twilio/SendGrid here based on message type
      // For SMS: use Twilio API
      // For Email: use SendGrid API
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      handleError(res, error);
    }
  });

  // SERVICES ENDPOINTS
  app.get("/api/services", async (req, res) => {
    try {
      const { active } = req.query;
      let services;
      
      if (active === 'true') {
        services = await storage.getActiveServices();
      } else {
        services = await storage.getAllServices();
      }
      
      res.json(services);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const updates = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, updates);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}