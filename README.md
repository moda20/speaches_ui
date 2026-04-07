# Dashboard Application

A modern, scalable dashboard application built with React 19, Vite 8, TypeScript, and shadcn/ui components.

## Features

- **Modern Tech Stack**: React 19, Vite 8, TypeScript, and Bun for fast development
- **Component Library**: Built with shadcn/ui for accessible, customizable components
- **State Management**: Zustand for lightweight, efficient state management
- **Data Fetching**: TanStack Query for powerful data fetching and caching
- **Routing**: React Router v7 for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Theme Support**: Dark mode with system preference detection
- **Responsive Design**: Mobile-first approach with responsive sidebar
- **Performance Optimized**: Code splitting, lazy loading, and React optimizations

## Prerequisites

- **Node.js**: 20.19 or higher
- **Bun**: Latest stable version (recommended for faster installs)
- **npm** or **yarn** (alternative package managers)

## Installation

### Using Bun (Recommended)

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Using npm

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Using yarn

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Create production build
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Format code
bun run format

# Type check
bun run type-check

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (Sidebar, Header, etc.)
│   └── features/        # Feature-specific components
├── pages/               # Route-level components
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
│   ├── api.ts           # API client configuration
│   ├── utils.ts         # Utility functions
│   ├── cn.ts            # Class name utility
│   └── env.ts           # Environment variables
├── stores/              # Zustand stores
│   ├── dashboardStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── services/            # API services
│   ├── dashboard.ts
│   ├── analytics.ts
│   └── reports.ts
├── types/               # TypeScript types
└── styles/              # Global styles
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Dashboard Application
```

### Production Environment

Create a `.env.production` file:

```env
VITE_API_URL=https://api.example.com/api
VITE_APP_NAME=Dashboard Application
```

## Key Features

### Dashboard

- Quick stats cards with metrics and KPIs
- Recent activity timeline
- Quick action buttons
- Loading and error states with skeleton components

### Analytics

- Interactive charts using Recharts
- Traffic overview with line charts
- User growth with bar charts
- Responsive chart containers

### Reports

- Data table with sorting and filtering
- Status badges with color coding
- Download and export functionality
- Report management interface

### Settings

- General settings (language, timezone, date format)
- Theme settings (dark/light mode)
- Display settings (density, font size)
- Form validation with Zod
- Persistent settings with localStorage

## Performance Optimizations

- **Code Splitting**: Route-based code splitting with lazy loading
- **Bundle Analysis**: Visualizer for bundle size analysis
- **CSS Code Splitting**: Automatic CSS code splitting
- **Component Optimization**: React.memo, useMemo, and useCallback
- **Virtualization**: Support for large list virtualization with @tanstack/react-virtual

## Testing

The project is configured with Vitest and React Testing Library:

```bash
# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with UI
bun run test:ui
```

## Build & Deployment

### Production Build

```bash
# Create production build
bun run build

# Preview production build
bun run preview
```

### Bundle Analysis

After building, open `dist/stats.html` to view the bundle analysis visualization.

### Deployment

The application can be deployed to various platforms:

- **Vercel**: Automatic deployment from Git
- **Netlify**: Simple drag-and-drop or Git deployment
- **Docker**: Containerized deployment
- **Static Hosting**: Deploy the `dist/` folder

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Architecture

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

### Core

- **React 19**: Latest React with concurrent features
- **Vite 8**: Fast build tool with HMR
- **TypeScript**: Type-safe development
- **Bun**: Fast package manager (optional)

### Routing & State

- **React Router v7**: Client-side routing
- **Zustand**: Lightweight state management
- **TanStack Query**: Data fetching and caching

### UI & Styling

- **shadcn/ui**: Accessible component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Component variants
- **clsx & tailwind-merge**: Class name utilities

### Forms & Validation

- **React Hook Form**: Form management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Data Visualization

- **Recharts**: Chart library for React

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **React Testing Library**: Component testing
- **TypeScript ESLint**: TypeScript linting

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
