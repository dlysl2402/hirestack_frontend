# HireStack Frontend

Modern, lean React frontend for HireStack ATS built with TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript 5** - Type-safe development with strict mode
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── candidates/     # Candidate management
├── components/     # Reusable UI components
│   └── ui/        # Base UI components
├── lib/           # Utilities & helpers (API client, utils)
├── organizations/ # Organization management
├── pages/         # Route pages
└── users/         # User management
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000)

## Features

Starting lean with core features:
- ✅ Authentication & JWT token management
- ✅ Organization management
- ✅ Candidate CRUD operations
- ✅ User management

More features will be added progressively as the backend evolves.

## Development Notes

- Path alias `@/` maps to `src/` for cleaner imports
- TypeScript strict mode enabled for maximum type safety
- Tailwind configured with CSS variables for easy theming
- Follows the proven architecture from ats-frontend but reimplemented lean
