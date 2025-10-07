# AsterLaunch

Pump.fun‑style meme coin launchpad blueprint on Solana.

## Structure
- `frontend/`: Next.js + Tailwind dark, 3‑column dashboard
- `anchor/`: Anchor workspace with AsterLaunch program skeleton

## Frontend (mocked data)
1. Install deps
   ```bash
   cd frontend
   npm i
   npm run dev
   ```
2. Open http://localhost:3000
3. Pages
   - `/` Active Tokens table (mocked, refreshes ~4s)
   - `/create` Minimal creator form
   - `/coin/[ticker]` Trading view with chart + buy/sell UI (mocked)

## Anchor program (skeleton)
- Program ID: `AsterLaunch111111111111111111111111111111111`
- Instructions: `initialize_platform`, `create_token`, `buy`, `sell`, `graduate`
- Curve: linear bonding curve utils included

Build on localnet:
```bash
cd anchor
anchor build
```

> Note: The program contains placeholder Pyth type and simulated logic to compile without full external CPI.

## Zipping
To package everything:
```bash
cd /workspace
zip -r asterlaunch.zip asterlaunch
```
