import { create } from "zustand";

interface PriceState {
  prices:       Record<string, number>;
  changes:      Record<string, number>;        // fed by markets API (60s), not WS
  flash:        Record<string, "up" | "down">;
  flashVersion: Record<string, number>;
  // WS only sets price + flash direction
  setPrice:   (symbol: string, price: number, prevPrice: number) => void;
  // Markets API sets stable 24h % changes
  setChanges: (data: Record<string, number>) => void;
  getPrice:   (symbol: string) => number;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  prices:       {},
  changes:      {},
  flash:        {},
  flashVersion: {},

  setPrice: (symbol, price, prevPrice) => {
    // Only flash when price actually moves — strict comparison
    if (price === prevPrice) {
      // Price unchanged — update silently, no flash
      set((s) => ({ prices: { ...s.prices, [symbol]: price } }));
      return;
    }

    const direction: "up" | "down" = price > prevPrice ? "up" : "down";

    set((s) => ({
      prices:       { ...s.prices,       [symbol]: price },
      flash:        { ...s.flash,        [symbol]: direction },
      flashVersion: { ...s.flashVersion, [symbol]: (s.flashVersion[symbol] ?? 0) + 1 },
    }));

    setTimeout(() => {
      set((s) => {
        const flash = { ...s.flash };
        delete flash[symbol];
        return { flash };
      });
    }, 800);
  },

  setChanges: (data) => {
    set((s) => ({ changes: { ...s.changes, ...data } }));
  },

  getPrice: (symbol) => get().prices[symbol] ?? 0,
}));
