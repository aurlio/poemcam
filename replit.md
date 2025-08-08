# PoemLens - AI Poetry from Photos

## Overview

PoemLens is a Progressive Web Application (PWA) that generates beautiful AI-powered poetry from user-uploaded photos. Users can capture or upload images, and the application uses OpenAI's GPT-4o model to analyze the visual content and create poems in both English and Chinese. The app features a modern, mobile-first design with camera integration, poem management, and social sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **PWA Features**: Service Worker implementation for offline capabilities and app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **File Upload**: Multer middleware for handling multipart form data and image uploads
- **Storage**: In-memory storage implementation with interface for easy database migration
- **API Design**: RESTful endpoints for poem CRUD operations and image analysis

### Data Storage Solutions
- **Current**: In-memory storage using Maps for development and testing
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions ready for production deployment
- **Tables**: Users table for future authentication and Poems table storing image URLs, descriptions, and bilingual poetry content
- **Session Management**: Connect-pg-simple for PostgreSQL session storage when database is connected

### Authentication and Authorization
- **Current State**: Basic user schema defined but authentication not implemented
- **Prepared Infrastructure**: User management interfaces and schema ready for login/registration features
- **Session Handling**: Express session configuration prepared for user authentication

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for image analysis and bilingual poem generation
- **Vision Capabilities**: Image-to-text analysis for understanding visual content and context

### Database Services
- **Neon Database**: Serverless PostgreSQL database configured via DATABASE_URL environment variable
- **Drizzle Kit**: Database migrations and schema management tools

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Google Fonts**: Inter for UI text, Crimson Text for English poetry, Noto Sans SC for Chinese text
- **Lucide React**: Modern icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with HMR, optimized bundling, and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type safety across the entire application stack
- **Replit Integration**: Custom plugins for development environment integration

### Media and File Handling
- **Browser APIs**: Camera access via getUserMedia for photo capture functionality
- **Canvas API**: Image processing and manipulation for photo capture and optimization
- **File System API**: Local file handling for image uploads and processing

### Progressive Web App
- **Service Worker**: Custom caching strategy for offline functionality
- **Web App Manifest**: PWA configuration for installation and app-like behavior
- **Responsive Design**: Mobile-first approach with touch-optimized interactions
- **Deployment**: Complete nginx deployment guide with HTTPS, security headers, and production configuration