# PrintFlow — OTP-Gated Raspberry Pi Print System

## GSD Spec for Antigravity Agent

\---

## /gsd:init — Project Bootstrap

**Project name:** `printflow`
**Stack:** Python 3.11 (Pi), Node.js 20 / FastAPI (backend), React (frontend), CUPS (printer), WebSocket (real-time bridge)
**Hardware target:** Raspberry Pi 5, USB/network printer, touch display (phone/laptop for testing)

\---

## System Overview

A user uploads a file on the web. The backend generates a one-time OTP tied to that file. The OTP is pushed in real time to the Raspberry Pi. The user enters the OTP on a display (phone/laptop acting as touchscreen). Only when the OTP matches does the Pi trigger the printer.

**Security invariant:** The printer NEVER fires without a valid OTP match. The OTP is single-use and expires after 5 minutes.

\---

## /gsd:spec — Full Implementation Spec

### Module 1 — Backend API (`/backend`)

**Tech:** Node.js 20 + Express OR Python FastAPI (pick one, default FastAPI)
**Responsibility:** File intake, OTP generation, WebSocket push, OTP validation endpoint

#### Endpoints

```
POST /api/upload
  - Accept multipart file upload
  - Store file to /tmp/printflow/<uuid>/<filename>
  - Generate 6-digit OTP (crypto.randomInt or secrets.token\_digits)
  - Store in Redis: key=otp:<job\_id>, value=<otp>, TTL=300s
  - Emit WebSocket event `job:new` to Pi channel with { job\_id, filename, otp, filepath }
  - Return to browser: { job\_id, otp, expires\_in: 300 }

POST /api/verify-otp
  - Body: { job\_id, otp\_entered }
  - Validate against Redis
  - If match: mark job as verified, emit `job:verified` to Pi, return { success: true }
  - If mismatch: return { success: false, message: "Invalid OTP" }
  - If expired: return { success: false, message: "OTP expired" }
  - On success: delete OTP from Redis (single-use enforcement)

GET /api/job/:job\_id/status
  - Return job state: pending | verified | printing | done | failed

WebSocket /ws
  - Authenticated channel for Pi to subscribe
  - Pi connects with a shared secret header: X-Pi-Secret: <env:PI\_SECRET>
  - Events emitted to Pi: job:new, job:verified, job:cancel
```

#### OTP Generation Rules

* 6 digits, zero-padded (e.g. "042891")
* Generated using cryptographically secure RNG only (`secrets` module in Python, `crypto.randomInt` in Node)
* Stored server-side only — never in URL, never in cookies
* TTL: 300 seconds (Redis TTL enforced)
* Single-use: deleted after first successful verification

#### File Storage

* Local path: `/tmp/printflow/<job\_id>/<original\_filename>`
* Max file size: 50MB (enforced at upload)
* Allowed types: PDF, PNG, JPG, DOCX (MIME check, not just extension)

\---

### Module 2 — Web Frontend (`/frontend`)

**Tech:** React 18 + Vite + TailwindCSS
**Pages:**

#### `/` — Upload Page

* Drag-and-drop file upload area
* File type + size validation (client-side pre-check)
* On submit: POST to `/api/upload`
* On success: redirect to `/otp/:job\_id`

#### `/otp/:job\_id` — OTP Display Page

* Large, prominent OTP display (e.g. "Your code: **042891**")
* Countdown timer (300s → 0)
* Status indicator: waiting for entry / verified / printing
* WebSocket connection to backend for live status updates
* On `job:printing` event: show "Printing…" with spinner
* On `job:done`: show success + print receipt summary
* "Upload another file" CTA

#### `/display` — Pi-side Display UI (opened on phone/laptop as kiosk)

* Full-screen OTP entry keypad (large touch-friendly buttons)
* 6-digit OTP input with visual slots
* "Print" button — calls `POST /api/verify-otp`
* Shows job filename once Pi receives `job:new`
* Success/error feedback states
* Auto-clears after job completes

\---

### Module 3 — Raspberry Pi Controller (`/pi`)

**Tech:** Python 3.11
**Dependencies:** `websocket-client`, `python-escpos` or `pycups`, `redis` (optional local cache), `requests`

#### `main.py` — Entry Point

```python
# Responsibilities:
# 1. Connect to backend WebSocket on startup
# 2. Listen for job:new events → cache OTP locally in memory dict
# 3. Listen for job:verified events → trigger print\_job()
# 4. Handle reconnection with exponential backoff
# 5. Log all events to /var/log/printflow/pi.log
```

#### `printer.py` — Print Trigger

```python
# Functions:
# print\_job(job\_id, filepath, filename)
#   - Determine file type
#   - Route to correct print method:
#       PDF → cups\_print\_pdf()
#       Image → cups\_print\_image()
#       DOCX → convert\_to\_pdf() then cups\_print\_pdf()
#   - Update job status via POST /api/job/:id/status

# cups\_print\_pdf(filepath)
#   - Use subprocess: lp -d <PRINTER\_NAME> <filepath>
#   - Or pycups: conn.printFile(printer, filepath, title, options)
#   - Return (success: bool, job\_id: str)
```

#### `otp\_verifier.py` — Local OTP Guard

```python
# Local secondary check (belt-and-suspenders):
# verify\_otp(job\_id, entered\_otp) -> bool
#   - Check in-memory store populated from job:new events
#   - This is NOT the primary gate (server is) — used for offline resilience
#   - Clear entry after verification
```

#### `display\_client.py` — Display Interface Bridge

```python
# If display is a phone/laptop on same LAN:
# - Pi hosts a lightweight HTTP server (Flask/FastAPI) on port 8080
# - Display browser opens http://<pi-ip>:8080/display
# - This serves the /display React page via Pi's local server
# - Alternatively: display opens the cloud frontend /display route directly
```

#### Pi Environment Config (`.env`)

```
BACKEND\_WS\_URL=wss://your-backend.com/ws
BACKEND\_API\_URL=https://your-backend.com
PI\_SECRET=<shared-secret-minimum-32-chars>
PRINTER\_NAME=<CUPS-printer-name>   # find with: lpstat -p
DISPLAY\_URL=http://localhost:8080/display
LOG\_LEVEL=INFO
```

\---

### Module 4 — Infrastructure (`/infra`)

#### Docker Compose (development)

```yaml
services:
  backend:
    build: ./backend
    ports: \["3000:3000"]
    environment:
      - REDIS\_URL=redis://redis:6379
      - PI\_SECRET=${PI\_SECRET}
    depends\_on: \[redis]

  frontend:
    build: ./frontend
    ports: \["5173:5173"]

  redis:
    image: redis:7-alpine
    ports: \["6379:6379"]
```

#### Pi systemd Service (`/etc/systemd/system/printflow.service`)

```ini
\[Unit]
Description=PrintFlow Pi Controller
After=network-online.target
Wants=network-online.target

\[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/printflow
ExecStart=/home/pi/printflow/venv/bin/python main.py
Restart=always
RestartSec=5
EnvironmentFile=/home/pi/printflow/.env

\[Install]
WantedBy=multi-user.target
```

\---

## /gsd:flow — Complete Data Flow (step by step)

```
1. User → uploads file on Web Frontend
2. Frontend → POST /api/upload (multipart)
3. Backend → saves file, generates OTP, stores in Redis (TTL 300s)
4. Backend → emits WebSocket `job:new` { job\_id, otp, filename, filepath } to Pi
5. Backend → returns { job\_id, otp } to browser
6. Frontend → shows OTP on screen to user
7. Pi → receives `job:new`, caches { job\_id, otp } in memory
8. Pi → pushes job filename to Display UI via local WebSocket
9. Display → shows job filename + OTP entry keypad to user
10. User → physically walks to Pi/display, enters 6-digit OTP
11. Display → POST /api/verify-otp { job\_id, otp\_entered }
12. Backend → validates OTP against Redis
    ├── MATCH → delete OTP, emit `job:verified` to Pi, return { success: true }
    └── NO MATCH → return { success: false }, Display shows error
13. Pi → receives `job:verified`
    ├── Downloads file from backend (if not already local)
    └── Calls print\_job(job\_id, filepath)
14. Pi → sends print job to CUPS / lp
15. Pi → POSTs status update: job:printing → job:done
16. Frontend (browser) → receives status via WebSocket, shows "Printing!" / "Done"
```

\---

## /gsd:tasks — Ordered Build Checklist

### Phase 1 — Backend Core

* \[ ] `T01` Scaffold FastAPI app with `/api/upload`, `/api/verify-otp`, `/api/job/:id/status`
* \[ ] `T02` Integrate Redis for OTP storage with TTL
* \[ ] `T03` Implement WebSocket server with Pi authentication (shared secret header)
* \[ ] `T04` File save logic with UUID job folders, MIME validation, 50MB limit
* \[ ] `T05` OTP generation using `secrets.randbelow(1\_000\_000)` zero-padded to 6 digits
* \[ ] `T06` Emit `job:new` event to Pi WebSocket channel on upload
* \[ ] `T07` Emit `job:verified` event to Pi on successful OTP match
* \[ ] `T08` Add rate limiting: max 5 OTP attempts per job\_id before lockout

### Phase 2 — Frontend

* \[ ] `T09` Scaffold React + Vite + Tailwind project
* \[ ] `T10` Build Upload page with drag-and-drop, file type guard, 50MB check
* \[ ] `T11` Build OTP Display page with countdown timer + WebSocket status listener
* \[ ] `T12` Build Display/Kiosk page: full-screen OTP keypad, 6-digit slot UI, "Print" button
* \[ ] `T13` WebSocket hook: auto-reconnect, event dispatch to React state
* \[ ] `T14` Mobile-responsive layout for `/display` (kiosk mode, no scrollbars)

### Phase 3 — Raspberry Pi Controller

* \[ ] `T15` Set up Python venv, install: `websocket-client`, `pycups`, `requests`, `python-dotenv`
* \[ ] `T16` Write `main.py`: WebSocket connect, event loop, reconnect with backoff
* \[ ] `T17` Write `printer.py`: CUPS print via `subprocess lp` with error handling
* \[ ] `T18` Write `otp\_verifier.py`: in-memory local OTP store
* \[ ] `T19` Add CUPS printer detection on startup (`lpstat -p`), exit with clear error if none found
* \[ ] `T20` Write startup script + systemd service file
* \[ ] `T21` Test end-to-end: upload → OTP displayed → entered on Pi display → print fires

### Phase 4 — Polish \& Hardening

* \[ ] `T22` Add OTP expiry UI on frontend (gray out / show "expired, re-upload")
* \[ ] `T23` Add Pi heartbeat ping to backend every 30s; backend shows Pi online/offline indicator
* \[ ] `T24` Logging: Pi logs to `/var/log/printflow/pi.log`, backend to stdout + file
* \[ ] `T25` Env validation on startup for both backend and Pi (crash fast if secrets missing)
* \[ ] `T26` Write `README.md` with hardware wiring, CUPS setup, env vars, systemd install steps

\---

## /gsd:constraints — Hard Rules for Agent

1. **OTP is NEVER sent to the Pi in a URL parameter or query string.** Only via authenticated WebSocket.
2. **OTP is single-use.** Delete from Redis on first successful match.
3. **Printer trigger only runs inside the `job:verified` WebSocket handler** — never directly callable via HTTP.
4. **Pi WebSocket connection uses a shared secret** (`X-Pi-Secret` header) — reject any connection without it.
5. **No OTP stored in browser localStorage or cookies** — show it on screen once, forget it.
6. **File type is validated by MIME, not extension** — use `python-magic` or equivalent.
7. **All secrets in `.env` files, never hardcoded** — `.env` in `.gitignore` from day 1.
8. **CUPS printer name is environment-configured** — never hardcoded in source.

\---

## /gsd:test — Test Scenarios

|Scenario|Expected result|
|-|-|
|Upload valid PDF|OTP shown, Pi receives `job:new`|
|Enter correct OTP on display|Print fires, status → done|
|Enter wrong OTP|Error shown, no print|
|Wait 5 min, enter OTP|"OTP expired" error|
|Enter correct OTP twice|Second attempt → "invalid" (single-use)|
|Pi disconnected, upload file|Backend queues job, Pi gets it on reconnect|
|Upload 51MB file|Rejected at frontend and backend|
|Upload `.exe` file|Rejected (MIME mismatch)|

\---

## /gsd:directory — Repo Structure

```
printflow/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── routes/
│   │   ├── upload.py
│   │   ├── verify.py
│   │   └── status.py
│   ├── services/
│   │   ├── otp.py           # OTP generation + Redis
│   │   ├── websocket.py     # Pi channel manager
│   │   └── storage.py       # File save + MIME check
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Upload.jsx
│   │   │   ├── OTPDisplay.jsx
│   │   │   └── Kiosk.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── pi/
│   ├── main.py
│   ├── printer.py
│   ├── otp\_verifier.py
│   ├── requirements.txt
│   ├── printflow.service    # systemd unit
│   └── .env.example
├── infra/
│   ├── docker-compose.yml
│   └── nginx.conf           # optional reverse proxy
└── README.md
```

\---

## /gsd:kickoff — First Prompt for Antigravity

Paste this as your first message after `/gsd:init`:

> "Build the PrintFlow system per the GSD spec. Start with Phase 1: scaffold the FastAPI backend with the upload endpoint, Redis OTP service, and WebSocket Pi channel. Use the directory structure in `/gsd:directory`. Enforce all constraints in `/gsd:constraints`. After T01–T07 are complete, generate a quick test script I can run to simulate a Pi WebSocket connection and verify the `job:new` event fires correctly."

