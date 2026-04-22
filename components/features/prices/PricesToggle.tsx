"use client";

interface Props {
  active: "metrics" | "prices";
  onChange: (v: "metrics" | "prices") => void;
}

export default function PricesToggle({ active, onChange }: Props) {
  return (
    <div className="prices-toggle-wrap">
      <div className="prices-toggle">
        <button
          className={`prices-toggle-btn${active === "metrics" ? " prices-toggle-active" : ""}`}
          onClick={() => onChange("metrics")}
        >
          Metrics
        </button>
        <button
          className={`prices-toggle-btn${active === "prices" ? " prices-toggle-active" : ""}`}
          onClick={() => onChange("prices")}
        >
          Prices
        </button>
      </div>
    </div>
  );
}
