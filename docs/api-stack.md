# Blockto — Real-Time Crypto API Stack

## API Sources

| Feature | API | Type | Cost | Env Var |
|---|---|---|---|---|
| Live prices (all coins) | Binance WS combined stream | WebSocket | Free | — |
| Candlestick OHLC + live chart | Binance WS klines + REST | WebSocket | Free | — |
| Top 24hr trading pairs | Binance `/api/v3/ticker/24hr` | REST | Free | — |
| Liquidations / funding / OI | Binance Futures REST | REST | Free | — |
| Fear & Greed index | CoinMarketCap Pro | REST | Paid | `CMC_PRO_API_KEY` |
| Global market cap / dominance | CoinMarketCap Pro | REST | Paid | `CMC_PRO_API_KEY` |
| Top gainers / losers | CoinMarketCap Pro | REST | Paid | `CMC_PRO_API_KEY` |
| Stablecoin supply | CoinMarketCap Pro | REST | Paid | `CMC_PRO_API_KEY` |
| Crypto converter | CoinMarketCap Pro | REST | Paid | `CMC_PRO_API_KEY` |
| Prices table (100 coins) | CoinGecko Pro | REST | Paid | `COINGECKO_PRO_API_KEY` |
| Rainbow chart (4yr history) | CoinGecko Pro | REST | Paid | `COINGECKO_PRO_API_KEY` |
| BTC annual returns | CoinGecko Pro | REST | Paid | `COINGECKO_PRO_API_KEY` |
| Altcoin season index (calc) | CoinGecko Pro | REST | Paid | `COINGECKO_PRO_API_KEY` |
| ETH gas tracker | Etherscan free | REST | Free | `ETHERSCAN_API_KEY` |
| BTC network stats + halving | Mempool.space | REST | Free | — |
| DeFi TVL | DefiLlama | REST | Free | — |

## API Routes (Next.js proxies)

```
/api/fear-greed     → CMC Pro fear-and-greed         revalidate: 3600s
/api/global         → CMC Pro global-metrics          revalidate: 60s
/api/gainers        → CMC Pro trending gainers-losers revalidate: 60s
/api/stablecoins    → CMC Pro stablecoin listings     revalidate: 300s
/api/converter      → CMC Pro price-conversion        no cache
/api/markets        → CoinGecko Pro coins/markets     revalidate: 60s
/api/rainbow        → CoinGecko Pro BTC 4yr history   revalidate: 86400s
/api/returns        → CoinGecko Pro BTC annual data   revalidate: 86400s
/api/pairs          → Binance 24hr ticker top USDT    revalidate: 30s
/api/gas            → Etherscan gastracker oracle     revalidate: 30s
/api/mempool        → Mempool.space hashrate+height   revalidate: 60s
/api/defillama      → DefiLlama TVL + stablecoins     revalidate: 3600s
/api/futures        → Binance Futures liq+OI+funding  revalidate: 30s
```

## Global Price Store

Single Binance combined WebSocket → Zustand store → all components.

```
wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/...
```

Read price anywhere: `usePriceStore(s => s.prices['BTCUSDT'])`
Read flash: `usePriceStore(s => s.flash['BTCUSDT'])` → "up" | "down" | undefined

## Update Frequencies

| Data | Rate |
|---|---|
| All coin prices | ~100ms (Binance WS) |
| Candlestick | Per candle close |
| Fear & Greed | 3600s (daily update) |
| Gainers / losers | 60s |
| Global dominance | 60s |
| ETH gas | 30s |
| Liquidations | 30s |
| Trading pairs | 30s |
| BTC network | 60s |
| Stablecoins | 300s |
| Altcoin season | 300s (calculated) |
| DeFi TVL | 3600s |
| Rainbow chart | 86400s (daily) |
