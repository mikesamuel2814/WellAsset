# Well Asset Development Co., Ltd - Real Estate Platform

## Overview
A luxury real estate web platform with modern white/gold/dark gray design. Features property browsing with filters, detailed property pages, inquiry submission, and a complete admin dashboard for managing properties, agents, and inquiries.

## Recent Changes
- **2025-10-29 (Latest)**: Production-ready enhancements with professional media, CMS, and SEO
  - **Professional Stock Images & Videos**:
    - Downloaded 24 high-quality stock images from professional real estate library
    - Each property now has 4 unique stock images showcasing luxury spaces
    - Added 1 video URL per property for rich media galleries
    - Images stored in attached_assets/stock_images/ directory
    - PropertyMediaSlider displays videos first, then images with autoplay
  
  - **Transparent Glassmorphism Navbar**:
    - Updated navbar to bg-background/60 with backdrop-blur-xl effect
    - Creates elegant transparent/blurry appearance when scrolling
    - Maintains excellent readability with subtle shadow
    - Sticky positioning with smooth transitions
  
  - **Advanced Animations & Visual Effects**:
    - **Particle Effects**: Implemented @tsparticles/react with floating particles on home page
    - **Parallax Scrolling**: useTransform hook for smooth parallax on hero section
    - **Property Card Animations**: Framer Motion hover effects with scale and opacity
    - **Scroll-triggered Animations**: whileInView animations for sections
    - **Stagger Effects**: Sequential appearance of property cards
    - All animations optimized with memoization and FPS limits
  
  - **Full CMS (Content Management System)**:
    - **Database Schema**: Created siteSettings and socialMedia tables with timestamps
    - **Storage Layer**: Added getAllSiteSettings, updateSiteSetting, getAllSocialMedia, updateSocialMedia methods
    - **API Routes**: 
      - GET /api/cms/settings - Public endpoint for fetching settings
      - PUT /api/cms/settings/:key - Protected endpoint for updates
      - GET /api/cms/social-media - Public social media links
      - PUT /api/cms/social-media/:id - Protected social media updates
    - **Admin UI**: Created /admin/cms page with cards for Contact Info, About Content, and Social Media
    - **Features**: Real-time updates, toast notifications, auth-protected mutations, cache invalidation
    - Seeded 10+ default settings (contact phone, email, office, about mission/vision, social links)
  
  - **Production SEO Optimization**:
    - **SEOHead Component**: Centralized SEO management with dynamic meta tags
    - **Meta Tags**: title, description, keywords, OG tags, Twitter cards on all pages
    - **Structured Data (JSON-LD)**:
      - RealEstateAgent schema on home page
      - RealEstateListing schema on property details with price, location, specs
    - **Dynamic Titles**: Each page has unique, descriptive title
    - **Fixed SSR Issue**: Added typeof window check to prevent crashes in non-browser contexts
    - **Pages Optimized**: Home, Property Details, About, Contact
  
  - **E2E Testing**: Comprehensive 26-step test PASSED
    - ✅ Particle effects canvas rendering
    - ✅ Transparent glassmorphism navbar
    - ✅ Theme toggle (Light ↔ Dark)
    - ✅ Language switching (English ↔ Bangla)
    - ✅ Property media slider with 4 images + 1 video
    - ✅ Leaflet map on property details
    - ✅ Admin CMS login and updates
    - ✅ CMS setting mutations with success toasts
    - ✅ SEO meta tags and structured data verified
    - ✅ All pages responsive and functional
    - Minor: Console React warnings (non-blocking)

- **2025-10-29 (Earlier)**: Enhanced platform with complete i18n, theme support, media features, and authentication
  - **Completed Multi-language Support (English/Bangla)**:
    - Extended i18n to About page, Contact page, and Footer component
    - 90+ translation keys covering all UI text
    - Language switcher with Globe icon dropdown (no emojis, Lucide icons only)
    - Property data localization (titleBn, locationBn, descriptionBn, featuresBn)
    - Language preference persists in localStorage as "well-asset-language"
    - All components use useTranslations hook consistently
    - Data-testid attributes on all interactive elements for testing
  
  - **Dark/Light Theme Toggle**:
    - Implemented ThemeProvider using next-themes
    - Three modes: Light, Dark, System (follows OS preference)
    - ThemeToggle component in navbar with Sun/Moon icons
    - Theme persists in localStorage as "well-asset-theme"
    - Smooth transitions between themes
    - All components support both light and dark modes
  
  - **Property Media Slider**:
    - Built PropertyMediaSlider component using embla-carousel-react
    - Videos display first, then images (if videos array has content)
    - 5-second autoplay with manual controls (prev/next buttons, dot indicators, thumbnails)
    - Conditionally shows controls only when allMedia.length > 1 (UX optimization)
    - Framer Motion animations for smooth transitions
    - Full data-testid attributes for all interactive elements
    - Properly integrates with property details page
  
  - **Leaflet Map Integration**:
    - Created PropertyMap component using react-leaflet v4
    - Shows property locations on interactive OpenStreetMap
    - Dhaka-area coordinate mapping (Gulshan, Banani, Dhanmondi, Motijheel, Uttara, Bashundhara)
    - Fallback to Dhaka center (23.8103, 90.4125) for unmapped areas
    - Marker with popup showing property title and location
    - Integrated on property details page below media slider
  
  - **Authentication Middleware & Route Guards**:
    - Created AuthProvider context (client/src/lib/auth.tsx)
    - Auth state management: user, token, isAuthenticated, authHydrated
    - Login/logout functions with localStorage persistence
    - Route guards in App.tsx:
      - Logged-out users accessing /admin/* → redirect to /admin/login
      - Logged-in users accessing /admin/login → redirect to /admin/dashboard
      - Public routes remain accessible without auth
    - Auth hydration fix: Loading spinner shows while checking localStorage
    - No race condition: Route guards wait for authHydrated before redirecting
    - Updated admin login page to use auth context
    - Updated admin sidebar logout to use auth context
    - JWT token and user data stored in localStorage
    - Smooth UX: No login flash on dashboard reload
  
  - **Bangladesh/Dhaka Market Focus**:
    - Currency: BDT (৳) displayed across ALL pages
    - Contact page shows Dhaka, Bangladesh location
    - Database schema has Bangla fields (titleBn, locationBn, descriptionBn, featuresBn)
    - Properties focused on Dhaka areas (Gulshan, Banani, Dhanmondi, etc.)
  
  - **Technical Implementation**:
    - PostgreSQL database with Drizzle ORM
    - DatabaseStorage with full CRUD operations
    - React 18 with TypeScript
    - Wouter for routing
    - TanStack Query for data fetching
    - Shadcn/ui components with Radix primitives
    - Comprehensive data-testid attributes throughout
  
  - **E2E Testing**: Comprehensive testing PASSED
    - ✅ Multi-language switching (English ↔ Bangla)
    - ✅ Theme toggle (Light/Dark/System modes)
    - ✅ Property listings with BDT (৳) currency
    - ✅ Property details with media slider and map
    - ✅ Dhaka/Bangladesh market localization
    - ✅ Authentication middleware (login/logout/route guards)
    - ✅ All pages navigate correctly
    - Minor React warnings in console (don't affect functionality)
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
      ui/                    - Shadcn UI components
      navbar.tsx             - Public site navigation with language/theme toggles
      footer.tsx             - Public site footer with i18n support
      admin-sidebar.tsx      - Admin navigation with logout
      theme-provider.tsx     - Dark/light theme context provider
      theme-toggle.tsx       - Theme toggle component (Sun/Moon icons)
      language-switcher.tsx  - Language dropdown (Globe icon)
      property-media-slider.tsx - Embla carousel for images/videos
      property-map.tsx       - Leaflet map component
    lib/
      i18n.tsx              - i18n context and translations (90+ keys)
      auth.tsx              - Authentication context and provider
      queryClient.ts        - TanStack Query setup
    pages/
      home.tsx              - Landing page with hero carousel
      properties.tsx        - Property listings with filters
      property-details.tsx  - Individual property page with slider & map
      about.tsx             - About page with i18n
      contact.tsx           - Contact page with Dhaka location
      admin/
        login.tsx           - Admin login with auth context
        dashboard.tsx       - Admin overview
        properties.tsx      - Property management
        agents.tsx          - Agent management
        inquiries.tsx       - Inquiry management
    App.tsx               - Main app with routing and auth guards
    index.css             - Global styles with design tokens
shared/
  schema.ts               - Drizzle schemas and Zod validation
server/
  routes.ts               - API endpoints (PostgreSQL + Drizzle)
  storage.ts              - Database storage implementation
  db.ts                   - Database connection
```

## API Endpoints (Implemented)
- POST /api/auth/login - Admin authentication (creates user if not exists)
- GET /api/properties - List all properties with optional filters
- GET /api/properties/:id - Get single property by ID
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

## Next Steps (Future Enhancements)
1. **Image/Video Upload System**: Implement multer-based file upload for admin panel to add property media
2. **CMS Functionality**: Add admin interface to edit About page content and Contact information
3. **Token Validation**: Add JWT expiration handling and server-side token validation
4. **Auth UX**: Add loading state during auth rehydration to eliminate login page flash
5. **Search Optimization**: Enhance property search with full-text search and advanced filters
6. **Email Notifications**: Send email confirmations for inquiries
7. **Analytics Dashboard**: Add property view tracking and inquiry analytics
