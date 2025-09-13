# MaidsforHire CRM

## Overview

MaidsforHire CRM is a comprehensive customer relationship management and job management system designed specifically for cleaning service businesses. The system integrates lead management, client communications, booking systems, job tracking, and staff management into a unified platform. It features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a comprehensive design system using CSS variables
- **Theme System**: Dark/light mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with structured error handling
- **Middleware**: Custom logging, JSON parsing, and CORS handling
- **Development**: Vite integration for hot module replacement

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with SSL support

### Core Data Models
- **Users**: Staff authentication and role management
- **Clients**: Customer profiles with contact information and tags
- **Leads**: Sales pipeline management with status tracking
- **Bookings**: Scheduled services with client and staff assignments
- **Jobs**: Work order tracking from scheduled to completed
- **Services**: Service catalog with pricing and duration
- **Messages**: Two-way communication (SMS/email) tracking

### Authentication & Security
- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Prepared for session-based authentication
- **Input Validation**: Zod schemas for request/response validation
- **Environment Variables**: Secure configuration management

### Design System
- **Component Library**: Shadcn/ui components with custom theming
- **Typography**: Inter font family via Google Fonts
- **Color System**: HSL-based color palette with semantic color assignments
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA labels and keyboard navigation support

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **bcrypt**: Password hashing and verification
- **zod**: Schema validation and type inference

### UI and Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for components
- **lucide-react**: Icon library

### Development Tools
- **vite**: Frontend build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

### Communication Services
- **@sendgrid/mail**: Email service integration (configured but not yet implemented)

### Build and Deployment
- **Replit**: Deployment platform with custom Vite plugins
- **PostCSS**: CSS processing with Autoprefixer
- **ESLint/Prettier**: Code quality and formatting (implicit through tooling)