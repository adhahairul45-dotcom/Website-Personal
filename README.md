# RulzStore

A full-stack, Codashop-style multi-game top-up marketplace. Browse games, pick a
denomination, enter your in-game ID, choose a payment method, and check out —
with a **mock** payment flow (no real money moves, and no payment gateway keys
are required).

## Stack

- **Backend:** Node.js + Express
- **Data layer:** JSON files under `/data` (`games.json` catalog, `orders.json`
  order log) via `src/db.js` — swap this module for Postgres/MySQL/MongoDB
  later without touching the routes
- **Frontend:** Plain HTML/CSS/JS, no build step, no framework

## Project structure

```
rulzstore/
├── server.js              # Express app entry point
├── package.json
├── data/
│   ├── games.json         # Catalog: 8 games + their top-up denominations
│   └── orders.json        # Orders "database" (auto-created/updated at runtime)
├── src/
│   ├── db.js               # Read/write helpers for games & orders
│   └── routes/
│       ├── games.js        # GET /api/games, GET /api/games/:id
│       └── orders.js       # POST /api/orders, GET /api/orders/:id
└── public/
    ├── index.html           # Homepage: search + game grid
    ├── game.html             # Game detail: pick amount, enter ID, pick payment
    ├── checkout.html          # Order review + "Confirm & pay"
    ├── success.html            # Order status (polls for mock "success")
    ├── track.html              # Look up any past order by ID
    ├── css/style.css
    └── js/ (app.js, game.js, checkout.js, success.js)
```

## Running it

```bash
cd rulzstore
npm install
npm start
```

Then open **http://localhost:3000**.

## How the mock checkout works

1. `game.html` collects the chosen product, in-game ID fields, and payment
   method, and stashes it in `sessionStorage`.
2. `checkout.html` reads that draft, shows a receipt-style review, and on
   "Confirm & pay" calls `POST /api/orders`.
3. The server saves the order with `status: "processing"`, then after 3
   seconds (simulating a payment gateway webhook) flips it to
   `status: "success"`.
4. `success.html` polls `GET /api/orders/:id` every ~1.2s until it sees
   `"success"`, then shows the delivered receipt.

## Adding a real payment gateway later

Replace the `setTimeout` mock in `src/routes/orders.js` with a real call to
your payment provider (Stripe, Xendit, Billplz, PayPal, etc.), and add a
webhook route that calls `db.markOrderSuccess(orderId)` when the provider
confirms payment — the rest of the app (polling, receipts, tracking) already
expects that shape and needs no changes.

## Adding more games

Add an entry to `data/games.json` following the existing shape (`id`, `name`,
`publisher`, `category`, `accent` color, `currencyLabel`, `idFields`,
`helpText`, `products`). No code changes needed — the homepage and game page
both read from this file.

## Notes

- This is a **demo/portfolio-style build**: the "payment methods" are generic
  labels (E-Wallet, Online Banking, Card, Store Cash-in), not real branded
  integrations, and no actual charges occur anywhere in the code.
- Orders persist in `data/orders.json` between server restarts (it's a plain
  file), but this is not meant for production — swap in a real database
  before handling real traffic or real payments.
