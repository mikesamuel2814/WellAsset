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

### CI/CD Pipeline
The project is configured for automated deployment to AWS EC2 using GitHub Actions and CodeDeploy:

- **Continuous Integration** (`.github/workflows/ci.yml`):
  - Runs on every push and pull request
  - Automated testing with PostgreSQL service container
  - Database migration testing
  - Application build verification
  - Artifact generation

- **Continuous Deployment** (`.github/workflows/deploy-aws.yml`):
  - Automatic deployment on push to `main` branch
  - Manual deployment option for staging/production
  - Docker image building and pushing to Amazon ECR
  - Database migration execution on production
  - Creates deployment package with AppSpec and lifecycle scripts
  - Uploads to S3 and triggers CodeDeploy
  - Zero-downtime deployment with Auto Scaling Group
  - Deployment health verification

### Infrastructure
- **Compute**: EC2 instances (t3.micro) in Auto Scaling Group (2-6 instances)
- **Containerization**: Multi-stage Docker build for optimized production images
- **Container Registry**: Amazon ECR
- **Deployment**: AWS CodeDeploy with In-Place deployment strategy
- **Database**: Amazon RDS PostgreSQL (Multi-AZ optional)
- **Load Balancing**: Application Load Balancer with health checks on `/health`
- **Networking**: VPC with public and private subnets across 2 AZs
- **Storage**: S3 for CodeDeploy artifacts
- **Monitoring**: CloudWatch Logs and metrics
- **Secrets Management**: AWS Secrets Manager
- **Health Checks**: Built-in `/health` endpoint for ALB and CodeDeploy verification

### Deployment Documentation
Comprehensive deployment guides available:
- **DEPLOYMENT.md** - Overall deployment guide with AWS EC2 deployment
- **AWS_SETUP_EC2.md** - Step-by-step AWS EC2 infrastructure setup instructions
- **CICD_SETUP.md** - Quick start guide for GitHub Actions CI/CD
- **ENVIRONMENT.md** - Complete environment variable reference
- **.env.example** - Template for local development environment
- **appspec.yml** - CodeDeploy application specification
- **scripts/** - Deployment lifecycle hooks (install, start, stop, validate)
- **ec2-user-data.sh** - EC2 instance initialization script

### Key Features
- Zero-downtime deployments with CodeDeploy and Auto Scaling
- Automatic rollback on health check failures
- Database migration safety with pre-deployment schema updates
- Multi-environment support (development, staging, production)
- Secure secret management via AWS Secrets Manager
- Auto-scaling based on CPU/memory utilization (2-6 instances)
- Production-ready Docker configuration with non-root user
- Cost-effective: ~$90/month for production infrastructure

## External Dependencies
- **Database**: PostgreSQL (managed with Drizzle ORM)
- **Frontend Libraries**: React, TypeScript, Vite, TailwindCSS, Wouter, TanStack Query, React Hook Form, Zod, Shadcn/ui, Radix UI, next-themes, embla-carousel-react, react-leaflet, Framer Motion, @tsparticles/react.
- **Backend Libraries**: Node.js, Express, bcrypt (for password hashing), Multer (for file uploads - planned).
- **Mapping Service**: OpenStreetMap (via react-leaflet).
- **Cloud Infrastructure**: AWS (EC2, Auto Scaling, CodeDeploy, ECR, RDS, ALB, S3, Secrets Manager, CloudWatch)
- **CI/CD**: GitHub Actions with CodeDeploy