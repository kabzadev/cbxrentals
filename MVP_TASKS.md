# CBX Rentals MVP Task List

## Phase 1: Project Setup and Infrastructure

### Task 1: Initialize React TypeScript Project
- Create new Vite React TypeScript project
- Install core dependencies
- Configure TypeScript
- Set up ESLint and Prettier

### Task 2: Configure Supabase Client
- Install @supabase/supabase-js
- Create supabase client configuration
- Set up environment variables
- Test connection to Supabase

### Task 3: Set Up Shadcn UI
- Initialize Shadcn UI
- Configure Tailwind CSS
- Install initial UI components (Button, Card, Input, Form)
- Set up dark mode support

## Phase 2: Database Setup

### Task 4: Create Supabase Tables
- Create properties table
- Create attendees table  
- Create bookings table
- Set up foreign key relationships

### Task 5: Configure Row Level Security
- Enable RLS on all tables
- Create basic security policies
- Test data access patterns

### Task 6: Add Sample Data
- Insert 4 rental properties
- Add sample attendees
- Create sample bookings

## Phase 3: Authentication

### Task 7: Implement Static Authentication
- Create login page component
- Implement auth context/store with Zustand
- Add protected route wrapper
- Create logout functionality

## Phase 4: Core Features

### Task 8: Property Management UI
- Create PropertyCard component
- Build PropertyList grid view
- Add property details modal
- Implement property filtering

### Task 9: Attendee Management
- Create AttendeeList component
- Build attendee details view
- Add attendee search/filter
- Show booking information

### Task 10: Booking System
- Create booking form
- Calculate stay duration and costs
- Update booking status
- Display payment information

## Phase 5: Additional Features

### Task 11: Google Maps Integration
- Set up Google Maps API
- Create PropertyMap component
- Add property markers
- Show event location

### Task 12: Dashboard View
- Create main dashboard layout
- Add summary statistics
- Show recent bookings
- Display occupancy overview

## Phase 6: Polish and Deployment

### Task 13: Error Handling and Loading States
- Add loading spinners
- Implement error boundaries
- Create user-friendly error messages
- Add toast notifications

### Task 14: Responsive Design
- Ensure mobile responsiveness
- Test on various screen sizes
- Optimize for tablet view
- Fix any layout issues

### Task 15: Deployment Setup
- Configure build process
- Set up Vercel/Netlify deployment
- Configure environment variables
- Test production build