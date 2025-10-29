# Well Asset Development Co., Ltd - Real Estate Platform

## Overview
A luxury real estate web platform with modern white/gold/dark gray design. Features property browsing with filters, detailed property pages, inquiry submission, and a complete admin dashboard for managing properties, agents, and inquiries.

## Recent Changes
- **2025-01-29**: Initial implementation of complete MVP
  - Created all data schemas for properties, agents, inquiries, and users
  - Built all frontend components with luxury aesthetic
  - Generated property images using AI
  - Configured design system with Inter/Poppins fonts and gold accent colors
  - Implemented public-facing pages: Home, Properties (with filters), Property Details, About, Contact
  - Implemented admin pages: Login, Dashboard, Properties Management, Agents Management, Inquiries Management
  - Created responsive navbar and footer components
  - Set up admin sidebar navigation with proper routing
  - Implemented complete backend with JWT auth, CRUD operations
  - **Database Migration to PostgreSQL**:
    - Migrated from in-memory storage to PostgreSQL with Drizzle ORM
    - Created server/db.ts using standard pg driver (node-postgres)
    - Implemented DatabaseStorage with all CRUD operations
    - Created database tables: users, properties, agents, inquiries
    - Seeded database with 6 sample luxury properties
    - All data now persists across server restarts
  - **Bug Fixes**:
    - Fixed property details page to use custom queryFn for single property fetch
    - Added comprehensive data-testid attributes to all interactive elements
    - Added proper error handling to property details page
    - Enhanced loading and error states across all pages
    - Fixed routing to properly handle admin login page

## Project Architecture

### Frontend Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS with custom design tokens
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Shadcn/ui (Radix UI primitives)

### Backend Stack (To be implemented)
- **Runtime**: Node.js with Express
- **Storage**: In-memory storage (MemStorage)
- **Authentication**: JWT with bcrypt
- **File Uploads**: Multer
- **Validation**: Zod schemas

### Data Models
- **Properties**: title, price, type, location, bedrooms, bathrooms, area, description, features, status, images, agentId
- **Agents**: name, email, phone, profileImage
- **Inquiries**: name, email, phone, message, propertyId, status (unread/read/resolved)
- **Users**: name, email, password, role (admin/editor)

## User Preferences
- Design: Luxury aesthetic with white (#FFFFFF), gold (#D4AF37), dark gray (#1C1C1C)
- Typography: Inter for body text, Poppins for headings/display
- Spacing: Generous whitespace, elegant grid layouts
- Animations: Subtle hover effects, smooth transitions

## Features

### Public Website
1. **Home Page**
   - Full-width hero banner with luxury property image
   - Featured properties section (6 properties grid)
   - Company introduction
   - Latest listings section (9 properties grid)
   - Call-to-action section

2. **Property Listings Page**
   - Sidebar filters: search, property type, bedrooms, price range
   - Responsive grid layout (3/2/1 columns)
   - Property cards with images, specs, and pricing
   - Real-time filter updates

3. **Property Details Page**
   - Image gallery with thumbnails
   - Full property specifications
   - Description and features list
   - Google Maps location placeholder
   - Inquiry form sidebar

4. **About Page**
   - Company story and mission
   - Core values showcase
   - Statistics and achievements

5. **Contact Page**
   - Contact information cards (phone, email, office)
   - Contact form
   - Office hours
   - Map placeholder

### Admin Dashboard
1. **Login Page**
   - JWT-based authentication
   - Protected routes

2. **Dashboard**
   - Overview statistics cards
   - Recent inquiries feed
   - Quick stats summary

3. **Properties Management**
   - View all properties in table format
   - Add/Edit/Delete properties
   - Form validation
   - Status management (active/sold/pending)

4. **Agents Management**
   - View all agents
   - Add/Edit/Delete agents
   - Contact information management

5. **Inquiries Management**
   - View all customer inquiries
   - Status updates (unread/read/resolved)
   - Contact details display
   - Property association

## File Structure
```
client/
  src/
    components/
      ui/          - Shadcn UI components
      navbar.tsx   - Public site navigation
      footer.tsx   - Public site footer
      admin-sidebar.tsx - Admin navigation
    pages/
      home.tsx
      properties.tsx
      property-details.tsx
      about.tsx
      contact.tsx
      admin/
        login.tsx
        dashboard.tsx
        properties.tsx
        agents.tsx
        inquiries.tsx
    App.tsx        - Main app with routing
    index.css      - Global styles with design tokens
shared/
  schema.ts        - Shared TypeScript types and Zod schemas
server/
  routes.ts        - API endpoints (to be implemented)
  storage.ts       - Data storage interface (to be implemented)
```

## API Endpoints (To be implemented)
- POST /api/auth/login - Admin authentication
- GET /api/properties - List all properties
- POST /api/properties - Create property
- PUT /api/properties/:id - Update property
- DELETE /api/properties/:id - Delete property
- GET /api/agents - List all agents
- POST /api/agents - Create agent
- PUT /api/agents/:id - Update agent
- DELETE /api/agents/:id - Delete agent
- GET /api/inquiries - List all inquiries
- POST /api/inquiries - Submit inquiry
- PUT /api/inquiries/:id - Update inquiry status

## Running the Project
- Workflow "Start application" runs `npm run dev`
- Frontend: Vite dev server
- Backend: Express server on same port
- Auto-restart on file changes

## Next Steps
1. Implement backend API endpoints
2. Set up JWT authentication
3. Connect frontend to backend
4. Add proper error handling
5. Test all user journeys
