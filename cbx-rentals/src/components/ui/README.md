# UI Components

This directory contains all Shadcn UI components for the CBX Rentals application.

## Components Available

- **Button** - Various button styles and variants
- **Card** - Container component with header, content, and footer sections
- **Input** - Form input field with consistent styling
- **Label** - Form label component
- **Form** - Complete form handling with react-hook-form integration
- **Dialog** - Modal dialog component
- **Toast** - Notification system with toast messages
- **Table** - Data table with sorting and styling
- **Badge** - Small status indicators
- **Skeleton** - Loading placeholder animations

## Usage

Import components from the UI directory:

```tsx
import { Button, Card, Input } from '@/components/ui'
```

## Theme Support

All components support both light and dark modes through the ThemeProvider.

## Customization

Components use CSS variables defined in `src/index.css` for theming. You can customize colors by modifying these variables.