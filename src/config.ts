import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getContractConfig } from '@polymarket/clob-client-v2';
import { logger } from './logger.js';

function parseCsv(value?: string): string[] {
  if (!value) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function buildConfigFromProcessEnv() {
  const useWebSocket = process.env.USE_WEBSOCKET !== 'false';
  const contractConfig = getContractConfig(137);

  return {
    targetWallet: process.env.TARGET_WALLET || '',
    privateKey: process.env.PRIVATE_KEY || '',
    polymarketGeoToken: process.env.POLYMARKET_GEO_TOKEN || '',
    rpcUrl: process.env.RPC_URL || 'https://polygon-rpc.com',
    chainId: 137 as const,

    contracts: {
      exchange: contractConfig.exchangeV2,
      ctf: contractConfig.conditionalTokens,
      collateral: contractConfig.collateral,
      negRiskAdapter: contractConfig.negRiskAdapter,
      negRiskExchange: contractConfig.negRiskExchangeV2,
    },

    trading: {
      positionSizeMultiplier: parseFloat(process.env.POSITION_MULTIPLIER || '0.1'),
      maxTradeSize: parseFloat(process.env.MAX_TRADE_SIZE || '100'),
      minTradeSize: parseFloat(process.env.MIN_TRADE_SIZE || '1'),
      slippageTolerance: parseFloat(process.env.SLIPPAGE_TOLERANCE || '0.02'),
      orderType: (process.env.ORDER_TYPE || 'FOK') as 'LIMIT' | 'FOK' | 'FAK',
      copySells: process.env.COPY_SELLS !== 'false',
    },

    risk: {
      maxSessionNotional: parseFloat(process.env.MAX_SESSION_NOTIONAL || '0'),
      maxPerMarketNotional: parseFloat(process.env.MAX_PER_MARKET_NOTIONAL || '0'),
    },

    run: {
      exitAfterFirstSellCopy: process.env.EXIT_AFTER_FIRST_SELL_COPY === 'true',
    },

    monitoring: {
      pollInterval: parseInt(process.env.POLL_INTERVAL || '2000'),
      useWebSocket,
      useUserChannel: process.env.USE_USER_CHANNEL === 'true',
      wsAssetIds: parseCsv(process.env.WS_ASSET_IDS),
      wsMarketIds: parseCsv(process.env.WS_MARKET_IDS),
    },
    builderCode: process.env.POLY_BUILDER_CODE || '',
  };
}

const envFilePath = () => path.join(process.cwd(), '.env');

/** Reload `.env` from disk and refresh `config` (same object reference). Call after creating or editing `.env`. */
export function refreshConfigFromEnv(): void {
  dotenv.config({ path: envFilePath(), override: true });
  Object.assign(config, buildConfigFromProcessEnv());
}

dotenv.config({ path: envFilePath() });
export const config = buildConfigFromProcessEnv();

export function envFileExists(): boolean {
  return fs.existsSync(envFilePath());
}

/** True when a `.env` file exists and `PRIVATE_KEY` is non-empty (after `refreshConfigFromEnv()`). */
export function isEnvCredentialsReady(): boolean {
  return envFileExists() && Boolean(config.privateKey?.trim());
}

/** Log what is missing; does not exit. */
export function logMissingEnvCredentials(): void {
  const p = envFilePath();
  if (!fs.existsSync(p)) {
    logger.error(
      `⚠️  No .env file at ${p}. Copy .env.example to .env and set PRIVATE_KEY and other required variables.`
    );
  }
  if (!config.privateKey?.trim()) {
    logger.error(
      '⚠️  PRIVATE_KEY is missing or empty. Set it in .env (or ensure it is exported before launch).'
    );
  }
}

export function validateConfig(): void {
  const required = ['targetWallet', 'privateKey'];
  for (const key of required) {
    if (!config[key as keyof typeof config]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }

  logger.info('ℹ️  API credentials will be derived/generated from PRIVATE_KEY at startup');

  logger.info('✅ Configuration validated');
  logger.info(`   Auth: EOA (signature type 0)`);
}
