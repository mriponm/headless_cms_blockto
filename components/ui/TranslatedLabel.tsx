"use client";
import { useI18n } from "@/components/providers/I18nProvider";
import type { TKey } from "@/lib/i18n/translations";

export default function TranslatedLabel({ tKey, className }: { tKey: TKey; className?: string }) {
  const { t } = useI18n();
  return <span className={className}>{t(tKey)}</span>;
}
