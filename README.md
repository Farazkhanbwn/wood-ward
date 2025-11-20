# Unified Coaches App

This is a unified Next.js application that combines all coach-related dashboards:

- **Landing Page**: `/` - Public landing page with authentication
- **Admin Hub**: `/admin` - Admin management dashboard
- **Coach Dashboard**: `/coach` - Coach management interface
- **Sales Training**: `/sales` - Sales training platform

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `/app` - Next.js app router pages
  - `/admin` - Admin hub routes
  - `/coach` - Coach dashboard routes
  - `/sales` - Sales training routes
  - Root routes for landing page
- `/components` - Shared React components
  - `/ui` - UI components (buttons, cards, etc.)
  - `/admin` - Admin-specific components
  - `/coach` - Coach-specific components
  - `/sales` - Sales-specific components
  - `/landing` - Landing page components
- `/lib` - Utility functions
- `/public` - Static assets

## Tech Stack

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS 4.1.9
- Radix UI Components
