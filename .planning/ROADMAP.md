# Roadmap

## Phase 0: Project Scaffold & Environment Setup
- **Goal**: Initialize Next.js 14, Tailwind, shadcn/ui, Supabase Schema, env files, and MCP mock checks.
- **Agent**: DevOps bootstrapper

## Phase 1: Layout System & Responsive Shell
- **Goal**: Build the global responsive layout shell used across all pages.
- **Agent**: Frontend architect

## Phase 2: Auth & Session (Screen 0)
- **Goal**: Landing/Auth Page, Google OAuth, Guest mode, Feature-gate soft prompt, RFID auto-login.
- **Agent**: Auth engineer

## Phase 3: File Upload & Selection (Step 1)
- **Goal**: File upload zone, metadata extraction, card rendering, and validation.
- **Agent**: Upload engineer

## Phase 4: Print Settings (Step 2)
- **Goal**: Per-file settings panel, copies, color mode, page selection thumbnail grid.
- **Agent**: Print configuration engineer

## Phase 5: Order Summary & Billing (Step 3)
- **Goal**: Per-file summary card, billing calculations, cloud save prompt, Razorpay order creation.
- **Agent**: Billing logic engineer

## Phase 6: Payment (Step 4)
- **Goal**: Payment status, UPI deep-link button, QR code, Webhook polling.
- **Agent**: Payment integration engineer

## Phase 7: Confirmation & OTP (Step 5)
- **Goal**: Payment success animation, OTP generation, live countdown timer, cloud save execution, PDF receipt download.
- **Agent**: OTP & completion engineer

## Phase 8: Profile & Cloud Account Page
- **Goal**: User profile side drawer, cloud documents list, storage usage bar, print history table.
- **Agent**: Profile UI engineer

## Phase 9: Kiosk Mode
- **Goal**: `?mode=kiosk` CSS overrides, RFID tap entry bridge, auto-reset on inactivity, heartbeat check.
- **Agent**: Kiosk UX engineer

## Phase 10: Cross-Device QA, Polish & Deploy
- **Goal**: Responsive QA across breakpoints, accessibility checks, performance tuning, final Vercel deploy.
- **Agent**: QA + finisher
