# HireStack Frontend Architecture

## Tech Stack

- **UI Framework:** React 19.2.0
- **Language:** TypeScript 5.9.3 (strict mode)
- **Routing:** React Router v7.9.6
- **State Management:** React Query 5.90.10 + React Context
- **Styling:** Tailwind CSS 4.1.17 + CVA 0.7.1
- **UI Components:** Radix UI + Lucide Icons 0.554.0
- **Build Tool:** Vite 7.2.4

## Project Structure

```
src/
├── auth/                  # Authentication domain
│   ├── AuthContext.tsx    # Global auth state
│   ├── ProtectedRoute.tsx # Route guard
│   ├── auth.service.ts    # Auth API calls
│   ├── auth.types.ts      # Auth type definitions
│   └── tokenStorage.ts    # Token persistence layer
├── candidates/            # Candidate domain
│   ├── candidate.service.ts
│   ├── candidate.types.ts
│   └── candidate.utils.ts
├── companies/             # Company domain
│   ├── company.service.ts
│   └── company.types.ts
├── components/            # Reusable components
│   ├── ui/               # Primitives (Radix + CVA)
│   ├── profile/          # Profile-specific
│   ├── Layout.tsx
│   └── AppSidebar.tsx
├── hooks/                 # Custom hooks
│   ├── usePaginatedQuery.ts
│   ├── useHoverPrefetch.ts
│   └── usePrefetchManager.ts
├── pages/                 # Route-level components
├── lib/                   # Core utilities
│   ├── api.ts            # API layer
│   ├── query-keys.ts     # Query key factory
│   ├── query-client.ts   # QueryClient config
│   ├── prefetch-config.ts
│   └── utils.ts
└── assets/
```

**Design Philosophy:** Feature-based modules with clear separation of service/types/utils per domain.

## State Management

### Global Auth State: React Context
- `AuthContext.tsx` manages user, organization, loading, isAuthenticated
- Custom `useAuth()` hook for consumption
- Single source of truth for authentication

### Server State: React Query
- **Configuration:**
  - staleTime: 5 minutes
  - gcTime (cache): 10 minutes
  - retry: 1 attempt
  - No refetch on window focus
- **Query Key Factory:** Centralized in `query-keys.ts` for type safety
- **Features:** Prefetching, cache invalidation, optimistic updates

**Rationale:** No Redux/Zustand needed. Context + React Query is sufficient for this domain.

## API Layer Architecture

### Two-Tier Abstraction

#### 1. Public API (`apiRequest`)
- For unauthenticated endpoints (login, register)
- Basic error handling with status-specific messages

#### 2. Authenticated API (`authenticatedRequest`)
- Automatic Bearer token injection
- **Proactive token refresh:** 2-minute buffer before expiry
- **Reactive token refresh:** Fallback on 401 response
- Prevents concurrent refresh attempts with flag/promise
- Handles FormData for file uploads (no Content-Type header)

### Service Layer Pattern
- Domain-specific services export typed async functions
- Example: `candidateService.ts`, `companyService.ts`
- URLSearchParams for query parameters
- Type-safe Promise returns

## Authentication Architecture

### Hybrid Auth Restoration Strategy

**Phase 1: Fast Path** (no API call)
- Checks access token validity in `sessionStorage`
- Decodes JWT locally to extract user data
- Uses cached organization from `localStorage`
- Proactively refreshes if token within 5 minutes of expiry

**Phase 2: Slow Path** (API call required)
- Uses refresh token to obtain new access token
- Clears invalid tokens on failure

### Token Storage Strategy
| Token Type | Storage | Lifespan | Reason |
|------------|---------|----------|--------|
| Access Token | `sessionStorage` | Short-lived | XSS mitigation, cleared on browser close |
| Refresh Token | `localStorage` | Persistent | Auto-restoration across sessions |
| Organization | `localStorage` | Persistent | UI caching |

### Triple Token Refresh Mechanisms
1. **Background proactive:** 5 minutes before expiry during auth init
2. **Request-level proactive:** 2-minute buffer in `authenticatedRequest`
3. **Reactive fallback:** On 401 response

## Routing Architecture

### Route Structure
```
/auth/login, /auth/register          # Public routes
/                                    # Protected (ProtectedRoute wrapper)
├── /                                # Dashboard
├── /candidates
│   ├── /create
│   ├── /import
│   ├── /:id/edit
│   └── /:id                         # Detail with hover prefetch
├── /companies
│   ├── /create
│   └── /:id
└── /organizations                    # Coming soon
```

### Protection Strategy
- `ProtectedRoute` component wraps authenticated routes
- Shows loading state during auth initialization
- Redirects to `/auth/login` if unauthenticated

## Component Architecture

### Component Hierarchy

#### UI Primitives (`components/ui/`)
- Radix UI base + CVA for type-safe variants
- Components: Button, Card, Badge, Table, Pagination, Input, Label, TextArea
- Variants: default, secondary, ghost, outline, destructive

#### Domain Components (`components/profile/`)
- Focused, composable pieces
- Examples: ProfileHeader, ExperienceSection, SkillsSection
- Return `null` when data is empty (conditional rendering)

#### Layout Components
- `Layout.tsx`: Main app wrapper with sidebar
- `AppSidebar.tsx`: Navigation and user menu

#### Page Components (`pages/`)
- Route-level containers
- Handle data fetching, state management, layout composition
- Pass event handlers down (handlePageChange, handleLogout)

### Composition Patterns
- Props-based configuration
- Conditional rendering for loading/error states
- Event handlers passed down

## Performance Optimizations

### 1. Data Prefetching Strategy
- **Hover prefetch:** 200ms delay via `useHoverPrefetch` hook
- **Pagination prefetch:** Adjacent pages fetched automatically
- **App load prefetch:** First candidate page on initialization
- **Configuration:** Centralized in `prefetch-config.ts`

### 2. Query Cache Optimization
- `keepPreviousData` for smooth pagination transitions
- Selective cache invalidation (invalidate lists on delete, not all)
- 5-minute stale time reduces unnecessary refetches

### 3. Component Optimization
- `useMemo` for pagination params (prevent hook dependency changes)
- `useCallback` for event handlers
- Memoized query key generation

### 4. Token Management
- Proactive refresh prevents 401 errors during user interaction
- SessionStorage for access token reduces XSS attack surface

### 5. Build Optimization
- Vite for fast builds with HMR
- ESM modules, tree-shaking friendly

## TypeScript Patterns

### Configuration
- Strict mode enabled: `noUnusedLocals`, `noUnusedParameters`, `strict: true`
- Path aliases: `@/*` maps to `src/`

### Type Definitions
- Domain types in `*.types.ts` files
- Generic service functions: `apiRequest<T>`, `usePaginatedQuery<TData, TParams>`
- Type narrowing with `instanceof Error` checks
- React.ReactNode for children props

### Query Key Factory Pattern
```typescript
export const queryKeys = {
  candidates: {
    list: (params: PaginationParams) => ['candidates', 'list', params],
    detail: (id: string) => ['candidates', 'detail', id],
  },
  companies: { ... }
}
```

## Key Architectural Decisions

1. **No state management library:** Context + React Query handles all requirements elegantly
2. **JWT parsing client-side:** Fast auth restoration without API calls
3. **Dual token strategy:** Balances security (short-lived access) and UX (refresh persistence)
4. **Query key factory:** Type-safe, maintainable cache management
5. **Service layer abstraction:** Clear API contracts, easy to mock for testing
6. **Hybrid auth init:** Optimizes for common case (user logged in) while handling refresh gracefully

## Missing Implementations

### Critical
- **Company update/delete endpoints:** `src/companies/company.service.ts:37-45` (commented stubs)

### Non-Critical
- **Dashboard quick stats:** `src/pages/Dashboard.tsx:68` (placeholder)
- **Company edit/delete UI:** `src/pages/CompanyDetail.tsx:99-106` (disabled buttons)
- **Optional prefetch configs:** `src/lib/prefetch-config.ts:45-50, 60-63` (templates)

## Philosophy

Lean, pragmatic architecture optimized for performance, type safety, and developer experience. Avoids over-engineering while maintaining scalability and maintainability.
