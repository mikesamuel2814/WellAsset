# Well Asset Development Co., Ltd - Design Guidelines

## Design Approach

**Selected Approach:** Luxury Real Estate Reference Design  
Drawing inspiration from premium property platforms like Sotheby's International Realty, Christie's Real Estate, and modern luxury brands with emphasis on sophisticated minimalism, generous whitespace, and premium material photography.

**Core Principles:**
- Sophisticated restraint: Luxury through refinement, not ornamentation
- Photography-first: Let property visuals dominate the experience
- Premium spacing: Generous breathing room conveys exclusivity
- Subtle elegance: Gold accents used sparingly for maximum impact

---

## Typography System

**Font Families:**
- Primary: Inter (body text, UI elements, forms)
- Display: Poppins (headings, hero text, property titles)

**Hierarchy:**
- Hero Headlines: Poppins Bold, 4xl-6xl (responsive), letter-spacing tight
- Section Titles: Poppins SemiBold, 3xl-4xl, tracking-tight
- Property Titles: Poppins Medium, xl-2xl
- Subheadings: Inter SemiBold, lg-xl
- Body Text: Inter Regular, base-lg, leading-relaxed (1.75)
- Captions/Meta: Inter Regular, sm, opacity-70
- CTAs: Poppins Medium, base-lg, tracking-wide uppercase

---

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 to py-16 (mobile)
- Grid gaps: gap-6 to gap-8
- Element margins: mb-4, mb-6, mb-8 for vertical rhythm

**Container Strategy:**
- Full-width sections with inner max-w-7xl mx-auto px-6
- Content sections: max-w-6xl for property grids
- Text content: max-w-4xl for readability
- Property details: max-w-5xl

---

## Component Library

### Navigation
- Fixed header with semi-transparent backdrop (backdrop-blur-lg)
- Logo left, horizontal nav center, CTA right
- Hamburger menu (mobile) with full-screen overlay
- Minimal divider beneath header (1px, gold at 20% opacity)

### Hero Section
- Full-viewport height (min-h-screen) with luxury property image/video background
- Dark gradient overlay (black to transparent, 70% to 0%)
- Centered content with headline, subheadline, dual CTAs
- Scroll indicator at bottom (subtle animation)
- Buttons on hero: backdrop-blur-md with semi-transparent backgrounds

### Property Cards
- Aspect ratio 4:3 for images with object-cover
- Card hover: subtle scale (1.02) with smooth transition
- Image overlay gradient on hover revealing quick stats
- Title, location, price stacked below image
- Price highlighted in gold
- "View Details" link appears on hover

### Property Listings Grid
- 3 columns desktop (grid-cols-3), 2 tablet (md:grid-cols-2), 1 mobile
- Filter sidebar (desktop) collapses to drawer (mobile)
- Filter chips for active selections
- Sort dropdown top-right

### Property Details Layout
- Large image gallery: main image with thumbnail strip below
- Two-column layout: gallery left (60%), details right (40%)
- Sticky details panel on scroll
- Google Maps embed full-width below fold
- Features grid: 2-3 columns with icons

### Forms
- Floating labels with subtle gold underline focus state
- Input fields: border-b-2 with transparent bg
- Rounded-lg elevated cards for form containers
- Submit buttons: gold background with dark gray hover
- Validation messages in small red text below fields

### Inquiry/Contact Forms
- Clean white cards with shadow-xl
- Generous padding (p-8 to p-12)
- Clear visual hierarchy
- Success state with checkmark animation

### Admin Dashboard
- Dark sidebar navigation (dark gray #1C1C1C)
- Gold accent for active nav items
- Card-based layout for metrics
- Data tables with alternating row backgrounds
- Action buttons clustered top-right of tables

### Footer
- Three-column layout: Company info, Quick links, Contact
- Gold divider line above footer
- Social icons in gold with hover effects
- Copyright centered below columns
- Minimal, sophisticated spacing

---

## Animations (Minimal Use)

- Fade-in on scroll for property cards (stagger 100ms)
- Hero text fade-up entrance (400ms delay)
- Smooth page transitions (200ms)
- Button hover scale (1.05, 150ms)
- Image gallery transitions (300ms ease)

**NO:** Complex scroll-triggered animations, parallax effects, or distracting motion

---

## Images

### Hero Images
- **Home Page:** Stunning luxury property exterior at golden hour, ultra-wide angle, professionally shot
- **Property Listings:** Elegant interior shot with natural light
- **About Page:** Architectural detail or company office exterior

### Property Images
- Professional photography: exterior, interior, amenities
- Minimum 1920x1280 resolution
- Consistent aspect ratios throughout
- Video backgrounds where available (muted autoplay)

### Placement Strategy
- Hero sections: Full-width, full-height backgrounds
- Property cards: Contained within card bounds, object-cover
- Property details: Gallery with primary image prominent
- About page: Team photos, development projects, office spaces
- Testimonials: Small circular headshots (if included)

---

## Page-Specific Layouts

### Home Page (7 sections)
1. Hero with video/image background
2. Featured properties (3-column grid, 6 properties)
3. Company introduction (centered text, max-w-3xl)
4. Latest listings (3-column grid, 9 properties)
5. Why choose us (3-column feature grid with icons)
6. Testimonials (2-column quotes with photos)
7. CTA section (centered, gold background)

### Property Listings
- Filter sidebar (left, sticky)
- Results grid (right, 3-column)
- Pagination at bottom
- "No results" state with helpful suggestions

### Property Details
- Breadcrumb navigation
- Image gallery (full-width)
- Details grid (2-column: specs left, description right)
- Map section (full-width)
- Agent contact card (sidebar)
- Related properties carousel (bottom)

### Admin Dashboard
- Sidebar navigation (fixed left)
- Main content area with page title
- Metrics cards (4-column grid)
- Recent activity feed
- Quick actions panel

This design system creates a cohesive luxury experience that positions Well Asset Development as a premium property developer while maintaining usability and conversion-focused design patterns.