# Well Asset Development Co., Ltd - Real Estate Platform

## Overview
A luxury real estate web platform with modern white/gold/dark gray design. Features property browsing with filters, detailed property pages, inquiry submission, and a complete admin dashboard for managing properties, agents, and inquiries.

## Recent Changes
- **2025-01-29**: Complete implementation with multi-language support and Bangladesh localization
  - **UI Refresh & Color Scheme**:
    - Implemented modern teal/coral color scheme (Primary: teal #14b8a6, Accent: coral #f97316)
    - Updated design system for both light and dark modes
    - Removed admin button from navbar (access only via /admin route)
  
  - **Hero Carousel**:
    - Built auto-playing carousel with embla-carousel-react and Framer Motion
    - 5-second auto-advance with smooth transitions
    - Manual navigation controls (prev/next buttons, dot indicators)
    - Fully language-aware with property data localization
    - Image null guard with gradient fallback
  
  - **Eye-catching Animations**:
    - Scroll animations using Framer Motion
    - Property card hover effects (image scale, gradient overlay)
    - Staggered entrance animations
    - Smooth page transitions throughout
  
  - **Complete Multi-language Support (English/Bangla)**:
    - Comprehensive i18n system with 90+ translation keys
    - Language switcher with Lucide icons (Globe, Check - NO emojis)
    - Data-testid attributes added to all dropdown items
    - Full UI translation across all pages
    - Property data localization (title, location, description, features)
    - Language preference stored in localStorage
  
  - **Bangladesh/Dhaka Market Focus**:
    - Currency changed from USD to BDT (৳) across ALL pages
    - Database schema extended with Bangla fields (titleBn, locationBn, descriptionBn, featuresBn)
    - Database reseeded with 6 Bangladesh/Dhaka properties
    - All properties have comprehensive Bangla translations
    - Locations: Gulshan, Banani, Dhanmondi, Motijheel, Uttara, Bashundhara
  
  - **Technical Implementation**:
    - Created usePropertyText helper for language-aware property display
    - Updated all components to use localized content (Home, Properties, Property Details, Hero Carousel)
    - PostgreSQL database with standard pg driver (node-postgres)
    - DatabaseStorage with all CRUD operations
    - Full i18n support across all pages
    - Proper data-testid attributes for testing
  
  - **E2E Testing**: Comprehensive testing completed and PASSED
    - All currency displays verified as BDT (৳)
    - Language switching tested (EN ↔ BN)
    - Hero carousel functionality verified
    - All animations working smoothly
    - No blocking issues found

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
- **Target Market**: Bangladesh/Dhaka real estate market
- **Currency**: Bangladeshi Taka (৳ BDT) - displayed everywhere
- **Languages**: English and Bangla (full bilingual support)
- **Design**: Modern luxury aesthetic with teal (#14b8a6) and coral (#f97316) color scheme
- **Typography**: Inter for body text, Poppins for headings/display
- **Spacing**: Generous whitespace, elegant grid layouts
- **Animations**: Eye-catching animations with Framer Motion, smooth transitions, hover effects
- **Admin Access**: Only via /admin route (no button in navbar)

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
