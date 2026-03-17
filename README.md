# Polymarket Trading Bot

A **polymarket trading bot** and polymarket copy trading bot: mirrors trades from a target wallet to yours in real time. Configurable size, order type, and auto-redemption.

> *Search: polymarket trading bot · polymarket copy bot · polymarket copytrading bot*

**Requirements:** Node.js 18+ · Polygon wallet with USDC

## Quick Start

```bash
npm install
```

Create `.env` with:

| Variable | Description |
|---------|-------------|
| `PRIVATE_KEY` | Wallet private key |
| `TARGET_WALLET` | Address to copy trades from |
| `RPC_TOKEN` | Polygon RPC URL (e.g. Alchemy/Infura) |

Optional: `SIZE_MULTIPLIER` (default `1.0`), `MAX_ORDER_AMOUNT`, `REDEEM_DURATION` (minutes for auto-redeem).

```bash
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run copy-trading bot |
| `npm run redeem` | Redeem by condition ID |
| `bun src/auto-redeem.ts` | Batch redeem resolved markets |

## How it works

1. Connects to Polymarket real-time feed
2. Filters trades by `TARGET_WALLET`
3. Copies each trade with your multiplier/limits
4. Optionally auto-redeems resolved markets

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SIZE_MULTIPLIER` | 1.0 | Scale copied size |
| `MAX_ORDER_AMOUNT` | — | Cap per order |
| `ORDER_TYPE` | FAK | FAK or FOK |
| `TICK_SIZE` | 0.01 | 0.1, 0.01, 0.001, 0.0001 |
| `NEG_RISK` | false | Neg-risk markets |
| `REDEEM_DURATION` | — | Auto-redeem interval (minutes) |

## Security

- Never commit `.env` or `PRIVATE_KEY`
- Use a dedicated wallet with limited funds
- Copy trading carries risk

## Contact

Telegram [@hodlwarden](https://t.me/hodlwarden) · Email [hodlwarden@gmail.com](mailto:hodlwarden@gmail.com)

---

*GitHub repo setup for discoverability: see [.github/REPO_SETUP.md](.github/REPO_SETUP.md)*
