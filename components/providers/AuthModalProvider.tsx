"use client";
import { createContext, useContext, useState, useRef, ReactNode } from "react";

type Mode = "signin" | "signup";

interface AuthModalCtx {
  open: boolean;
  mode: Mode;
  onSuccess: { current: (() => void) | null };
  openModal: (mode?: Mode, onSuccess?: () => void) => void;
  closeModal: () => void;
  setMode: (mode: Mode) => void;
}

const Ctx = createContext<AuthModalCtx>({
  open: false,
  mode: "signin",
  onSuccess: { current: null },
  openModal: () => {},
  closeModal: () => {},
  setMode: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen]   = useState(false);
  const [mode, setMode]   = useState<Mode>("signin");
  const onSuccess         = useRef<(() => void) | null>(null);

  function openModal(m: Mode = "signin", cb?: () => void) {
    onSuccess.current = cb ?? null;
    setMode(m);
    setOpen(true);
  }

  return (
    <Ctx.Provider value={{ open, mode, onSuccess, openModal, closeModal: () => setOpen(false), setMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  return useContext(Ctx);
}
