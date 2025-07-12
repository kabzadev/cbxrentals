# CBX Experience Rental Management System

## Project Overview
A React-based web application for managing rental properties during the CBX Experience event. The system tracks four rental properties, attendee assignments, arrival/exit dates, and payment calculations.

## Core Features
- Static authentication (username/password)
- Display 4 rental properties
- Attendee management per property
- Arrival/exit date tracking
- Payment calculation and display
- Google Maps integration showing all properties and event location

## Tech Stack
- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time sync, Storage, Functions)
  - **Project ID**: ttsharxrnbcqbmllvgwa
  - **URL**: https://ttsharxrnbcqbmllvgwa.supabase.co
- **UI Components**: Shadcn UI
- **State Management**: Zustand or Tanstack Query
- **Version Control**: GitHub
- **AI Assistance**: Claude CLI
- **Maps**: Google Maps API
- **Repository**: https://github.com/kabzadev/cbxrentals.git

## Project Structure
```
cbx-rentals/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   └── PropertyList.tsx
│   │   ├── attendees/
│   │   │   ├── AttendeeList.tsx
│   │   │   └── AttendeeDetails.tsx
│   │   ├── map/
│   │   │   └── PropertyMap.tsx
│   │   └── ui/          # Shadcn UI components
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useProperties.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   └── functions/
└── .env.local
```

## Database Schema

### Tables

**properties**
```sql
- id: uuid (primary key)
- name: text
- address: text
- latitude: decimal
- longitude: decimal
- max_occupancy: integer
- price_per_night: decimal
- created_at: timestamp
```

**attendees**
```sql
- id: uuid (primary key)
- name: text
- email: text
- phone: text
- created_at: timestamp
```

**bookings**
```sql
- id: uuid (primary key)
- attendee_id: uuid (foreign key)
- property_id: uuid (foreign key)
- arrival_date: date
- exit_date: date
- total_amount: decimal
- paid: boolean
- created_at: timestamp
```

## Authentication
Static authentication using environment variables:
- Username: Stored in `VITE_AUTH_USERNAME`
- Password: Stored in `VITE_AUTH_PASSWORD`

## Key Components

### LoginForm
- Simple form with username/password fields
- Validates against environment variables
- Sets auth state using Zustand or Context

### PropertyList
- Displays 4 rental properties in a grid
- Shows occupancy status
- Links to detailed view

### PropertyCard
- Shows property image, name, address
- Current occupants count
- Quick stats (arrival/departure dates)

### AttendeeList
- Filterable list of attendees
- Shows current property assignment
- Payment status indicators

### PropertyMap
- Google Maps integration
- Markers for all 4 properties
- Event location marker
- Info windows with property details

## Environment Variables
```
VITE_SUPABASE_URL=https://ttsharxrnbcqbmllvgwa.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_AUTH_USERNAME=cbxadmin
VITE_AUTH_PASSWORD=secure-password
```

## Development Workflow

### Initial Setup
1. Clone repository: `git clone https://github.com/kabzadev/cbxrentals.git`
2. Create new React + TypeScript project in the cloned directory
3. Install dependencies: `npm install @supabase/supabase-js @tanstack/react-query zustand`
4. Set up Shadcn UI: `npx shadcn-ui@latest init`
5. Configure Supabase client
6. Set up environment variables
7. Create initial GitHub Issues for all major features
8. Set up GitHub Project board for task tracking

### Feature Implementation
1. Start with authentication flow
2. Create property management features
3. Implement attendee assignment system
4. Add payment calculations
5. Integrate Google Maps

### Git Workflow
- Repository: https://github.com/kabzadev/cbxrentals.git
- Feature branches: `feature/property-list`, `feature/auth`
- Use conventional commits: `feat:`, `fix:`, `docs:`
- Enable Supabase branching for database migrations

### Task Management with GitHub Issues
- Create GitHub Issues for all major features and sub-tasks
- Use labels: `feature`, `bug`, `enhancement`, `documentation`
- Issue templates:
  - Feature: Include acceptance criteria, implementation details
  - Bug: Steps to reproduce, expected vs actual behavior
- Link commits to issues using `#issue-number` in commit messages
- Use GitHub Projects for sprint planning and progress tracking

### Example Issue Structure
```
Epic: CBX Rental Management System
├── Issue #1: Setup project structure and dependencies
├── Issue #2: Implement static authentication
├── Issue #3: Create property management UI
│   ├── Sub-task: Design PropertyCard component
│   ├── Sub-task: Implement PropertyList grid
│   └── Sub-task: Add property details modal
├── Issue #4: Build attendee management system
├── Issue #5: Implement payment calculations
├── Issue #6: Integrate Google Maps
└── Issue #7: Setup Supabase database and migrations
```

## Styling Conventions
- Use Tailwind CSS classes
- Follow Shadcn UI component patterns
- Responsive design (mobile-first)
- Dark mode support via Shadcn UI

## State Management
- Zustand for global state (auth, selected property)
- Tanstack Query for server state (properties, attendees)
- Local state for UI components

## Error Handling
- Display user-friendly error messages
- Log errors to console in development
- Implement error boundaries for critical sections

## Testing Approach
- Component testing with React Testing Library
- Integration tests for Supabase queries
- E2E tests for critical user flows

## Deployment
- Frontend: Vercel or Netlify
- Database: Supabase hosted
- Environment variables in deployment platform

## Security Considerations
- Never expose Supabase service role key
- Validate all user inputs
- Use Row Level Security (RLS) in Supabase
- HTTPS only in production

## Performance Optimizations
- Lazy load property images
- Implement pagination for attendee lists
- Use React.memo for expensive components
- Optimize Google Maps markers for large datasets