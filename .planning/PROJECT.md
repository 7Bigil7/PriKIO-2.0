# Project: College Print Kiosk Website

## What This Is
A fully responsive website (works on phones, tablets, desktops, and kiosk terminals without any app installation) acting as a multi-step web form / service for a College Print Kiosk. No PWA, no native app, no installs — just a fast, beautiful, universally accessible website.

## Access Paths
1. **QR code** → opens URL in phone/tablet browser
2. **RFID tap** → auto-login URL on kiosk full-screen browser (Chrome kiosk mode)
3. **Direct URL** on any desktop/laptop browser

## Core Value
Allows students to easily upload documents, select print settings, and pay via UPI, printing their documents at a kiosk with zero friction.

## Requirements

### Validated
*(To be populated post-launch)*

### Active
- Next.js 14 (App Router, SSR) · Tailwind CSS · shadcn/ui · Framer Motion
- Supabase (auth + DB + storage)
- Razorpay (UPI payments)
- PDF.js (browser-side)
- Responsive Breakpoints: mobile (≤640px), tablet (641–1024px), desktop (1025px+), kiosk (1080p+)
- Auth: Supabase Auth — Google OAuth (restricted to @college.edu) + email+password fallback
- Auth: Guest mode — browser session only (sessionStorage, no Supabase auth)
- Payments: Razorpay UPI intent deep-link (Android) + QR code fallback (all devices)
- File Types: PDF, DOCX, PPTX, JPG, PNG
- Deploy: Vercel — single URL works everywhere. Kiosk uses same URL + `?mode=kiosk` param.

### Out of Scope
- PWA / Native App (Not required, web only)
- Hardcoded rates (Rates must be fetched from Supabase `print_config`)
- localStorage session storage for guests (Use sessionStorage)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Best SSR and routing performance | Approved |
| Supabase | All-in-one Auth, DB, and Storage | Approved |
| Razorpay | Best UPI integration for Indian payments | Approved |

---
*Last updated: Today after initialization*
