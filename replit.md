# Pomodoro Timer Application

## Overview

This is a productivity-focused Pomodoro timer application built with React and TypeScript. The application follows the Pomodoro Technique, allowing users to work in focused 25-minute sessions followed by short breaks. It features a clean, distraction-free interface with Material Design inspiration, customizable settings, and session tracking functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system implementation
- **State Management**: React hooks with local state and localStorage persistence
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Design System
- **Component Library**: Custom components following shadcn/ui patterns with Radix UI accessibility
- **Theme System**: CSS custom properties with light/dark mode support
- **Typography**: Inter font family via Google Fonts with tabular numbers for timer display
- **Color Palette**: Semantic color tokens with HSL values for theme consistency
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Backend Architecture
- **Server**: Express.js with TypeScript in ESM format
- **API Structure**: RESTful endpoints with `/api` prefix
- **Middleware**: Request logging, JSON parsing, and error handling
- **Development**: Hot module replacement via Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Local Storage**: Browser localStorage for user preferences and session data
- **Session Storage**: In-memory storage implementation for development

### Component Architecture
- **Timer Core**: Central PomodoroTimer component managing all timer state
- **Timer Display**: Circular progress indicator with SVG-based visualization
- **Controls**: Play/pause/reset/settings button interface
- **Session Tracking**: Progress visualization with tomato icons and daily goals
- **Settings Modal**: Configurable work/break durations and preferences
- **Theme Toggle**: System/manual theme switching capability

### State Management Pattern
- **Local State**: React useState for timer state, settings, and UI controls
- **Persistent State**: localStorage integration for settings and session history
- **Effect Management**: useEffect hooks for timer intervals and keyboard shortcuts
- **Custom Hooks**: Reusable logic for mobile detection and toast notifications

## External Dependencies

### Core Technologies
- **React Ecosystem**: react-dom, @types/react for TypeScript support
- **Build Tools**: Vite with TypeScript, PostCSS, and Autoprefixer
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for schema validation

### UI/UX Libraries
- **Component Primitives**: @radix-ui/react-* components for accessibility
- **Styling**: tailwindcss with class-variance-authority for component variants
- **Icons**: lucide-react for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESM modules with proper import/export patterns
- **Development Server**: Vite with HMR and development middleware
- **Error Handling**: @replit/vite-plugin-runtime-error-modal for development

### Production Dependencies
- **Server Runtime**: Express.js with security middleware
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Date Handling**: date-fns for time calculations and formatting
- **Validation**: zod for runtime type checking and schema validation