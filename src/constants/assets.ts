/**
 * Quanto Gastei? - Default Assets
 * Pre-configured fiat and crypto assets.
 */

import { Asset, AssetCode, AssetType } from '../types/asset';

interface DefaultAsset {
  code: AssetCode;
  name: string;
  symbol: string;
  asset_type: AssetType;
  decimals: number;
}

export const DEFAULT_ASSETS: readonly DefaultAsset[] = [
  {
    code: 'BRL',
    name: 'Real Brasileiro',
    symbol: 'R$',
    asset_type: 'fiat',
    decimals: 2,
  },
  {
    code: 'USD',
    name: 'Dólar Americano',
    symbol: '$',
    asset_type: 'fiat',
    decimals: 2,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    asset_type: 'fiat',
    decimals: 2,
  },
  {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    asset_type: 'crypto',
    decimals: 8,
  },
  {
    code: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    asset_type: 'crypto',
    decimals: 8,
  },
  {
    code: 'SOL',
    name: 'Solana',
    symbol: '◎',
    asset_type: 'crypto',
    decimals: 8,
  },
] as const;

/**
 * Lookup map for quick access by asset code.
 */
export const ASSET_MAP = new Map<string, DefaultAsset>(
  DEFAULT_ASSETS.map((asset) => [asset.code, asset]),
);

/**
 * Returns the symbol for a given asset code.
 */
export const getAssetSymbolByCode = (code: string): string => {
  return ASSET_MAP.get(code)?.symbol ?? code;
};
