import { ExchangeRates } from '@/types/portfolio';

// Initial base mock rates for fallback/offline mode
const USD_BRL_MOCK = 5.25;
const EUR_BRL_MOCK = 5.65;
const BTC_USD_MOCK = 67000;
const ETH_USD_MOCK = 3500;
const SOL_USD_MOCK = 150;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

/**
 * Returns exchange rates fetched in real-time from CoinGecko and Open ER APIs,
 * with resilient fallbacks to static mock rates if network queries fail.
 */
export const getExchangeRates = async (): Promise<ExchangeRates> => {
  let cryptoData: any = null;
  let fiatData: any = null;

  // Fetch API endpoints in parallel using Promise.allSettled for maximum resilience
  const results = await Promise.allSettled([
    fetchJson<any>('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd'),
    fetchJson<any>('https://open.er-api.com/v6/latest/USD'),
  ]);

  if (results[0].status === 'fulfilled') {
    cryptoData = results[0].value;
  } else {
    console.warn('CoinGecko fetch failed, using crypto mock fallback:', results[0].reason);
  }

  if (results[1].status === 'fulfilled') {
    fiatData = results[1].value;
  } else {
    console.warn('Open Exchange Rates fetch failed, using fiat mock fallback:', results[1].reason);
  }

  const usd_brl = fiatData?.rates?.BRL ? Number(fiatData.rates.BRL) : USD_BRL_MOCK;
  
  // EUR_BRL = BRL_per_USD / EUR_per_USD
  const eur_brl = fiatData?.rates?.BRL && fiatData?.rates?.EUR
    ? Number(fiatData.rates.BRL) / Number(fiatData.rates.EUR)
    : EUR_BRL_MOCK;

  const btc_usd = cryptoData?.bitcoin?.usd ? Number(cryptoData.bitcoin.usd) : BTC_USD_MOCK;
  const eth_usd = cryptoData?.ethereum?.usd ? Number(cryptoData.ethereum.usd) : ETH_USD_MOCK;
  const sol_usd = cryptoData?.solana?.usd ? Number(cryptoData.solana.usd) : SOL_USD_MOCK;

  return {
    USD_BRL: usd_brl,
    EUR_BRL: eur_brl,
    BRL_USD: 1 / usd_brl,
    BRL_EUR: 1 / eur_brl,
    BTC_USD: btc_usd,
    ETH_USD: eth_usd,
    SOL_USD: sol_usd,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Converts an amount of any supported asset (BRL, USD, EUR, BTC, ETH, SOL) into BRL.
 */
export const convertToBRL = (amount: number, assetCode: string, rates: ExchangeRates): number => {
  if (assetCode === 'BRL') return amount;
  if (assetCode === 'USD') return amount * rates.USD_BRL;
  if (assetCode === 'EUR') return amount * rates.EUR_BRL;
  if (assetCode === 'BTC') return amount * rates.BTC_USD * rates.USD_BRL;
  if (assetCode === 'ETH') return amount * rates.ETH_USD * rates.USD_BRL;
  if (assetCode === 'SOL') return amount * rates.SOL_USD * rates.USD_BRL;
  return 0;
};

/**
 * Converts an amount of any supported asset (BRL, USD, EUR, BTC, ETH, SOL) into USD.
 */
export const convertToUSD = (amount: number, assetCode: string, rates: ExchangeRates): number => {
  if (assetCode === 'USD') return amount;
  if (assetCode === 'BRL') return amount * rates.BRL_USD;
  if (assetCode === 'EUR') return amount * rates.EUR_BRL * rates.BRL_USD; // EUR -> BRL -> USD
  if (assetCode === 'BTC') return amount * rates.BTC_USD;
  if (assetCode === 'ETH') return amount * rates.ETH_USD;
  if (assetCode === 'SOL') return amount * rates.SOL_USD;
  return 0;
};

/**
 * Converts an amount of any supported asset (BRL, USD, EUR, BTC, ETH, SOL) into EUR.
 */
export const convertToEUR = (amount: number, assetCode: string, rates: ExchangeRates): number => {
  if (assetCode === 'EUR') return amount;
  if (assetCode === 'BRL') return amount * rates.BRL_EUR;
  if (assetCode === 'USD') return amount * rates.USD_BRL * rates.BRL_EUR; // USD -> BRL -> EUR
  if (assetCode === 'BTC') return amount * rates.BTC_USD * rates.USD_BRL * rates.BRL_EUR;
  if (assetCode === 'ETH') return amount * rates.ETH_USD * rates.USD_BRL * rates.BRL_EUR;
  if (assetCode === 'SOL') return amount * rates.SOL_USD * rates.USD_BRL * rates.BRL_EUR;
  return 0;
};

/**
 * Helper to convert from any asset to any display currency (BRL, USD, EUR).
 */
export const convertToDisplayCurrency = (
  amount: number,
  assetCode: string,
  displayCurrency: 'BRL' | 'USD' | 'EUR',
  rates: ExchangeRates
): number => {
  switch (displayCurrency) {
    case 'BRL':
      return convertToBRL(amount, assetCode, rates);
    case 'USD':
      return convertToUSD(amount, assetCode, rates);
    case 'EUR':
      return convertToEUR(amount, assetCode, rates);
    default:
      return 0;
  }
};
