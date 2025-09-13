# MaidsforHire CRM Design Guidelines

## Design Approach
**System-Based Approach**: Given the utility-focused nature of a CRM system with information-dense interfaces requiring consistency and efficiency, I'm selecting a **design system approach** using modern SaaS application patterns inspired by Linear, Notion, and other productivity tools.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 220 85% 95% (soft blue background), 220 90% 45% (primary blue)
- Dark Mode: 220 15% 10% (dark background), 220 85% 65% (lighter blue)

**Semantic Colors:**
- Success: 140 50% 45% (job completed)
- Warning: 45 85% 55% (pending jobs)
- Error: 0 70% 55% (cancelled/issues)
- Neutral: 220 10% 40% (secondary text)

### B. Typography
**Font Stack:** Inter via Google Fonts CDN
- Headers: 600 weight, sizes 24px-32px
- Body: 400 weight, 14-16px
- Small text: 400 weight, 12px
- Data tables: 500 weight, 14px for better readability

### C. Layout System
**Tailwind Spacing Units:** Consistent use of 2, 4, 6, 8, 12, 16 units
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Grid gaps: gap-4, gap-6
- Container max-width: max-w-7xl with mx-auto

### D. Component Library

**Navigation:**
- Sidebar navigation with collapsible sections
- Breadcrumb trails for deep navigation
- Tab navigation for related views

**Data Display:**
- Clean tables with alternating row colors
- Status badges with semantic coloring
- Progress indicators for job completion
- Calendar/schedule grid components

**Forms:**
- Grouped form sections with clear labels
- Inline validation with helpful error states
- Multi-step forms for complex workflows
- Search and filter components

**Dashboard:**
- Card-based metrics display
- Chart components for analytics
- Quick action buttons
- Recent activity feeds

### E. Key UX Patterns

**Information Architecture:**
- Dashboard → Jobs → Customers → Staff → Settings flow
- Contextual actions always visible in relevant sections
- Search-first approach for finding records

**Mobile Responsiveness:**
- Collapsible sidebar on mobile
- Stacked card layouts for job listings
- Touch-friendly button sizes (min 44px)
- Swipe actions for mobile job management

**Data-Heavy Interface Considerations:**
- Generous whitespace between sections
- Clear visual hierarchy with consistent typography scale
- Subtle borders and shadows for component separation
- Loading states for all async operations

## Critical Features Integration
- SMS notifications styled as toast components
- Calendar integration with clear time slot visualization
- Photo upload areas with drag-and-drop styling
- Payment status indicators with clear visual states

## Accessibility
- WCAG 2.1 AA compliance throughout
- Consistent dark/light mode toggle
- Keyboard navigation for all interactive elements
- Screen reader friendly data table structures

This design system prioritizes functionality and data clarity while maintaining a modern, professional aesthetic appropriate for a business management tool.