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

/** Maps CoinDetailView timeframe label → Binance kline interval */
export const TF_TO_INTERVAL: Record<string, { interval: string; limit: number }> = {
  "4H":  { interval: "5m",  limit: 96  },   // 8 h at 5 min
  "1D":  { interval: "15m", limit: 288 },   // 3 days at 15 min
  "1W":  { interval: "1h",  limit: 504 },   // 3 weeks at 1 h
  "1M":  { interval: "4h",  limit: 360 },   // 60 days at 4 h
  "3M":  { interval: "1d",  limit: 365 },   // 1 year at 1 d
  "1Y":  { interval: "1w",  limit: 260 },   // 5 years at 1 w
  "ALL": { interval: "1w",  limit: 1000 },  // max Binance limit
};
