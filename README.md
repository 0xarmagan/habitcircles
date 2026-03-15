# HabitCircles

> Build habits for 21 days. Earn CRC rewards from the arb bot pool.

A Circles Mini App built on Gnosis Chain. Users pick 1–10 daily habits, check in each day (with optional screenshot verification), and earn CRC rewards distributed by the `friendly_arb_bot` at the end of each 21-day cycle. Sponsors can add branded habits in exchange for contributing gCRC to the reward pool.

---

## Project structure

```
src/
├── app.css                     # Global design tokens + shared styles
├── routes/
│   ├── +layout.svelte          # Nav + Toast wrapper, handles ?data= deep-links
│   └── +page.svelte            # Top-level view router (onboarding / dashboard / checkin)
└── lib/
    ├── data/
    │   └── habits.ts           # Habit pool, types, custom tags, emoji list
    ├── stores/
    │   ├── state.ts            # App state (Svelte stores + localStorage persistence)
    │   └── wallet.ts           # Wallet connection (stub → Cometh Connect in Week 3)
    ├── utils/
    │   ├── scoring.ts          # Weighted score calculation (testable, framework-free)
    │   └── circles.ts          # Circles Mini App SDK + calldata builders
    └── components/
        ├── Nav.svelte
        ├── Toast.svelte
        ├── Onboarding.svelte
        ├── HabitCard.svelte
        ├── CustomHabitModal.svelte
        ├── Dashboard.svelte
        ├── VerifyModal.svelte
        ├── TxModal.svelte
        ├── CongratsOverlay.svelte
        └── CheckinPage.svelte
```

---

## Local development

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Fill in API keys (Cometh + Pimlico) — see .env.example comments
# For development, leave blank — demo wallet mode activates automatically

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PUBLIC_COMETH_API_KEY` | Week 3 | Cometh Connect passkey wallet |
| `PUBLIC_PIMLICO_API_KEY` | Week 3 | Gas paymaster — users pay no xDAI |
| `PUBLIC_CHAIN` | No | `chiado` (default) or `gnosis` |
| `PUBLIC_API_URL` | Week 5 | Backend API base URL |
| `PUBLIC_BASE_URL` | Deploy | Your production domain |
| `PUBLIC_CHALLENGE_REGISTRY_ADDRESS` | Week 8 | On-chain contract |
| `PUBLIC_ESCROW_ADDRESS` | Week 8 | Sponsor escrow contract |

---

## Deployment (Vercel)

```bash
npm run build
# Output → build/
# Deploy build/ to Vercel
```

The `vercel.json` sets `X-Frame-Options: ALLOWALL` and `frame-ancestors *`
so the app loads correctly inside the Circles Mini App host iframe.

---

## Circles Mini App marketplace

To submit to the marketplace, open a PR against `aboutcircles/CirclesMiniapps`
with the entry in `static/miniapps.json` added to their `static/miniapps.json`.

PR title: `feat: add HabitCircles`

---

## Scoring model

| Completion type | Points |
|---|---|
| Verified (screenshot uploaded) | 1.0 |
| Self-reported (no proof) | 0.5 |
| Not completed | 0 |

Overall score = `sum of earned points / (challenge day × number of habits) × 100`

---

## Sponsor integration

Sponsors add a habit to the pool with a `sponsor` field:

```ts
{
  id: 'sponsor_example',
  icon: '🏃',
  name: 'Open the Metri app once today',
  tag: 'Wellness',
  color: '#00cec9',
  // ...standard habit fields...
  sponsor: {
    name: 'Metri',
    logoUrl: 'https://metri.xyz/logo.svg',
    rewardPool: 1000,       // gCRC committed for this cycle
    rewardLabel: 'up to 35 gCRC'
  }
}
```

The sponsored habit appears in the picker with a "Sponsored" label and reward hint.
Reward distribution is handled by the escrow contract (Week 8).

---

## Roadmap

| Week | Milestone |
|---|---|
| 2 | ✅ SvelteKit scaffolding (this PR) |
| 3 | Cometh Connect + WalletConnect wallet integration |
| 4 | CirclesMiniapps PR + Pimlico paymaster |
| 5–6 | Node.js backend (completions API, leaderboard) |
| 7 | Sponsor habit integration + analytics |
| 8 | Arb bot + smart contracts on Chiado testnet |
| 9 | **Cycle 1 launch** |
