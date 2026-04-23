import type { Metadata } from "next";
import InfoPage from "@/components/ui/InfoPage";
export const metadata: Metadata = { title: "Crypto Glossary — Blockto" };
export default function Page() {
  return <InfoPage
    badge="Resources"
    title="Crypto Glossary"
    subtitle="Plain-English definitions for the most important terms in crypto and blockchain."
    sections={[
      { heading: "A–C", body: ["Altcoin — Any cryptocurrency other than Bitcoin.", "AMM (Automated Market Maker) — A decentralised exchange protocol that prices assets using a mathematical formula rather than an order book.", "Bear market — A period of sustained price decline, typically >20% from recent highs.", "Bull market — A period of sustained price increase.", "CEX (Centralised Exchange) — A crypto exchange operated by a company (e.g. Binance, Coinbase).", "Cold wallet — A crypto wallet not connected to the internet, used for secure long-term storage."] },
      { heading: "D–L", body: ["DeFi (Decentralised Finance) — Financial services built on public blockchains without intermediaries.", "DEX (Decentralised Exchange) — A peer-to-peer exchange operating via smart contracts.", "DYOR — Do Your Own Research. A reminder that investment decisions are your own responsibility.", "Gas fees — Transaction costs on Ethereum and compatible networks.", "Halving — A programmatic reduction of Bitcoin's block reward, occurring every ~4 years.", "Layer 2 — A scaling solution built on top of a base blockchain to increase speed and reduce costs.", "Liquidity — The ease with which an asset can be bought or sold without affecting its price."] },
      { heading: "M–Z", body: ["Market cap — Total market value of a cryptocurrency (price × circulating supply).", "NFT (Non-Fungible Token) — A unique digital asset verified on a blockchain.", "On-chain — Data or activity recorded directly on a blockchain.", "Proof of Stake (PoS) — A consensus mechanism where validators lock up tokens to secure the network.", "Proof of Work (PoW) — A consensus mechanism requiring computational effort to validate transactions.", "Stablecoin — A cryptocurrency designed to maintain a stable value, usually pegged to USD.", "TVL (Total Value Locked) — The total capital deposited in a DeFi protocol.", "Whale — An entity holding a large amount of cryptocurrency, capable of influencing prices."] },
    ]}
  />;
}
