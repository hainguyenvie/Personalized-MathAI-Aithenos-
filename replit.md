# Overview

Tri Thức Vàng is a Vietnamese educational platform that provides personalized learning experiences through adaptive learning paths and gamified content. The platform combines traditional learning with modern technology to create an engaging educational environment where students can assess their knowledge, follow customized learning routes, and participate in game-show style quizzes to reinforce their understanding.

The application is built as a full-stack web application with a React frontend and Express backend, featuring a comprehensive learning management system that adapts to individual student needs and learning patterns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, utilizing a modern component-based architecture. The frontend implements a Single Page Application (SPA) pattern using Wouter for client-side routing. The UI framework is based on Radix UI components with Tailwind CSS for styling, following the shadcn/ui design system for consistent component patterns.

Key architectural decisions include:
- **Component Structure**: Modular component design with reusable UI components in `/components/ui/`
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Navigation**: Client-side routing with Wouter for seamless page transitions
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server-side is built with Express.js using TypeScript, following a RESTful API design pattern. The backend implements a simple but effective layered architecture with clear separation of concerns.

Core architectural components:
- **API Layer**: Express routes handling HTTP requests and responses
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Schema Definition**: Shared TypeScript types and Zod validation schemas
- **Middleware**: Request logging, error handling, and development tools integration

## Data Storage Solutions
The application uses a flexible storage architecture that can accommodate different database backends. Currently configured for PostgreSQL with Drizzle ORM as the database toolkit.

Storage design patterns:
- **ORM Integration**: Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Migration System**: Drizzle Kit for database migrations and schema management
- **Development Storage**: In-memory storage implementation for rapid development

Database entities include:
- Users (students/parents with role-based access)
- Assessments (knowledge evaluation results)
- Learning Paths (personalized study routes)
- Game Scores (gamification metrics)
- Questions (quiz and assessment content)

## Authentication and Authorization
The system implements a simple authentication mechanism with user roles (student/parent) and session-based access control. The architecture supports expansion to more sophisticated authentication systems.

## External Dependencies

### UI and Styling
- **Radix UI**: Headless component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

### Database and ORM
- **Drizzle ORM**: Type-safe SQL query builder and ORM
- **Drizzle Kit**: Schema management and migration tools
- **Neon Database**: PostgreSQL-compatible serverless database (via @neondatabase/serverless)

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins and tools

### React Ecosystem
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Wouter**: Lightweight client-side routing
- **React Day Picker**: Date selection components

### Utility Libraries
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting
- **Nanoid**: URL-safe unique ID generation
- **clsx/tailwind-merge**: Conditional CSS class handling

The architecture prioritizes developer experience, type safety, and scalability while maintaining simplicity for rapid development and iteration.