# CBX Experience Rental Management System

## Project Overview
A comprehensive React-based web application for managing rental properties during the CBX Experience event. The system tracks rental properties (houses), attendee assignments, arrival/exit dates, payment calculations, event scheduling, and photo management. It includes real-time updates, activity tracking, and comprehensive analytics.

## Core Features
- Multi-tier authentication (Admin and Attendee)
- Property (House) management with detailed information
- Attendee management with transportation tracking
- Booking system with date validation
- Event scheduling with optional/required status
- Photo upload and management via Azure Blob Storage
- Payment calculation and tracking
- Google Maps integration with property/event markers
- Activity logging and analytics via Application Insights
- Mobile-responsive design
- Real-time data synchronization

## Tech Stack

### Frontend
- **Framework**: React 19.1.0 with TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Routing**: React Router DOM 7.6.3
- **State Management**: Zustand 5.0.6 (with persistence)
- **Form Handling**: React Hook Form 7.60.0 with Zod validation
- **UI Components**: 
  - Shadcn UI (built on Radix UI primitives)
  - Tailwind CSS 3.4.17 for styling
  - Lucide React for icons
- **Maps**: @react-google-maps/api

### Backend & Database
- **Database**: Supabase (PostgreSQL)
  - **Project ID**: ttsharxrnbcqbmllvgwa
  - **URL**: https://ttsharxrnbcqbmllvgwa.supabase.co
  - Row Level Security (RLS) enabled
  - Real-time subscriptions
  - Custom authentication implementation
- **File Storage**: Azure Blob Storage (with SAS token authentication)
- **Analytics**: Azure Application Insights

### DevOps & Deployment
- **Hosting**: Azure Static Web Apps
- **CI/CD**: GitHub Actions
- **Version Control**: GitHub
- **Repository**: https://github.com/kabzadev/cbxrentals.git
- **AI Assistance**: Claude CLI

## Project Structure
```
cbx-rentals/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components (40+ components)
│   │   ├── auth/            # Authentication components
│   │   │   ├── AdminLoginForm.tsx
│   │   │   └── AttendeeLoginForm.tsx
│   │   ├── properties/      # Property/House components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyList.tsx
│   │   │   └── PropertyDetailModal.tsx
│   │   ├── attendees/       # Attendee management
│   │   │   ├── AttendeeList.tsx
│   │   │   ├── AttendeeDetails.tsx
│   │   │   └── AttendeeCheckIn.tsx
│   │   ├── bookings/        # Booking components
│   │   │   ├── BookingList.tsx
│   │   │   └── BookingForm.tsx
│   │   ├── map/             # Map components
│   │   │   ├── PropertyMap.tsx
│   │   │   └── DirectionsButton.tsx
│   │   ├── events/          # Event management
│   │   │   ├── EventList.tsx
│   │   │   └── EventInterestToggle.tsx
│   │   └── photos/          # Photo management
│   │       ├── PhotoUpload.tsx
│   │       └── PhotoGallery.tsx
│   ├── pages/               # Route-based pages
│   │   ├── admin/           # Admin-only pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── AdminBookings.tsx
│   │   ├── reports/         # Reporting pages
│   │   │   └── CheckInReport.tsx
│   │   ├── HomePage.tsx
│   │   ├── PropertiesPage.tsx
│   │   ├── AttendeesPage.tsx
│   │   ├── EventsPage.tsx
│   │   └── PhotosPage.tsx
│   ├── stores/              # Zustand state stores
│   │   └── authStore.ts     # Authentication state with persistence
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProperties.ts
│   │   └── useSupabaseRealtime.ts
│   ├── lib/                 # Utilities and services
│   │   ├── supabase.ts      # Supabase client configuration
│   │   ├── appInsights.ts   # Application Insights setup
│   │   ├── utils.ts         # Utility functions
│   │   └── cn.ts            # Class name utilities
│   ├── types/               # TypeScript definitions
│   │   ├── database.types.ts # Generated from Supabase schema
│   │   └── index.ts
│   ├── App.tsx              # Main app component with routing
│   └── main.tsx             # Application entry point
├── supabase/
│   ├── migrations/          # Sequential SQL migrations (30+ files)
│   └── seed-data.sql        # Initial data seeding
├── public/                  # Static assets
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD pipeline
├── staticwebapp.config.json # Azure SWA configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.local              # Environment variables
```

## Database Schema

### Tables

**properties** (Houses)
```sql
- id: uuid (primary key)
- name: text
- address: text
- latitude: decimal (10,7)
- longitude: decimal (10,7)
- max_occupancy: integer
- price_per_night: decimal
- photo_url: text
- bedrooms: integer
- bathrooms: integer
- youtube_video_url: text
- created_at: timestamp
```

**attendees**
```sql
- id: uuid (primary key)
- name: text (NOT NULL)
- email: text
- phone: text (formatted as +1XXXXXXXXXX)
- has_rental_car: boolean (default false)
- needs_airport_pickup: boolean (default false)
- arrival_airline: text
- arrival_flight: text
- arrival_datetime: timestamp
- departure_airline: text
- departure_flight: text
- departure_datetime: timestamp
- checked_in: boolean (default false)
- checked_in_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

**bookings**
```sql
- id: uuid (primary key)
- attendee_id: uuid (foreign key → attendees.id ON DELETE CASCADE)
- property_id: uuid (foreign key → properties.id ON DELETE CASCADE)
- arrival_date: date
- exit_date: date
- total_amount: decimal
- paid: boolean (default false)
- created_at: timestamp
- updated_at: timestamp
```

**events**
```sql
- id: uuid (primary key)
- name: text (NOT NULL)
- description: text
- date: date (NOT NULL)
- time: time (NOT NULL)
- location: text
- address: text
- latitude: decimal (10,7)
- longitude: decimal (10,7)
- is_optional: boolean (default false)
- created_at: timestamp
- updated_at: timestamp
```

**event_attendees**
```sql
- id: uuid (primary key)
- event_id: uuid (foreign key → events.id ON DELETE CASCADE)
- attendee_id: uuid (foreign key → attendees.id ON DELETE CASCADE)
- is_interested: boolean (default true)
- created_at: timestamp
- updated_at: timestamp
- UNIQUE(event_id, attendee_id)
```

**photos**
```sql
- id: uuid (primary key)
- filename: text (NOT NULL)
- url: text (NOT NULL)
- uploaded_by: uuid (foreign key → attendees.id)
- uploaded_at: timestamp (default now())
- size: integer
- mime_type: text
- attendee_ids: uuid[] (array of attendee IDs)
```

**activity_logs**
```sql
- id: uuid (primary key)
- user_id: text
- user_name: text
- user_type: text (admin/attendee)
- action: text (login/check_in/view_page/etc)
- details: jsonb
- ip_address: text
- user_agent: text
- session_id: text
- created_at: timestamp (default now())
```

**user_roles** (For Supabase Auth integration)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key → auth.users)
- role: text (admin/user)
- created_at: timestamp
```

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Public read access for most data
- Admin-only write access
- Attendee-specific access for personal data
- Special policies for photo uploads and activity logging

## Authentication

### Multi-Tier Authentication System

**Admin Authentication**
- Primary: Static credentials (cbxadmin/cbx2025)
- Secondary: Supabase Auth integration for additional admins
- Full access to all features and data
- Can manage properties, attendees, bookings, and events

**Attendee Authentication**
- Phone number-based login (name + phone verification)
- Auto check-in for off-site attendees
- Access to personal booking info and event interest
- Can upload photos and view shared content

**Session Management**
- Zustand store with localStorage persistence
- Session data includes user type, ID, and name
- Activity logging for all authenticated actions
- Automatic session restoration on page reload

## Key Components & Features

### Authentication Components
**AdminLoginForm** (`src/components/auth/AdminLoginForm.tsx`)
- Static credential validation
- Error handling with toast notifications
- Redirects to admin dashboard on success

**AttendeeLoginForm** (`src/components/auth/AttendeeLoginForm.tsx`)
- Phone number formatting and validation
- Auto check-in for first-time users
- Activity logging integration

### Property Management
**PropertyList** (`src/components/properties/PropertyList.tsx`)
- Responsive grid layout (1-2 columns mobile, 3-4 desktop)
- Real-time occupancy updates
- Excludes off-site property from main view

**PropertyCard** (`src/components/properties/PropertyCard.tsx`)
- Displays house photo, name, address
- Bedroom/bathroom counts
- Current/max occupancy with visual indicators
- YouTube video links
- Expandable detail modal

### Attendee Management
**AttendeeList** (`src/components/attendees/AttendeeList.tsx`)
- Searchable/filterable table
- Transportation status indicators
- Check-in status tracking
- Property assignment display
- Admin-only edit capabilities

**AttendeeCheckIn** (`src/components/attendees/AttendeeCheckIn.tsx`)
- One-click check-in process
- Timestamp recording
- Activity log integration

### Booking System
**BookingList** (`src/components/bookings/BookingList.tsx`)
- Date-based filtering
- Payment status tracking
- Property assignment management
- Conflict detection

### Event Management
**EventList** (`src/components/events/EventList.tsx`)
- Chronological event display
- Optional/required event indicators
- Interest tracking for optional events
- Map integration for event locations

**EventInterestToggle** (`src/components/events/EventInterestToggle.tsx`)
- Real-time interest updates
- Attendee count display
- Optimistic UI updates

### Map Integration
**PropertyMap** (`src/components/map/PropertyMap.tsx`)
- Google Maps with custom styling
- Property markers with info windows
- Event location markers
- Directions integration
- Mobile-responsive controls

**DirectionsButton** (`src/components/map/DirectionsButton.tsx`)
- One-click directions to any location
- Opens in native maps app on mobile

### Photo Management
**PhotoUpload** (`src/components/photos/PhotoUpload.tsx`)
- Azure Blob Storage integration
- Drag-and-drop interface
- Progress indicators
- Attendee tagging

**PhotoGallery** (`src/components/photos/PhotoGallery.tsx`)
- Masonry grid layout
- Lightbox viewing
- Filtering by attendee
- Download capabilities

## Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ttsharxrnbcqbmllvgwa.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication
VITE_AUTH_USERNAME=cbxadmin
VITE_AUTH_PASSWORD=cbx2025

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Azure Storage (for photos)
VITE_AZURE_STORAGE_ACCOUNT=your-storage-account
VITE_AZURE_STORAGE_CONTAINER=your-container-name
VITE_AZURE_STORAGE_SAS_URL=your-sas-url

# Application Insights
VITE_APP_INSIGHTS_CONNECTION_STRING=your-connection-string
```

## Development Workflow

### Initial Setup
1. Clone repository: `git clone https://github.com/kabzadev/cbxrentals.git`
2. Navigate to project: `cd CBXRentals/cbx-rentals`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in values
5. Set up Supabase project and run migrations
6. Configure Azure resources (Storage, App Insights)
7. Run development server: `npm run dev`

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Database Management
1. **Migrations**: Sequential SQL files in `supabase/migrations/`
2. **Naming Convention**: `XXX_description.sql` (e.g., `001_create_properties_table.sql`)
3. **Apply Migrations**: Use Supabase Dashboard or CLI
4. **Generate Types**: `npx supabase gen types typescript --project-id ttsharxrnbcqbmllvgwa > src/types/database.types.ts`

### Git Workflow
- **Main Branch**: `main` (production)
- **Feature Branches**: `feature/description`
- **Bugfix Branches**: `fix/description`
- **Commit Convention**: 
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation
  - `style:` Code style changes
  - `refactor:` Code refactoring
  - `test:` Test additions/changes
  - `chore:` Build process/auxiliary changes

### CI/CD Pipeline (GitHub Actions)
1. **Trigger**: Push to `main` or PR events
2. **Build Process**:
   - Install Node.js 18
   - Install dependencies with `npm ci`
   - Build with environment variables from GitHub Secrets
   - Copy `staticwebapp.config.json` to dist
3. **Deployment**: Azure Static Web Apps
4. **PR Preview**: Automatic preview environments

### GitHub Integration & Task Management

**Repository Structure**
- Main repository: https://github.com/kabzadev/cbxrentals.git
- Issues for feature tracking and bug reports
- Pull requests for code review
- GitHub Actions for CI/CD

**Issue Management**
- Use labels: `feature`, `bug`, `enhancement`, `documentation`, `urgent`
- Milestones for major releases
- Projects for sprint planning

**Pull Request Process**
1. Create feature branch from `main`
2. Make changes and commit with conventional messages
3. Push branch and create PR
4. Automated checks run (build, type-check)
5. Preview deployment created
6. Code review required
7. Merge to main triggers production deployment

### Common Development Tasks

**Adding a New Feature**
1. Create GitHub issue with requirements
2. Create feature branch
3. Implement with tests
4. Update types if needed
5. Test locally with real data
6. Create PR with description

**Database Schema Changes**
1. Create migration file in `supabase/migrations/`
2. Test migration locally
3. Apply to Supabase project
4. Regenerate TypeScript types
5. Update affected components

**Adding New Environment Variable**
1. Add to `.env.local` for development
2. Add to `.env.example` with placeholder
3. Update this CLAUDE.md documentation
4. Add to GitHub Secrets for CI/CD
5. Update `azure-static-web-apps.yml` if needed

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object shapes
- Proper null/undefined handling

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database.types'

// 2. Types/Interfaces
interface ComponentProps {
  data: Database['public']['Tables']['properties']['Row']
}

// 3. Component definition
export function Component({ data }: ComponentProps) {
  // 4. State/hooks
  const [state, setState] = useState()
  
  // 5. Event handlers
  const handleClick = () => {}
  
  // 6. Render
  return <div>...</div>
}
```

### Styling with Tailwind
- Mobile-first responsive design
- Use Tailwind's design system
- Custom classes via `cn()` utility
- Consistent spacing scale
- Semantic color usage

### Shadcn UI Patterns
- Import from `@/components/ui/`
- Extend components, don't modify core
- Use component variants
- Follow accessibility guidelines

## State Management Patterns

### Zustand Store Structure
```typescript
interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  
  // Computed
  isAdmin: () => boolean
}
```

### Data Fetching
- Supabase queries in dedicated hooks
- Real-time subscriptions for live data
- Optimistic updates for better UX
- Error states and loading indicators

## Error Handling & Monitoring

### Application Insights Integration
- Automatic page view tracking
- Custom event tracking for user actions
- Error boundary integration
- Performance metrics

### Error Handling Patterns
```typescript
try {
  const result = await supabase.from('table').select()
  if (result.error) throw result.error
  return result.data
} catch (error) {
  logError('Failed to fetch data', error)
  toast.error('Failed to load data')
}
```

## Security Best Practices

### Frontend Security
- Input validation with Zod
- XSS prevention via React
- CSRF protection via SameSite cookies
- Content Security Policy headers

### API Security
- Row Level Security (RLS) policies
- Anon key only (never service role)
- Request rate limiting
- Input sanitization

### Data Privacy
- No sensitive data in localStorage
- Secure photo URLs with SAS tokens
- Activity logs exclude sensitive info
- GDPR-compliant data handling

## Performance Optimization

### Code Splitting
- Route-based lazy loading
- Component lazy loading for modals
- Dynamic imports for heavy libraries

### Image Optimization
- Lazy loading with Intersection Observer
- Responsive image sizes
- WebP format support
- Azure CDN for photos

### Query Optimization
- Pagination for large lists
- Select only needed columns
- Proper indexing in database
- Debounced search inputs

### Bundle Optimization
- Tree shaking enabled
- Minification in production
- Compression (gzip/brotli)
- Code splitting by route

## Deployment & Infrastructure

### Azure Static Web Apps
- Global CDN distribution
- Automatic SSL certificates
- Custom domain support
- Staging environments for PRs

### Environment Management
- Development: Local `.env.local`
- Staging: PR preview environments
- Production: GitHub Secrets → Azure

### Monitoring & Alerts
- Application Insights dashboards
- Error rate monitoring
- Performance alerts
- User activity analytics

## Troubleshooting Guide

### Common Issues

**Build Failures**
- Check Node version (requires 18+)
- Clear `node_modules` and reinstall
- Verify all environment variables set
- Check for TypeScript errors

**Supabase Connection Issues**
- Verify URL and anon key
- Check network connectivity
- Ensure RLS policies allow access
- Check for CORS issues

**Authentication Problems**
- Verify credentials in env vars
- Check localStorage for corrupt data
- Ensure phone numbers formatted correctly
- Clear browser cache/cookies

**Map Display Issues**
- Verify Google Maps API key
- Check API key restrictions
- Ensure billing enabled on Google Cloud
- Check browser console for errors

**Photo Upload Failures**
- Verify Azure SAS URL not expired
- Check file size limits
- Ensure correct MIME types
- Verify CORS configuration

### Development Tips

1. **Use the Supabase Dashboard** for quick data inspection and query testing
2. **Enable React DevTools** for component debugging
3. **Use Application Insights** for production debugging
4. **Check Network tab** for API failures
5. **Test on mobile** early and often

## Future Enhancements

### Planned Features
- Email notifications for bookings
- SMS reminders for events  
- Advanced reporting dashboard
- Multi-language support
- Offline mode with sync
- Native mobile app

### Technical Improvements
- Server-side rendering (Next.js)
- GraphQL API layer
- Redis caching layer
- Automated testing suite
- Performance monitoring
- A/B testing framework

## Contributing Guidelines

1. **Code Quality**
   - Run linters before committing
   - Write meaningful commit messages
   - Add tests for new features
   - Update documentation

2. **Review Process**
   - Self-review your PR first
   - Ensure CI passes
   - Respond to feedback promptly
   - Squash commits before merge

3. **Communication**
   - Use GitHub issues for bugs/features
   - Update issue status regularly
   - Document decisions in PRs
   - Collaborate on Slack/Discord

---

*Last Updated: 2025-07-14*
*Maintained with Claude CLI*