# Repository setup for discoverability

This file helps maintainers configure GitHub settings to improve search ranking on GitHub and Google for queries like *polymarket trading bot*.

## What to set

### 1. Repo description

On the repo's main page, click the gear icon next to **About**, then paste:

```
Polymarket trading bot — arbitrage and copy trading: copy when YES+NO arb exists, real-time mirror trading with auto-redemption.
```

### 2. Topics

In the same **About** section, add these topics (GitHub allows up to ~20):

- `polymarket`
- `trading-bot`
- `prediction-markets`
- `copy-trading`
- `arbitrage`
- `polymarket-bot`
- `mirror-trading`
- `polygon`
- `ethereum`
- `clob`

### 3. Website (optional)

If you have a docs or landing page, add its URL in the **Website** field of About.

## Why this matters

- **GitHub search** uses description and topics for relevance.
- **Google** indexes the description and topics alongside the README.
- **npm** uses `package.json` `repository` and `description` (already configured).

## Status

- [x] `package.json` — name, keywords, description, repository, homepage, bugs
- [x] README — title, search terms, first paragraph
- [ ] GitHub About — description (set manually)
- [ ] GitHub About — topics (set manually)
