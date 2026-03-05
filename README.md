# ACH Tycoon

A first-person 3D clearing house builder where your real bank transactions flow through as physical colored envelopes.

## Quick Start

### Prerequisites
- Node.js 18+
- Plaid API credentials (sandbox) — or use demo data

### Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure Plaid (optional — demo mode works without it)
cp server/.env.example server/.env
# Edit server/.env with your Plaid sandbox credentials

# Start the server
cd server && npm run dev

# In another terminal, start the client
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

### Controls
- **WASD** — Move
- **Mouse** — Look around (click to lock cursor)
- **E** — Open equipment catalog
- **F** — Interact with equipment / pick up envelopes
- **G** — Toggle placement grid
- **ESC** — Release cursor / close menus

## Tech Stack
- Three.js + React Three Fiber (3D)
- React + Zustand (UI + state)
- Express (backend)
- Plaid API (financial data)
- cannon-es (physics)
- Howler.js (audio)
