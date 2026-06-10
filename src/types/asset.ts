/**
 * Quanto Gastei? - Asset Types
 * Fiat and crypto asset definitions.
 */

export type AssetType = 'fiat' | 'crypto';

export interface Asset {
  id: string;
  code: string;
  name: string;
  symbol: string;
  asset_type: AssetType;
  decimals: number;
  is_active: boolean;
  created_at: string;
}

export type AssetCode = 'BRL' | 'USD' | 'EUR' | 'BTC' | 'ETH' | 'SOL';

export interface AssetWithBalance extends Asset {
  balance: number;
  value_brl: number;
}
