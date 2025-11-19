# Integrations Module

A complete, production-ready integrations management system for the EchoBot application.

## Overview

The integrations module provides a comprehensive UI for managing third-party service integrations. It includes filtering, searching, real-time connection status, and a modular architecture for easy extension.

## Features

- **Complete Integration Management**: View, filter, and search available integrations
- **Real-time Connection Status**: Track which integrations are connected
- **Category Filtering**: Filter by communication, voice, AI, automation, database, and security
- **Search Functionality**: Debounced search with instant results
- **Connected-Only Filter**: Quick view of active integrations
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful messages for no results, no connections, and errors
- **Error Boundaries**: Graceful error handling with recovery options
- **Statistics Dashboard**: Overview cards showing total, connected, available, and coming soon integrations
- **Modular Components**: Reusable, well-documented components
- **TypeScript**: Fully typed for better DX and safety
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## Architecture

```
integrations/
├── constants.ts                    # Integration definitions, types, and utilities
├── hooks/
│   └── use-integrations.ts         # Custom hook for integration state management
├── ui/
│   ├── components/
│   │   ├── integration-card.tsx              # Main integration card
│   │   ├── integration-status-badge.tsx      # Status indicator
│   │   ├── integration-filters.tsx           # Category and filter controls
│   │   ├── integration-search.tsx            # Search input with debouncing
│   │   ├── integration-empty-state.tsx       # Empty state messages
│   │   ├── integration-error-boundary.tsx    # Error handling
│   │   ├── integration-loading-skeleton.tsx  # Loading states
│   │   └── index.ts                          # Component exports
│   └── views/
│       └── integrations-view.tsx   # Main view component
└── README.md                       # This file
```

## Components

### IntegrationsView
The main view component that orchestrates all functionality.

**Features:**
- Organization ID display with copy functionality
- Statistics dashboard (4 stat cards)
- Search and filter controls
- Grid layout with responsive breakpoints
- Loading, empty, and error states
- Result count with clear filters option

### IntegrationCard
Displays individual integration details with connect/setup options.

**Props:**
- `integration: Integration` - Integration data
- `isConnected?: boolean` - Connection status
- `onConnect?: () => void` - Connect handler
- `isLoading?: boolean` - Loading state

**Features:**
- Service logo with error fallback
- Connection status badge
- Premium integration indicator
- Feature list (shows top 3, with "+N more" indicator)
- Context-aware buttons (Connect/Configure/Coming Soon)
- Documentation link
- Hover effects and transitions

### IntegrationFilters
Category tabs and filter controls.

**Props:**
- `selectedCategory: IntegrationCategory` - Active category
- `onCategoryChange: (category) => void` - Category change handler
- `showConnectedOnly: boolean` - Connected filter state
- `onShowConnectedOnlyChange: (show) => void` - Filter change handler
- `connectedCount?: number` - Number of connected integrations

**Features:**
- Desktop: Horizontal tabs with icons
- Mobile: Dropdown menu
- Connected-only toggle with count badge
- Icon + label for each category

### IntegrationSearch
Search input with debouncing.

**Props:**
- `onSearch: (query: string) => void` - Search handler
- `placeholder?: string` - Custom placeholder
- `debounceMs?: number` - Debounce delay (default: 300ms)

**Features:**
- Search icon indicator
- Clear button (appears when typing)
- Debounced input (reduces unnecessary renders)
- Accessible labels

### IntegrationStatusBadge
Visual status indicator.

**Props:**
- `status: IntegrationStatus` - Status to display

**Variants:**
- `available` - Blue badge with PackageIcon
- `connected` - Green badge with CheckCircle2Icon
- `coming-soon` - Gray badge with ClockIcon

### IntegrationEmptyState
Context-aware empty state messages.

**Props:**
- `type: "no-results" | "no-connected" | "error"` - Empty state type
- `onReset?: () => void` - Reset filters handler
- `errorMessage?: string` - Custom error message

**Features:**
- Different icons and messages per type
- Optional reset button
- Card layout with dashed border

### IntegrationErrorBoundary
React error boundary for graceful error handling.

**Props:**
- `children: ReactNode` - Child components
- `fallback?: ReactNode` - Custom fallback UI

**Features:**
- Catches runtime errors
- Shows error details in development
- Try again and reload options
- Logs errors to console

### IntegrationLoadingSkeleton
Loading placeholder components.

**Components:**
- `IntegrationLoadingSkeleton` - Single card skeleton
- `IntegrationLoadingGrid` - Grid of skeletons (default: 4)

## Hooks

### useIntegrations
Custom hook for managing integrations state.

**Returns:**
```typescript
{
  // Data
  integrations: Integration[]           // Filtered integrations
  connectedIntegrations: Set<string>    // Connected integration IDs
  stats: {
    total: number
    connected: number
    available: number
    comingSoon: number
  }

  // Filters
  selectedCategory: IntegrationCategory
  setSelectedCategory: (category) => void
  searchQuery: string
  setSearchQuery: (query) => void
  showConnectedOnly: boolean
  setShowConnectedOnly: (show) => void

  // Helpers
  isConnected: (id: string) => boolean
  resetFilters: () => void
  hasActiveFilters: boolean
  isLoading: boolean
}
```

**Features:**
- Fetches connected plugins from backend (Convex)
- Filters by category, search query, and connection status
- Provides statistics
- Tracks active filters
- Memoized for performance

## Types

### IntegrationCategory
```typescript
type IntegrationCategory =
  | "all"
  | "communication"
  | "voice"
  | "ai"
  | "automation"
  | "database"
  | "security";
```

### IntegrationStatus
```typescript
type IntegrationStatus = "available" | "connected" | "coming-soon";
```

### IntegrationService
```typescript
type IntegrationService = "vapi" | "slack" | "discord" | "twilio";
```

### Integration
```typescript
interface Integration {
  id: IntegrationService
  name: string
  description: string
  image: string
  category: IntegrationCategory
  status: IntegrationStatus
  features: IntegrationFeature[]
  setupUrl?: string
  docsUrl?: string
  isPremium?: boolean
}
```

## Constants

### INTEGRATION_CATEGORIES
Array of category configurations with icons and labels.

### AVAILABLE_INTEGRATIONS
Array of all available integrations. Currently includes:
- **Vapi** (Available) - AI-powered voice calls
- **Slack** (Coming Soon) - Workspace notifications
- **Discord** (Coming Soon) - Community support
- **Twilio** (Coming Soon, Premium) - SMS and voice

## Utility Functions

### getIntegrationById(id)
Get integration by service ID.

### filterIntegrationsByCategory(category)
Filter integrations by category.

### filterIntegrationsByStatus(status)
Filter integrations by status.

### searchIntegrations(query)
Search integrations by name, description, or category.

## Adding New Integrations

1. **Add to constants.ts:**
   ```typescript
   // Add to IntegrationService type
   type IntegrationService = "vapi" | "slack" | "your-service";

   // Add to AVAILABLE_INTEGRATIONS array
   {
     id: "your-service",
     name: "Your Service",
     description: "Service description",
     image: "/your-service.jpg",
     category: "communication",
     status: "available",
     features: [
       {
         icon: YourIcon,
         label: "Feature name",
         description: "Feature description",
       },
     ],
     setupUrl: "/plugins/your-service",
     docsUrl: "https://docs.your-service.com",
   }
   ```

2. **Update backend schema** (if needed):
   ```typescript
   // In packages/backend/convex/schema.ts
   service: v.union(v.literal("vapi"), v.literal("your-service"))
   ```

3. **Add setup page** (if needed):
   Create `/apps/web/app/(dashboard)/plugins/your-service/page.tsx`

4. **Update useIntegrations hook** (if checking connection status):
   ```typescript
   const yourServicePlugin = useQuery(api.private.plugins.getOne, {
     service: "your-service"
   });

   if (yourServicePlugin) {
     connected.add("your-service");
   }
   ```

## Error Handling

All components handle errors gracefully:

- **Network errors**: Caught by error boundary
- **Invalid data**: TypeScript prevents at compile time
- **Missing images**: Fallback to logo.svg
- **Empty states**: Context-aware messages
- **Loading states**: Skeleton loaders

## Performance Optimizations

- **Memoization**: useMemo for filtered data
- **Debouncing**: 300ms debounce on search
- **Lazy loading**: Images load on-demand
- **Code splitting**: Error boundary prevents cascade failures
- **Efficient filtering**: Single-pass filters

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- High contrast text
- Screen reader friendly

## Responsive Design

- **Mobile** (< 640px): Single column, dropdown filters
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (1024px - 1280px): 3 columns
- **Large** (> 1280px): 4 columns

## Testing Checklist

- [ ] All integrations display correctly
- [ ] Category filtering works
- [ ] Search filters results
- [ ] Connected-only filter works
- [ ] Copy organization ID works
- [ ] Connect button navigates correctly
- [ ] Empty states show appropriately
- [ ] Loading states display
- [ ] Error boundary catches errors
- [ ] Responsive on all screen sizes
- [ ] Keyboard navigation works
- [ ] Premium badges show correctly
- [ ] Coming soon integrations are disabled

## Future Enhancements

- Integration health monitoring
- Connection test functionality
- Webhook configuration UI
- Integration usage analytics
- Batch connect/disconnect
- Integration recommendations
- In-app setup wizards
- Integration marketplace ratings/reviews

## Dependencies

- React 18+
- Next.js 14+
- Convex (backend)
- Clerk (authentication)
- Radix UI components
- Lucide icons
- Tailwind CSS
- TypeScript 5+

## License

Proprietary - EchoBot Application
