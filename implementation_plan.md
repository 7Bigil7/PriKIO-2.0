# Phase 1: Layout System & Responsive Shell

## Goal
Build the global responsive layout shell used across all pages of the College Print Kiosk.

## User Review Required
> [!IMPORTANT]
> The requested `?mode=kiosk` URL parameter approach requires passing state from the URL into the root layout's `<body>` class. I plan to handle this elegantly using a custom hook (`useKioskMode`) combined with a global Zustand store so the `kiosk` class can be dynamically applied client-side without hydration mismatches. Please confirm this architecture.

## Proposed Changes

### 1. Global State Management (Zustand)
- **[NEW]** `src/store/useAppStore.ts`
  - Manage global state for: `currentStep` (0-5), `kioskMode` (boolean), `sessionTimeRemaining` (number).

### 2. Core Layout Components
- **[NEW]** `src/components/layout/AppShell.tsx`
  - The main wrapper implementing the responsive breakpoint logic:
    - **Mobile/Tablet**: Single column, sticky top progress stepper, bottom CTA bar.
    - **Desktop**: Two-column layout (Left sidebar for stepper, right for active step content).
    - **Kiosk**: Full-screen, centered 800px max-width, no sidebar, larger touch targets.
- **[NEW]** `src/components/layout/Header.tsx`
  - Renders the college logo, embed the `SessionTimer`, and avatar/profile icon.
- **[NEW]** `src/components/layout/SessionTimer.tsx`
  - Global countdown timer with a 2-minute warning modal ("Your session is about to expire" + 60s countdown).
- **[NEW]** `src/components/layout/Stepper.tsx`
  - 5-step progress stepper. Will show full labels on Desktop/Tablet and icon-only on Mobile.

### 3. Page Transitions & Kiosk Detection
- **[NEW]** `src/components/layout/PageTransition.tsx`
  - Wraps route content in Framer Motion's `<AnimatePresence>` for slide-in/slide-out animations based on `currentStep` changes.
- **[NEW]** `src/hooks/useKioskMode.ts`
  - Client-side hook that reads `?mode=kiosk` from the URL, updates the Zustand store, and appends the `.kiosk-mode` class to the HTML body.

### 4. Tailwind Configuration Updates
- **[MODIFY]** `src/app/globals.css`
  - Add specific `.kiosk-mode` overrides for base font sizes (18px) and touch targets (min 64px height/width).

### 5. Application Root Update
- **[MODIFY]** `src/app/layout.tsx`
  - Wrap `children` with the `AppShell`.
- **[MODIFY]** `src/app/page.tsx`
  - Replace default boilerplate with a placeholder for Phase 2 (Screen 0).

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` to verify there are no hydration or TypeScript errors.

### Manual Verification
- Resize the browser window to test Mobile (375px), Tablet (768px), Desktop (1280px), and Kiosk (1080p).
- Append `?mode=kiosk` to the URL and verify UI elements scale up and the session timer disappears.
- Wait for the session timer to hit the 2-minute mark and ensure the warning modal pops up correctly.
