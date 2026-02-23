/**
 * Arbitrage detection for Polymarket (YES + NO < $1).
 * Used when REQUIRE_ARB_SIGNAL=true to only copy trades when an arb opportunity exists.
 */
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import type { ClobClient } from "@polymarket/clob-client";
import { logger } from "./utils/logger";

dotenvConfig({ path: resolve(process.cwd(), ".env") });

const CLOB_API_URL = process.env.CLOB_API_URL || "https://clob.polymarket.com";
const MIN_ARB_PROFIT_PCT = parseFloat(process.env.MIN_ARB_PROFIT_PCT || "0.01");
const FEE_BUFFER = 1.01; // assume ~1% fees
const ARB_THRESHOLD = 0.99; // fee-adjusted cost must be below this

interface BookSummary {
  market: string;
  asset_id: string;
  asks: Array<{ price: string; size: string }>;
  bids: Array<{ price: string; size: string }>;
}

interface MarketToken {
  token_id: string;
  outcome: string;
}

/**
 * Get both outcome token IDs (YES and NO) for a condition from CLOB market.
 */
async function getMarketTokenIds(
  clobClient: ClobClient,
  conditionId: string
): Promise<{ yesTokenId: string; noTokenId: string } | null> {
  try {
    const market = await clobClient.getMarket(conditionId);
    if (!market || !market.tokens || !Array.isArray(market.tokens)) {
      return null;
    }
    let yesTokenId: string | null = null;
    let noTokenId: string | null = null;
    for (const t of market.tokens as MarketToken[]) {
      const out = (t.outcome || "").toLowerCase();
      if (out === "yes") yesTokenId = t.token_id;
      else if (out === "no") noTokenId = t.token_id;
    }
    if (yesTokenId && noTokenId) {
      return { yesTokenId, noTokenId };
    }
    return null;
  } catch (e) {
    logger.warning(`Arb: getMarket failed for ${conditionId}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

/**
 * Fetch order books for the given token IDs (POST /books).
 */
async function fetchOrderBooks(tokenIds: string[]): Promise<BookSummary[]> {
  const body = tokenIds.map((token_id) => ({ token_id }));
  const res = await fetch(`${CLOB_API_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Best ask price from a book (lowest ask), or null if no asks.
 */
function bestAsk(book: BookSummary): number | null {
  const asks = book.asks || [];
  if (asks.length === 0) return null;
  const sorted = [...asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  return parseFloat(sorted[0].price);
}

/**
 * Check if there is an internal arbitrage opportunity (YES + NO < $1 after fees).
 * Returns true only when arb exists and profit % >= MIN_ARB_PROFIT_PCT.
 */
export async function hasArbOpportunity(
  conditionId: string,
  clobClient: ClobClient
): Promise<boolean> {
  try {
    const tokens = await getMarketTokenIds(clobClient, conditionId);
    if (!tokens) return false;

    const books = await fetchOrderBooks([tokens.yesTokenId, tokens.noTokenId]);
    if (books.length < 2) return false;

    const yesBook = books.find((b) => b.asset_id === tokens.yesTokenId) ?? books[0];
    const noBook = books.find((b) => b.asset_id === tokens.noTokenId) ?? books[1];

    const yesPrice = bestAsk(yesBook);
    const noPrice = bestAsk(noBook);
    if (yesPrice == null || noPrice == null) return false;

    const totalCost = yesPrice + noPrice;
    const feeAdjustedCost = totalCost * FEE_BUFFER;
    if (feeAdjustedCost >= ARB_THRESHOLD) return false;

    const profitPct = (1.0 - feeAdjustedCost) / feeAdjustedCost;
    if (profitPct < MIN_ARB_PROFIT_PCT) return false;

    logger.info(
      `Arb: opportunity on ${conditionId.slice(0, 18)}... YES@${yesPrice.toFixed(3)} + NO@${noPrice.toFixed(3)} = ${totalCost.toFixed(3)} → ${(profitPct * 100).toFixed(2)}%`
    );
    return true;
  } catch (e) {
    logger.warning(`Arb: check failed for ${conditionId}: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}
