// Based on blueprint:javascript_auth_all_persistance
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import rateLimit from 'express-rate-limit';
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Require SESSION_SECRET in production
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }

  // Server-side user registration schema - completely separate to prevent privilege escalation
  const serverInsertUserSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Valid email is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((password) => {
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) return false;
        // Check for at least one uppercase letter  
        if (!/[A-Z]/.test(password)) return false;
        // Check for at least one digit
        if (!/\d/.test(password)) return false;
        // Check for at least one special character
        if (!/[@$!%*?&]/.test(password)) return false;
        return true;
      }, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      })
  });

  // Rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        
        const isValid = await storage.verifyPassword(password, user.password);
        if (!isValid) {
          return done(null, false);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Manual password validation as fallback (since Zod schema validation has issues)
  const validatePasswordManually = (password: string): string | null => {
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[@$!%*?&]/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  // Authentication routes
  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      // Manual validation as fallback since Zod schema validation has issues
      const { username, email, firstName, lastName, password } = req.body;
      
      // Basic field validation
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: "Username is required" });
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: "Valid email is required" });
      }
      if (!firstName || firstName.trim().length === 0) {
        return res.status(400).json({ error: "First name is required" });
      }
      if (!lastName || lastName.trim().length === 0) {
        return res.status(400).json({ error: "Last name is required" });
      }
      
      // Password validation
      const passwordError = validatePasswordManually(password);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username.trim());
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Always assign 'staff' role to prevent privilege escalation - SECURITY FIX
      const userDataWithRole = {
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        role: 'staff' as const
      };

      const user = await storage.createUser(userDataWithRole);

      // Regenerate session on login for security
      req.session.regenerate((err) => {
        if (err) return next(err);
        
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(201).json({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Regenerate session on login for security
      req.session.regenerate((err) => {
        if (err) return next(err);
        
        req.login(user, (err) => {
          if (err) {
            console.error('Session error:', err);
            return res.status(500).json({ error: "Session creation failed" });
          }
          res.json({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      // Destroy session and clear cookie for complete logout
      req.session.destroy((err) => {
        if (err) return next(err);
        
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user;
    res.json({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  });
}