/** Maps CoinGecko coin ID → Binance trading pair symbol */
export const BINANCE_SYMBOLS: Record<string, string> = {
  bitcoin:             "BTCUSDT",
  ethereum:            "ETHUSDT",
  solana:              "SOLUSDT",
  binancecoin:         "BNBUSDT",
  ripple:              "XRPUSDT",
  dogecoin:            "DOGEUSDT",
  cardano:             "ADAUSDT",
  "avalanche-2":       "AVAXUSDT",
  chainlink:           "LINKUSDT",
  polkadot:            "DOTUSDT",
  litecoin:            "LTCUSDT",
  uniswap:             "UNIUSDT",
  "matic-network":     "MATICUSDT",
  cosmos:              "ATOMUSDT",
  "ethereum-classic":  "ETCUSDT",
  stellar:             "XLMUSDT",
  monero:              "XMRUSDT",
  "hedera-hashgraph":  "HBARUSDT",
  optimism:            "OPUSDT",
  filecoin:            "FILUSDT",
  arbitrum:            "ARBUSDT",
  aptos:               "APTUSDT",
  vechain:             "VETUSDT",
  near:                "NEARUSDT",
  "shiba-inu":         "SHIBUSDT",
  "injective-protocol":"INJUSDT",
  "render-token":      "RENDERUSDT",
  sui:                 "SUIUSDT",
  kaspa:               "KASUSDT",
  pepe:                "PEPEUSDT",
  tron:                "TRXUSDT",
};

/** Maps CoinDetailView timeframe label → Binance kline params */
export const TF_TO_INTERVAL: Record<string, { interval: string; limit: number; months?: number }> = {
  "4H":  { interval: "5m",  limit: 48   },          // 4 h at 5 min
  "1D":  { interval: "15m", limit: 96   },          // 1 day at 15 min
  "6M":  { interval: "1h",  limit: 4320, months: 6 }, // 6 months at 1 h (paginated)
  "1M":  { interval: "4h",  limit: 180  },          // 1 month at 4 h
  "3M":  { interval: "1d",  limit: 90   },          // 3 months at 1 d
  "1Y":  { interval: "1d",  limit: 365  },          // 1 year at 1 d
  "ALL": { interval: "1w",  limit: 1000 },          // all available weekly bars (~8 yrs BTC)
};
