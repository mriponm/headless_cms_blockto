import { create } from "zustand";

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface LiquidationData {
  longLiquidations: number;
  shortLiquidations: number;
  total: number;
  largestSingle: number;
}

export interface FundingData {
  symbol: string;
  rate: number;
}

interface MetricsState {
  fearGreed: FearGreedData | null;
  fearGreedHistory: FearGreedData[];
  liquidations: LiquidationData | null;
  funding: FundingData[];
  openInterest: number;
  gasGwei: { slow: number; standard: number; fast: number } | null;
  setFearGreed: (data: FearGreedData, history: FearGreedData[]) => void;
  setLiquidations: (data: LiquidationData) => void;
  setFunding: (data: FundingData[]) => void;
  setOpenInterest: (oi: number) => void;
  setGas: (gas: { slow: number; standard: number; fast: number }) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  fearGreed: null,
  fearGreedHistory: [],
  liquidations: null,
  funding: [],
  openInterest: 0,
  gasGwei: null,
  setFearGreed: (data, history) => set({ fearGreed: data, fearGreedHistory: history }),
  setLiquidations: (data) => set({ liquidations: data }),
  setFunding: (data) => set({ funding: data }),
  setOpenInterest: (oi) => set({ openInterest: oi }),
  setGas: (gas) => set({ gasGwei: gas }),
}));
