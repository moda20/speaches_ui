# Project Initialization Plan: Vite + React + shadcn/ui Dashboard Application

**Project Type**: Large-scale dashboard application with complex multi-layered architecture
**Target Date**: March 2026
**Prerequisites**: Bun (latest stable version), Node.js 20.19+

---

## Phase 1: Environment Setup & Initial Configuration

- [x] Verify Node.js version (minimum 20.19+)
  ```bash
  node --version
  ```
- [x] Verify Bun installation
  ```bash
  bun --version
  ```
- [x] Clean install dependencies
  ```bash
  rm -rf node_modules bun.lockb
  bun pm cache rm
  ```

---

## Phase 2: Initialize Vite + React + TypeScript Project

### 2.1 Project Creation

- [x] Create Vite project with React + TypeScript template
  ```bash
  bun create vite@latest shadcn-dashboard -- --template react-ts
  ```
- [x] Navigate to project directory
  ```bash
  cd shadcn-dashboard
  ```
- [x] Install base dependencies
  ```bash
  bun install
  ```
- [x] Initialize Git repository
  ```bash
  git init
  git add .
  git commit -m "chore: initialize Vite + React + TypeScript project"
  ```

### 2.2 Upgrade to Latest Versions

- [x] Upgrade to Vite 8.0.0
  ```bash
  bun add -D vite@latest
  ```
- [x] Upgrade to React 19
  ```bash
  bun add react@^19 react-dom@^19
  ```
- [x] Upgrade to @vitejs/plugin-react v6
  ```bash
  bun add -D @vitejs/plugin-react@latest
  ```
- [x] Update @types packages for React 19
  ```bash
  bun add -D @types/react@^19 @types/react-dom@^19
  ```

### 2.3 Configuration Files

- [x] Configure `vite.config.ts` with production optimizations
  - Enable Rolld bundler (Vite 8 default)
  - Configure code splitting strategy
  - Set build target to ES2020
  - Configure manual chunks for vendor libraries
  - Enable devtools
- [x] Configure `tsconfig.json` for React 19 and modern TypeScript
  - Set moduleResolution to "bundler"
  - Enable isolatedModules
  - Set target to ES2020
  - Configure path aliases (@/\*)

---

## Phase 3: Install Core Libraries

### 3.1 Routing

- [x] Install React Router v7
  ```bash
  bun add react-router-dom@latest
  ```
- [x] Create basic route structure
  - Set up `createBrowserRouter` configuration
  - Create layout routes (DashboardLayout)
  - Configure lazy loading for routes
- [x] Set up route types and type safety
  - Configure loader data types
  - Set up action parameter types
  - Create route types export

### 3.2 State Management

- [x] Install Zustand v5 (recommended for dashboard apps)
  ```bash
  bun add zustand@latest
  ```
- [x] Create store structure
  - `src/stores/dashboardStore.ts` - Dashboard preferences and data
  - `src/stores/uiStore.ts` - UI state (sidebar, theme, layout)
  - `src/stores/settingsStore.ts` - Application settings and configuration
- [x] Create TypeScript types for stores
  - Define store interfaces
  - Export type inference helpers

### 3.3 Data Fetching

- [x] Install TanStack Query v5
  ```bash
  bun add @tanstack/react-query@latest
  ```
- [x] Configure QueryClient with production settings
  - Set default staleTime (5 minutes for dashboards)
  - Configure retry behavior
  - Disable refetchOnWindowFocus
- [x] Set up QueryClientProvider in App.tsx
- [x] Create query key conventions
  - Define query key factory functions
  - Document query key patterns

### 3.4 Forms & Validation

- [x] Install React Hook Form + Zod
  ```bash
  bun add react-hook-form @hookform/resolvers zod
  ```
- [x] Install shadcn/ui form components
  ```bash
  bunx shadcn@latest add form
  bunx shadcn@latest add input
  bunx shadcn@latest add label
  bunx shadcn@latest add button
  bunx shadcn@latest add select
  ```
- [x] Create form validation schemas
  - Define common form schemas
  - Create reusable validation patterns

---

## Phase 4: Install & Configure shadcn/ui

### 4.1 Initialize shadcn/ui

- [x] Initialize shadcn/ui for Vite
  ```bash
  bunx shadcn@latest init -t vite
  ```
- [x] Configure `components.json` settings
  - Set up TypeScript path aliases (@/components/ui)
  - Configure Tailwind CSS paths
  - Set up component directory structure

### 4.2 Install Core shadcn/ui Components

- [x] Essential UI components
  ```bash
  bunx shadcn@latest add button
  bunx shadcn@latest add card
  bunx shadcn@latest add input
  bunx shadcn@latest add label
  bunx shadcn@latest add select
  bunx shadcn@latest add checkbox
  bunx shadcn@latest add switch
  bunx shadcn@latest add tabs
  bunx shadcn@latest add separator
  bunx shadcn@latest add dialog
  bunx shadcn@latest add dropdown-menu
  bunx shadcn@latest add toast
  bunx shadcn@latest add sheet
  bunx shadcn@latest add scroll-area
  bunx shadcn@latest add avatar
  bunx shadcn@latest add badge
  bunx shadcn@latest add skeleton
  ```

### 4.3 Dashboard-Specific Components

- [x] Navigation components
  ```bash
  bunx shadcn@latest add sidebar
  bunx shadcn@latest add navigation-menu
  bunx shadcn@latest add breadcrumb
  ```
- [x] Data display components
  ```bash
  bunx shadcn@latest add table
  bunx shadcn@latest add data-table
  bunx shadcn@latest add chart
  ```
- [x] Form components
  ```bash
  bunx shadcn@latest add form
  bunx shadcn@latest add textarea
  bunx shadcn@latest add popover
  ```

### 4.4 Configure Theme & Styling

- [x] Set up Tailwind CSS configuration
  - Configure theme colors (light/dark mode)
  - Set up custom design tokens
  - Configure animations
- [x] Create global styles
  - Set up CSS variables for theming
  - Configure typography scale
  - Add custom animations
- [x] Implement dark mode toggle
  - Create theme provider
  - Add dark mode switcher component
  - Configure system preference detection

---

## Phase 5: Project Structure Setup

### 5.1 Create Scalable Directory Structure

- [x] Set up component directories

  ```
  src/
  ├── components/
  │   ├── ui/              # shadcn/ui components
  │   ├── layout/          # Layout components (Sidebar, Header, Footer)
  │   └── features/        # Feature-specific components
  │       ├── analytics/
  │       ├── reports/
  │       └── settings/
  ├── pages/               # Route-level components
  │   ├── Dashboard.tsx
  │   ├── Analytics.tsx
  │   ├── Reports.tsx
  │   └── Settings.tsx
  ├── hooks/               # Custom React hooks
  │   ├── useDashboardData.ts
  │   ├── useTheme.ts
  │   └── useLocalStorage.ts
  ├── lib/                 # Utility functions
  │   ├── api.ts
  │   ├── utils.ts
  │   └── cn.ts (class names utility)
  ├── stores/              # Zustand stores
  │   ├── dashboardStore.ts
  │   ├── uiStore.ts
  │   └── settingsStore.ts
  ├── types/               # TypeScript types
  │   ├── api.ts
  │   ├── dashboard.ts
  │   └── index.ts
  ├── services/            # API services
  │   ├── dashboard.ts
  │   ├── analytics.ts
  │   └── reports.ts
  └── styles/              # Global styles
      └── globals.css
  ```

- [x] Create barrel exports for better imports
  - `src/components/ui/index.ts`
  - `src/types/index.ts`
  - `src/stores/index.ts`

### 5.2 Set up Routing Structure

- [x] Create route hierarchy
  - `/` - Dashboard (main)
  - `/analytics` - Analytics page
  - `/reports` - Reports page
  - `/settings` - Settings page
- [x] Implement layout components
  - Create `DashboardLayout` with Sidebar
  - Configure nested routes with layouts

---

## Phase 6: Install Additional Libraries

### 6.1 Icons

- [x] Install lucide-react (recommended with shadcn/ui)
  ```bash
  bun add lucide-react
  ```
- [x] Create icon components utility
  - Set up icon type definitions
  - Create icon helper functions

### 6.2 Date Handling

- [x] Install date-fns (lightweight alternative to moment.js)
  ```bash
  bun add date-fns
  ```

### 6.3 Utilities

- [x] Install clsx and tailwind-merge for className utilities
  ```bash
  bun add clsx tailwind-merge
  ```
- [x] Create `cn` utility function

  ```typescript
  // src/lib/cn.ts
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

### 6.4 Development Tools

- [x] Install ESLint and Prettier
  ```bash
  bun add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  bun add -D prettier eslint-config-prettier eslint-plugin-prettier
  ```
- [x] Configure ESLint for React 19 and TypeScript
  - Set up ESLint configuration
  - Add React 19 specific rules
  - Configure TypeScript rules
- [x] Configure Prettier for code formatting
  - Set up Prettier configuration
  - Configure formatting rules

### 6.5 Build Analysis

- [ ] Install rollup-plugin-visualizer for bundle analysis
  ```bash
  bun add -D rollup-plugin-visualizer
  ```
- [ ] Configure visualizer in vite.config.ts

---

## Phase 7: Environment Configuration

### 7.1 Environment Variables

- [x] Create `.env` file for development
  ```bash
  VITE_API_URL=http://localhost:3000/api
  VITE_APP_NAME=Shadcn Dashboard
  ```
- [x] Create `.env.example` file
- [x] Create `.env.production` file
  ```bash
  VITE_API_URL=https://api.example.com/api
  VITE_APP_NAME=Shadcn Dashboard
  ```
- [x] Create `src/lib/env.ts` for type-safe environment variables

  ```typescript
  // src/lib/env.ts
  const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  } as const;

  export default env;
  ```

---

## Phase 8: Setup Core Features

### 8.1 Dashboard State Management

- [x] Create dashboard store (Zustand)
  ```typescript
  // src/stores/dashboardStore.ts
  interface DashboardState {
    sidebarOpen: boolean;
    selectedView: string;
    filters: DashboardFilters;
    setSidebarOpen: (open: boolean) => void;
    setSelectedView: (view: string) => void;
    setFilters: (filters: DashboardFilters) => void;
  }
  ```
- [x] Create UI store for theme and layout
  ```typescript
  // src/stores/uiStore.ts
  interface UIState {
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
  }
  ```
- [x] Create settings store for application configuration
  ```typescript
  // src/stores/settingsStore.ts
  interface SettingsState {
    language: string;
    timezone: string;
    dateFormat: string;
    updateSettings: (settings: Partial<SettingsState>) => void;
  }
  ```

### 8.2 API Services

- [x] Install axios for HTTP requests
  ```bash
  bun add axios
  ```
- [x] Create API client

  ```typescript
  // src/lib/api.ts
  import axios from 'axios';

  export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for logging
  api.interceptors.request.use((config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
  ```

- [x] Create service modules
  - `src/services/dashboard.ts` - Dashboard data API calls
  - `src/services/analytics.ts` - Analytics data API calls
  - `src/services/reports.ts` - Reports generation API calls

---

## Phase 9: Create Dashboard Layout

### 9.1 Main Layout

- [x] Create `DashboardLayout` component
  - Sidebar with navigation
  - Top header with app title and theme toggle
  - Main content area
- [x] Implement responsive sidebar
  - Mobile drawer
  - Desktop sidebar with collapse
- [x] Create header component
  - App title/logo
  - Theme toggle button
  - Settings link

### 9.2 Navigation

- [x] Create navigation items
  - Dashboard (overview)
  - Analytics
  - Reports
  - Settings
- [x] Implement active route highlighting
- [ ] Create breadcrumb component

---

## Phase 10: Create Core Pages

### 10.1 Dashboard Home Page

- [x] Create `Dashboard.tsx` component
  - Welcome message
  - Quick stats cards (metrics, KPIs)
  - Recent activity timeline
  - Quick action buttons
- [x] Implement data fetching with TanStack Query
- [ ] Add loading and error states with Skeleton components

### 10.2 Analytics Page

- [x] Create `Analytics.tsx` component
  - Chart components (using shadcn/ui charts)
  - Data filters and date range picker
  - Key metrics summary
  - Trend analysis
- [x] Integrate chart library
  ```bash
  bun add recharts
  ```
- [x] Create responsive charts
  - Line charts for trends
  - Bar charts for comparisons
  - Pie charts for distributions

### 10.3 Reports Page

- [x] Create `Reports.tsx` component
  - Report list with filters
  - Report generation form
  - Download/export functionality
  - Report scheduling options
- [ ] Implement data table with shadcn/ui
  ```bash
  bunx shadcn@latest add data-table
  ```
- [x] Create report management
  - View report details
  - Generate new reports
  - Export reports (PDF, CSV)

### 10.4 Settings Page

- [x] Create `Settings.tsx` component
  - General settings form (language, timezone, date format)
  - Theme settings (dark/light mode preference)
  - Display settings (density, font size)
  - Data and export preferences
- [x] Implement form validation with Zod
- [x] Add settings persistence with localStorage

---

## Phase 11: Performance Optimization

### 11.1 Code Splitting

- [x] Configure route-based code splitting
  ```typescript
  const Dashboard = lazy(() => import('./pages/Dashboard'));
  const Analytics = lazy(() => import('./pages/Analytics'));
  const Reports = lazy(() => import('./pages/Reports'));
  const Settings = lazy(() => import('./pages/Settings'));
  ```
- [x] Set up Suspense boundaries
  ```typescript
  <Suspense fallback={<PageSkeleton />}>
    <Routes>
      {/* routes */}
    </Routes>
  </Suspense>
  ```

### 11.2 Build Optimization

- [x] Configure manual chunks in vite.config.ts
  - React vendor chunk
  - shadcn/ui vendor chunk
  - Chart libraries chunk
- [ ] Enable CSS code splitting (default in Vite 8)
- [ ] Configure bundle analysis with visualizer

### 11.3 Component Optimization

- [ ] Add React.memo to expensive components
- [ ] Implement useMemo for computed values
- [ ] Use useCallback for event handlers
- [ ] Implement virtualization for large lists
  ```bash
  bun add @tanstack/react-virtual
  ```

---

## Phase 12: Testing Setup

### 12.1 Testing Framework

- [ ] Install Vitest and React Testing Library
  ```bash
  bun add -D vitest @testing-library/react @testing-library/jest-dom
  ```
- [ ] Configure Vitest

  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
    },
  });
  ```

### 12.2 Create Test Setup

- [ ] Create test utilities
- [ ] Set up test render function
- [ ] Create mock data helpers

---

## Phase 13: Documentation

### 13.1 Project Documentation

- [ ] Create comprehensive README.md
  - Project overview
  - Installation instructions
  - Development commands
  - Build instructions
  - Deployment guide
- [ ] Create CONTRIBUTING.md
- [ ] Create ARCHITECTURE.md
  - Project structure explanation
  - Component organization
  - State management patterns
  - API integration patterns

### 13.2 Code Documentation

- [ ] Add JSDoc comments to functions
- [ ] Document component props
- [ ] Document store interfaces

---

## Phase 14: Development & Verification

### 14.1 Development Server

- [ ] Start development server
  ```bash
  bun run dev
  ```
- [ ] Verify hello world page loads correctly
- [ ] Check for console errors
- [ ] Verify HMR (Hot Module Replacement) works

### 14.2 Test Core Functionality

- [ ] Test routing between pages
- [ ] Test dark mode toggle
- [ ] Test form submissions
- [ ] Test data fetching
- [ ] Test responsive design on mobile

### 14.3 Build Verification

- [ ] Create production build
  ```bash
  bun run build
  ```
- [ ] Preview production build
  ```bash
  bun run preview
  ```
- [ ] Verify bundle size
  ```bash
  bun run build -- --report
  ```
- [ ] Check build output for errors
- [ ] Verify production build works correctly

---

## Phase 15: Optional Enhancements

### 15.1 Additional shadcn/ui Components

- [ ] Install advanced components as needed
  - Calendar, Date Picker
  - Combobox, Command
  - Popover, Tooltip
  - Progress, Slider
  - Tabs, Accordion
  - Dialog, Sheet, Drawer
  - Toast, Sonner
  - Carousel

### 15.2 Additional Libraries

- [ ] Install additional UI libraries (optional)
  - Aceternity UI for premium animations
  - Origin UI for interactive components
  - Magic UI for landing page components

### 15.3 DevTools

- [ ] Install React DevTools
  ```bash
  bun add -D @welldone-software/why-did-you-render
  ```
- [ ] Install TanStack Query DevTools
  ```bash
  bun add @tanstack/react-query-devtools
  ```

---

## Phase 16: Final Checks

### 16.1 Code Quality

- [ ] Run ESLint and fix issues
  ```bash
  bun run lint
  ```
- [ ] Run Prettier to format code
  ```bash
  bun run format
  ```
- [ ] Check TypeScript errors
  ```bash
  bun run type-check
  ```

### 16.2 Performance Checks

- [ ] Run Lighthouse audit
- [ ] Check bundle size with visualizer
- [ ] Verify load times are acceptable

### 16.3 Accessibility

- [ ] Run accessibility audit
- [ ] Verify keyboard navigation works
- [ ] Check ARIA labels
- [ ] Verify screen reader compatibility

---

## Phase 17: Deployment Preparation

### 17.1 Production Configuration

- [ ] Configure production environment variables
- [ ] Set up production build settings
- [ ] Configure asset optimization

### 17.2 Deployment Files

- [x] Create `.gitignore` file
  ```gitignore
  node_modules
  dist
  .env
  .env.local
  bun.lockb
  ```
- [ ] Create deployment configuration
  - Vercel, Netlify, or custom deployment
- [ ] Create Dockerfile (if needed)
- [ ] Create CI/CD configuration (if needed)

---

## Quick Start Commands Reference

```bash
# Installation
bun install

# Development
bun run dev              # Start development server
bun run lint             # Run ESLint
bun run format           # Run Prettier
bun run type-check       # Check TypeScript

# Build
bun run build            # Create production build
bun run preview          # Preview production build

# Testing
bun run test             # Run tests
bun run test:watch       # Run tests in watch mode
bun run test:ui          # Run tests with UI

# shadcn/ui
bunx shadcn@latest init -t vite              # Initialize shadcn/ui
bunx shadcn@latest add <component-name>       # Add a component
bunx shadcn@latest diff                      # Check for updates
```

---

## Dependencies Summary

### Core Dependencies

- `react@^19` - React 19
- `react-dom@^19` - React DOM 19
- `vite@latest` - Vite 8.0.0
- `@vitejs/plugin-react@latest` - React plugin v6
- `typescript` - TypeScript

### Routing

- `react-router-dom@latest` - React Router v7

### State Management

- `zustand@latest` - Zustand v5

### Data Fetching

- `@tanstack/react-query@latest` - TanStack Query v5

### Forms

- `react-hook-form` - Form management
- `@hookform/resolvers` - Form resolvers
- `zod` - Schema validation

### UI Components

- `lucide-react` - Icons
- `date-fns` - Date utilities
- `clsx`, `tailwind-merge` - Class name utilities

### Charts (optional)

- `recharts` - Chart library

### Development Tools

- `eslint`, `prettier` - Code quality
- `vitest` - Testing framework
- `@testing-library/react` - React testing utilities

---

## Notes

- This project uses **Bun** as the package manager for faster installs and native TypeScript support
- Bun provides 10-100x faster installation speeds compared to npm
- Bun has built-in TypeScript, test runner, and bundler capabilities
- This project uses Vite 8 with Rolldown for 10-30x faster builds
- React 19 includes React Compiler v1.0 for automatic optimization
- Zustand is recommended for state management due to minimal boilerplate
- TanStack Query provides production-ready data fetching with caching
- shadcn/ui provides accessible, customizable UI components with full code ownership
- The project structure is designed for scalability with clear separation of concerns
- Dark mode is implemented with system preference detection
- All components are TypeScript with strict type checking enabled
- No authentication system is included - this is a public-facing dashboard

---

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Vite 8 Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Router v7 Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Total Estimated Time**: 4-6 hours for complete setup
**Lines of Code**: ~2,000+ for initial setup
**Bundle Size**: ~150KB (gzipped) for production build
