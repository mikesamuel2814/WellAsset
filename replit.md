# Well Asset Development Co., Ltd - Real Estate Platform

## Overview
A luxury real estate web platform with a modern white/gold/dark gray design. It enables property browsing with filters, detailed property pages, and inquiry submission. The platform includes a comprehensive admin dashboard for managing properties, agents, and inquiries. The project's ambition is to cater specifically to the Bangladesh/Dhaka real estate market, offering a bilingual (English/Bangla) and localized user experience.

## Admin Credentials
**Email:** `testadmin@wellasset.com`  
**Password:** `admin123`

Access the admin panel at: `/admin/login`

## User Preferences
- **Target Market**: Bangladesh/Dhaka real estate market
- **Currency**: Bangladeshi Taka (৳ BDT) - displayed everywhere
- **Languages**: English and Bangla (full bilingual support)
- **Design**: Modern luxury aesthetic with teal (#14b8a6) and coral (#f97316) color scheme
- **Typography**: Inter for body text, Poppins for headings/display
- **Spacing**: Generous whitespace, elegant grid layouts
- **Animations**: Eye-catching animations with Framer Motion, smooth transitions, hover effects
- **Admin Access**: Only via /admin route (no button in navbar)

## System Architecture

### UI/UX Decisions
The platform features a modern luxury aesthetic, utilizing a white/gold/dark gray color scheme, complemented by teal and coral accents. Typography uses Inter for body text and Poppins for headings. Generous whitespace and elegant grid layouts are prioritized for a clean look. Advanced animations with Framer Motion provide eye-catching hover effects and smooth transitions, including particle effects, parallax scrolling, and scroll-triggered animations. A transparent glassmorphism navbar adds a refined touch. Full internationalization (English/Bangla) and a dark/light theme toggle are implemented for enhanced user experience.

### Technical Implementations
- **Frontend**: Vite + React + TypeScript, styled with TailwindCSS. Wouter handles routing, TanStack Query for data fetching, and React Hook Form with Zod for validation. UI components are built with Shadcn/ui (Radix UI primitives).
- **Backend**: Node.js with Express, using Drizzle ORM for PostgreSQL. Authentication is handled via JWT.
- **Data Models**: Core entities include Properties, Agents, Inquiries, Users, siteSettings, and socialMedia.
- **Media Handling**: Property media sliders support both videos and images, with Leaflet maps integrated for property locations.
- **Map Coordinate Management**: Properties and office location support custom latitude/longitude coordinates editable from admin panel. PropertyMap component uses database coordinates with intelligent fallback to location name matching. Interactive Leaflet maps on property details and contact pages.
- **SEO Optimization**: Centralized SEO management with dynamic meta tags, Open Graph tags, Twitter cards, and JSON-LD structured data for RealEstateAgent and RealEstateListing schemas.
- **Localization**: Comprehensive i18n support across all components, including property data localization and currency display in BDT.
- **Authentication**: JWT-based authentication with protected admin routes and client-side route guards.

### Feature Specifications

#### Public Website
- **Home Page**: Hero banner, featured properties, company intro, latest listings, call-to-action.
- **Property Listings**: Filterable grid layout with property cards.
- **Property Details**: Image gallery, specifications, description, features, interactive Leaflet map (uses property coordinates from database or falls back to location matching), inquiry form.
- **About Page**: Company story, mission, values, statistics.
- **Contact Page**: Contact information, form, office hours, interactive Leaflet map showing office location from CMS-editable coordinates.

#### Admin Dashboard
- **Login**: JWT-based authentication for secure access.
- **Dashboard**: Overview statistics, recent inquiries feed.
- **Management**: CRUD operations for Properties, Agents, and Inquiries. Property form includes latitude/longitude coordinate inputs for precise map positioning.
- **CMS**: Admin interface for managing site settings and social media links. Includes office coordinate editing (office_latitude, office_longitude) in Contact Information section.
- **Profile**: Admin profile page with password update functionality (min 8 characters, validation, bcrypt hashing).

## Deployment & CI/CD

### Simple EC2 Deployment
The project uses a simplified, cost-effective AWS deployment approach:

**Architecture:**
- **Single EC2 instance** (t3.small) running Node.js with PM2 process manager
- **PostgreSQL RDS** (db.t3.micro) for managed database
- **Nginx** as reverse proxy with SSL termination
- **GitHub Actions** for automated SSH-based deployment
- **Let's Encrypt** for free SSL certificates

**Monthly Cost:** ~$25-30
- EC2 t3.small: ~$15/month
- RDS PostgreSQL db.t3.micro: ~$15/month

### Deployment Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy-ec2-simple.yml`):
1. Builds frontend application
2. Creates deployment package (tarball)
3. Uploads to EC2 via SCP over SSH
4. Executes deployment script remotely
5. Runs database migrations
6. Performs zero-downtime restart with PM2
7. Verifies health check

**Deployment Script** (`deploy.sh`):
- Stops application gracefully
- Creates backup of current version
- Extracts new version
- Installs dependencies
- Runs database migrations
- Starts application
- Performs health check
- Auto-rollback on failure

### Infrastructure Components

- **PM2 Process Manager** (`ecosystem.config.cjs`):
  - Cluster mode for reliability
  - Automatic restart on failures
  - Memory limit enforcement (1GB)
  - Log rotation and management

- **Nginx Reverse Proxy** (`nginx.conf`):
  - SSL/TLS termination
  - Gzip compression
  - Static asset caching
  - Security headers
  - WebSocket support

- **Systemd Service** (`wellasset.service`):
  - Automatic startup on server boot
  - Service restart on failure
  - Resource limits
  - Environment variable management

### Deployment Documentation

Complete setup guides available:
- **SIMPLE_EC2_SETUP.md** - Step-by-step AWS infrastructure setup
- **DEPLOYMENT.md** - Deployment overview and quick start
- **ENVIRONMENT.md** - Environment variable reference
- **.env.example** - Local development environment template

### Key Features

- **Cost-effective**: ~$25-30/month for complete production stack
- **Simple to understand**: No complex orchestration or containers
- **Automated deployments**: Push to `main` branch auto-deploys
- **Zero-downtime**: PM2 handles graceful restarts
- **Health checks**: Automatic verification and rollback
- **Database migrations**: Safe, automated schema updates
- **SSL/HTTPS**: Free certificates with Let's Encrypt
- **Monitoring**: PM2 logs and systemd journal
- **Backups**: Automated application and database backups

## External Dependencies
- **Database**: PostgreSQL (managed with Drizzle ORM)
- **Frontend Libraries**: React, TypeScript, Vite, TailwindCSS, Wouter, TanStack Query, React Hook Form, Zod, Shadcn/ui, Radix UI, next-themes, embla-carousel-react, react-leaflet, Framer Motion, @tsparticles/react.
- **Backend Libraries**: Node.js, Express, bcrypt (for password hashing), Multer (for file uploads - planned).
- **Mapping Service**: OpenStreetMap (via react-leaflet).
- **Cloud Infrastructure**: AWS (EC2, Auto Scaling, CodeDeploy, ECR, RDS, ALB, S3, Secrets Manager, CloudWatch)
- **CI/CD**: GitHub Actions with CodeDeploy