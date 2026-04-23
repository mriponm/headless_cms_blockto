"use client";
import { useEffect } from "react";
import { useTranslationBatcher } from "@/components/providers/TranslationBatcherProvider";

interface Props {
  text: string;
  className?: string;
}

export default function TranslatedText({ text, className }: Props) {
  const { register, getTranslation, lang } = useTranslationBatcher();

  // Register this text with the store on mount (and whenever text changes)
  useEffect(() => {
    register(text);
  }, [text, register]);

  const display = lang === "en" ? text : (getTranslation(text) || text);

  if (className) return <span className={className}>{display}</span>;
  return <>{display}</>;
}
