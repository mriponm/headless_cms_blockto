"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Mode = "signin" | "signup";

interface AuthModalCtx {
  open: boolean;
  mode: Mode;
  openModal: (mode?: Mode) => void;
  closeModal: () => void;
  setMode: (mode: Mode) => void;
}

const Ctx = createContext<AuthModalCtx>({
  open: false,
  mode: "signin",
  openModal: () => {},
  closeModal: () => {},
  setMode: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");

  function openModal(m: Mode = "signin") {
    setMode(m);
    setOpen(true);
  }

  return (
    <Ctx.Provider value={{ open, mode, openModal, closeModal: () => setOpen(false), setMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  return useContext(Ctx);
}
