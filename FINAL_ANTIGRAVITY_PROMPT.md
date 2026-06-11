# CAMPUSPRINT — FINAL MASTER PROMPT (ANTIGRAVITY)

You are building the production frontend for "CampusPrint" — the official on-campus document printing service for Presidency University.

All screens and components have been successfully prototyped and locked. Your task is to implement the full application utilizing these approved designs as your strict source of truth.

## LOCKED REFERENCE FILES
The following locked HTML files contain the exact pixel-perfect designs, inline SVGs, layout structures, and CSS animations. **Do not deviate from the UI/UX established in these files.**

*   **Screens 0-6 (Landing, Upload, Print Settings, Post-Print, Payment, OTP, Profile/Cloud/Activity):** *(Refer to previously locked project HTML files)*
*   **Kiosk Mode:** `d:\Prikio\campusprint-kiosk.html` (Contains RFID overlay, 1080p layout, Offline state, Idle Warning)
*   **Global Components:** `d:\Prikio\campusprint-global.html` (Contains Timers, Steppers, Toasts, Feature Gate, Idle Warning, Confirm Dialog)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 01. TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERIF  → Cormorant Garamond (italic 600)
SANS   → DM Sans (300 / 400 / 500 / 600 / 700)

Google Fonts import:
`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 02. COLOR TOKENS & NAVY RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*   `--navy`      #0D1F3C
*   `--accent`    #2B4EAA
*   `--accent-s`  #EEF2FF
*   `--gd`        #1F2937
*   `--grey-mid`  #6B7280
*   `--grey`      #9CA3AF
*   `--gl`        #F9FAFB
*   `--border`    #F3F4F6
*   `--bg`        #FFFFFF
*   `--body-bg`   #ECEEF2
*   `--green`     #10B981
*   `--green-s`   #ECFDF5
*   `--amber`     #F59E0B
*   `--amber-s`   #FFFBEB
*   `--red`       #EF4444
*   `--red-s`     #FEF2F2

**CRITICAL NAVY RULE:** Navy (#0D1F3C) is ONLY permitted in Avatar circles, Primary CTA buttons, Sticky bottom nav bars, Desktop sidebar bg, Kiosk/collect dark headers, QR code modules, and the Payment Success circle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 03. DEVELOPMENT INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.  **Architecture:** Integrate the provided UI components into the existing application architecture (Next.js/React). 
2.  **Styles:** Extract the CSS variables from the locked HTML files into your global stylesheet/theme.
3.  **SVGs:** Continue to use the inline SVG code provided in the locked HTML files as functional React components. Do not import external icon libraries.
4.  **State Management:** Hook up interactive states (toggles, inputs, stepper progress, timer countdowns) to application state (e.g., Zustand in `src/store/useAppStore.ts`).
5.  **Faithful Reproduction:** The React components must visually and behaviorally match the locked HTML prototypes 1:1. Maintain the "Minimal Design = Maximum Whitespace" rule.
