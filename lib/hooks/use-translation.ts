"use client"

import { useUISettings } from "@/lib/providers/ui-settings-provider"
import { useTranslation } from "@/lib/i18n/translations"

export function useTrans() {
  const { tokens } = useUISettings()
  const t = useTranslation(tokens.language)
  return t
}
