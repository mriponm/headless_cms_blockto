"use client";
import { useRef, useState, useEffect } from "react";

export function useFlash(value: number): string {
  const prev = useRef(value);
  const [cls, setCls] = useState("");
  useEffect(() => {
    if (value === prev.current) return;
    setCls(value > prev.current ? "flash-up" : "flash-down");
    prev.current = value;
    const t = setTimeout(() => setCls(""), 950);
    return () => clearTimeout(t);
  }, [value]);
  return cls;
}
