# Polymarket Trading Bot

**Polymarket arbitrage bot** — a **polymarket copy trading bot** that watches a target wallet’s trades in real time and mirrors them on your account. Optional **arbitrage filter**: copy only when a YES+NO &lt; $1 opportunity exists. Configurable size, order type, and auto-redemption of resolved markets.

> **Search:** polymarket trading bot · polymarket arbitrage bot · Polymarket copy bot · polymarket copy trading bot · Polymarket arbitrage · prediction market bot · mirror trading Polymarket

## About this project

This repo is a **Polymarket trading bot** — arbitrage and copy trading (searchable as *polymarket trading bot*, *polymarket arbitrage bot*, *Polymarket copy bot*): it connects to Polymarket's real-time feed, follows a chosen wallet's activity, and can copy only when an internal arbitrage opportunity exists (YES + NO &lt; $1), or copy every trade. Use it for arbitrage-style or mirror/copy trading on Polymarket prediction markets with optional auto-redemption.

## GitHub repo setup (discoverability)

To improve search ranking on GitHub and Google, set these in your repo’s **About** section (click the gear icon next to “About”):

| Field | Value |
|-------|-------|
| **Description** | Polymarket trading bot — arbitrage and copy trading: copy when YES+NO arb exists, real-time mirror trading with auto-redemption. |
| **Topics** | `polymarket`, `trading-bot`, `prediction-markets`, `copy-trading`, `arbitrage`, `polymarket-bot`, `mirror-trading`, `polygon`, `ethereum`, `clob` |

See [.github/REPO_SETUP.md](.github/REPO_SETUP.md) for step-by-step instructions.

---

## Contact

Questions or collaboration:

| Contact | Handle |
|---------|--------|
| **Telegram** | [@hodlwarden](https://t.me/hodlwarden) |
| **Email**   | [hodlwarden@gmail.com](mailto:hodlwarden@gmail.com) |

## Features

- **Real-time copy trading** – Subscribes to Polymarket’s activity feed and copies trades from a chosen wallet as they happen.
- **Optional arbitrage filter** – When `REQUIRE_ARB_SIGNAL=true`, copies only when an internal arbitrage opportunity exists (YES + NO &lt; $1) in that market.
- **Configurable execution** – Size multiplier, max order size, order type (FAK/FOK), tick size, and neg-risk support.
- **USDC & CLOB setup** – Approves USDC allowances and syncs with the CLOB API on startup.
- **Automatic redemption** – Optional periodic redemption of resolved markets (with copy trading paused during redemption).
- **Standalone redeem tools** – Redeem by condition ID or run batch redemption from holdings/API.

## Requirements

- **Node.js** 18+ (or **Bun** for redeem/auto-redeem scripts)
- **Polygon** wallet with USDC for trading and gas

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root. Required and optional variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Your wallet private key (for signing orders and redeeming). |
| `TARGET_WALLET` | Yes* | Ethereum address of the wallet whose trades to copy. |
| `RPC_TOKEN` | Yes** | Polygon RPC URL or API token (e.g. Alchemy/Infura) for chain and contract calls. |
| `CHAIN_ID` | No | Chain ID (default: Polygon). |
| `CLOB_API_URL` | No | CLOB API base URL (default: `https://clob.polymarket.com`). |
| `USER_REAL_TIME_DATA_URL` | No | Real-time data WebSocket host (uses Polymarket default if unset). |
| `SIZE_MULTIPLIER` | No | Multiply copied size by this (default: `1.0`). |
| `MAX_ORDER_AMOUNT` | No | Cap per order size (no cap if unset). |
| `ORDER_TYPE` | No | `FAK` or `FOK` (default: `FAK`). |
| `TICK_SIZE` | No | `0.1`, `0.01`, `0.001`, or `0.0001` (default: `0.01`). |
| `NEG_RISK` | No | `true` or `false` for neg-risk markets. |
| `ENABLE_COPY_TRADING` | No | `true` or `false` (default: `true`). |
| `REQUIRE_ARB_SIGNAL` | No | When `true`, only copy a trade if there is an internal arbitrage opportunity (YES + NO &lt; $1) in that market. Default: `false`. |
| `MIN_ARB_PROFIT_PCT` | No | Minimum arbitrage profit % to consider (e.g. `0.01` = 1%). Used when `REQUIRE_ARB_SIGNAL=true`. Default: `0.01`. |
| `REDEEM_DURATION` | No | Auto-redeem interval in **minutes** (e.g. `60` = every hour). If set, copy trading is paused during redemption. |
| `DEBUG` | No | `true` for extra logging. |

\* Required when copy trading is enabled.  
\** Required for allowance checks and redemption.

**Example `.env`:**

```env
PRIVATE_KEY=0x...
TARGET_WALLET=0x...
RPC_TOKEN=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Optional
SIZE_MULTIPLIER=1.0
MAX_ORDER_AMOUNT=100
ORDER_TYPE=FAK
TICK_SIZE=0.01
NEG_RISK=false
REDEEM_DURATION=60
```

### 3. Run the bot

```bash
npm start
```

This will:

1. Create credentials if needed.
2. Initialize the CLOB client and approve USDC allowances (when copy trading is enabled).
3. Connect to the real-time feed and subscribe to `activity:trades`.
4. Copy trades from `TARGET_WALLET` using your configured multiplier and limits.
5. If `REDEEM_DURATION` is set, run redemption on that interval and pause copy trading during redemption.

## Scripts

| Command | Description |
|--------|-------------|
| `npm start` | Start the copy-trading bot (`ts-node src/index.ts`). |
| `npm run redeem` | Standalone redemption by condition ID (`ts-node src/redeem.ts`). |

### Redeem script

Redeem a single market by condition ID:

```bash
npm run redeem -- <conditionId> [indexSet1 indexSet2 ...]
# Example:
npm run redeem -- 0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1 1 2
```

Or set in `.env`:

```env
CONDITION_ID=0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1
INDEX_SETS=1,2
```

Then:

```bash
npm run redeem
```

If no condition ID is given, the script prints current holdings and usage.

### Auto-redeem script (Bun)

For batch redemption and market checks, use the auto-redeem script (Bun):

```bash
bun src/auto-redeem.ts                    # Redeem all resolved markets from holdings
bun src/auto-redeem.ts --api              # Fetch markets from API and redeem winning positions
bun src/auto-redeem.ts --dry-run          # Preview only, no redemption
bun src/auto-redeem.ts --check <conditionId>  # Check if a market is resolved
```

## Project structure

```
src/
├── index.ts              # Main copy-trading bot entry
├── arbitrage.ts          # Arbitrage detection (YES+NO < $1) when REQUIRE_ARB_SIGNAL=true
├── redeem.ts             # CLI: redeem by condition ID
├── auto-redeem.ts        # Batch redemption and --check (Bun)
├── order-builder/        # Order construction and copy-trade execution
├── providers/            # CLOB client and real-time WebSocket provider
├── security/             # Credentials, USDC allowance, CLOB balance allowance
└── utils/                # Types, logger, balance, holdings, redeem helpers
```

## How it works

1. **Connection** – The bot connects to Polymarket’s real-time data service and subscribes to trade activity.
2. **Filtering** – Each trade is checked for `proxyWallet === TARGET_WALLET`.
3. **Arbitrage check (optional)** – If `REQUIRE_ARB_SIGNAL=true`, the bot checks whether that market has an internal arbitrage opportunity before copying (see [Arbitrage filter](#arbitrage-filter-arbitrage-copy-bot-style) below).
4. **Copy** – Matching trades are sent to the order builder, which places orders on the CLOB with your `SIZE_MULTIPLIER`, `MAX_ORDER_AMOUNT`, `ORDER_TYPE`, `TICK_SIZE`, and `NEG_RISK` settings.
5. **Redemption** – If `REDEEM_DURATION` is set, on a timer the bot pauses copy trading, runs redemption (e.g. from `token-holding.json`), then resumes.

---

## Arbitrage filter (arbitrage-copy-bot style)

When **`REQUIRE_ARB_SIGNAL=true`**, the bot only copies a trade if the market currently has an **internal arbitrage opportunity**: the cost to buy one share of YES and one share of NO is less than $1 (after a small fee buffer). That way you copy the target wallet only when there is a structural edge in the book, similar to a dedicated arbitrage-copy bot.

### What is internal arbitrage?

On Polymarket, every binary market has YES and NO tokens. In theory **YES + NO = $1** (one of them pays $1 at resolution). If the **best ask** for YES plus the **best ask** for NO is **below $1**, you can buy both and lock in profit when the market resolves:

- **Example:** YES best ask = $0.48, NO best ask = $0.49 → total = $0.97. You pay $0.97, get $1 at resolution → ~3% profit (minus fees).

The bot checks this using the CLOB order book (YES and NO token books) and a ~1% fee buffer. It only treats it as “arb exists” if the implied profit is at least **`MIN_ARB_PROFIT_PCT`** (default 1%).

### Flow when `REQUIRE_ARB_SIGNAL=true`

```
Target wallet trade detected
        │
        ▼
  Get market (conditionId) → YES/NO token IDs
        │
        ▼
  Fetch order books (POST /books) for both tokens
        │
        ▼
  Best ask YES + Best ask NO (with fee buffer) < $0.99?
        │
        ├─ NO  → Skip copy, log: "Skipping copy – no arbitrage signal..."
        │
        └─ YES → Profit % ≥ MIN_ARB_PROFIT_PCT?
                    │
                    ├─ NO  → Skip copy
                    └─ YES → Copy trade (same as normal copy flow)
```

### When to use it

| Mode | `REQUIRE_ARB_SIGNAL` | Behavior |
|------|----------------------|----------|
| **Copy everything** | `false` (default) | Copy every trade from `TARGET_WALLET`. |
| **Copy only when arb** | `true` | Copy only when that market has YES+NO &lt; $1 and profit ≥ `MIN_ARB_PROFIT_PCT`. |

Use **`true`** when the wallet you follow is arbitrage-focused and you want to mirror only when the book actually has an arb opportunity. Use **`false`** for plain copy trading with no arb filter.

### Env vars for arbitrage filter

| Variable | Description |
|----------|-------------|
| `REQUIRE_ARB_SIGNAL` | `true` = only copy if arb exists in that market; `false` = copy all (default). |
| `MIN_ARB_PROFIT_PCT` | Min profit fraction to count as arb (e.g. `0.01` = 1%). Default: `0.01`. |

**Example (arbitrage-style copy):**

```env
TARGET_WALLET=0x...
REQUIRE_ARB_SIGNAL=true
MIN_ARB_PROFIT_PCT=0.01
SIZE_MULTIPLIER=0.5
MAX_ORDER_AMOUNT=100
```

### Note on execution

This bot does **not** place the full “buy YES + buy NO” arb leg itself. It only **filters**: copy the target’s trade **when** an arb exists. The copied order is still the same side/outcome/size as the target (e.g. buy YES). A full two-legged arb execution can be added on top if desired.

---

## Security notes

- **Never commit `.env` or your `PRIVATE_KEY`.** Use environment variables or a secrets manager in production.
- Run with a dedicated wallet and only fund it with what you’re willing to trade.
- Copy trading carries risk; the bot mirrors another wallet’s actions without guarantees.
