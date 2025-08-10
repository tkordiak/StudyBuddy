# TailoredApply - AI Resume & Cover Letter Generator

## Overview

TailoredApply is a production-ready full-stack web application that generates tailored resumes and cover letters for specific companies using AI. The application allows users to input their target role and company information, upload or paste their resume content, and receive customized application materials optimized for ATS systems and company-specific requirements.

The application features a modern React frontend with TypeScript, a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and integrates with OpenAI's API for content generation. Users can authenticate via magic links, manage credits through Stripe payments, and export their generated materials in multiple formats.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Polish (user communicates in Polish)

## Recent Changes

### Authentication System - January 10, 2025
- Successfully implemented magic link authentication system
- Fixed session management for Replit environment  
- Email integration with SMTP working
- User can now access full application functionality
- Application deployed at: https://study-buddy-TomaszKordiak.replit.app
- Fixed deployment URL configuration for magic link emails

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication Flow**: Context-based auth provider with protected routes

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express-session with configurable storage backends
- **Authentication**: Magic link-based passwordless authentication using JWT tokens
- **File Processing**: Multer for file uploads with support for PDF and DOCX parsing
- **API Design**: RESTful endpoints with proper error handling and request validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Four main entities - users, generations, uploads, and magic_links
- **Session Storage**: Configurable between memory store (development) and persistent storage (production)
- **File Storage**: Memory-based file processing with text extraction and validation

### Authentication and Authorization
- **Authentication Method**: Magic link-based passwordless system via email
- **Session Management**: HTTP-only cookies with secure flags in production
- **Route Protection**: Middleware-based authentication checks for protected endpoints
- **User Management**: Email-based user identification with automatic account creation
- **Security**: CSRF protection through SameSite cookies and session validation

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for generating tailored resume and cover letter content
- **Content Generation**: System prompts optimized for ATS-friendly, company-specific output
- **Token Management**: Usage tracking and rate limiting for cost control

### Payment Processing
- **Stripe**: Complete payment infrastructure for credit purchases and subscriptions
- **Billing Models**: One-time credit purchases and recurring subscription plans
- **Customer Management**: Stripe customer creation and subscription tracking

### Email Services
- **Nodemailer**: SMTP-based email delivery for magic link authentication
- **Email Templates**: HTML email templates for authentication and notifications
- **Configuration**: Environment-based SMTP settings for different deployment environments

### File Processing
- **PDF Parsing**: pdf-parse library for extracting text from PDF documents
- **DOCX Processing**: Mammoth.js for Microsoft Word document text extraction
- **Document Export**: DOCX library for generating formatted Word documents
- **PDF Generation**: Puppeteer for creating PDF versions of generated content

### Development and Deployment
- **Build System**: Vite with TypeScript compilation and bundling
- **Database Migrations**: Drizzle Kit for schema migrations and database management
- **Environment Configuration**: Environment variables for API keys, database URLs, and service configurations
- **Replit Integration**: Development environment optimizations and runtime error handling