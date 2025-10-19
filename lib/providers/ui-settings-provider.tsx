"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { ThemeTokens } from "@/lib/types"
import * as api from "@/lib/api/mock"

interface UISettingsContextType {
  tokens: ThemeTokens
  updateTokens: (tokens: Partial<ThemeTokens>) => Promise<void>
  resetTokens: () => Promise<void>
  loading: boolean
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined)

export function UISettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings()
        setTokens(settings)
        applyTheme(settings)
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateTokens = async (updates: Partial<ThemeTokens>) => {
    if (!tokens) return

    const newTokens = { ...tokens, ...updates }
    setTokens(newTokens)
    applyTheme(newTokens)
    await api.saveSettings(newTokens)
  }

  const resetTokens = async () => {
    const defaultTokens = await api.getSettings()
    setTokens(defaultTokens)
    applyTheme(defaultTokens)
  }

  const contextValue: UISettingsContextType = {
    tokens: tokens || ({} as ThemeTokens),
    updateTokens,
    resetTokens,
    loading,
  }

  return (
    <UISettingsContext.Provider value={contextValue}>
      <div className={tokens?.mode === "dark" ? "dark" : ""}>
        {loading ? (
          <div className="bg-background text-foreground flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading settings...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </UISettingsContext.Provider>
  )
}

export function useUISettings() {
  const context = useContext(UISettingsContext)
  if (!context) {
    throw new Error("useUISettings must be used within UISettingsProvider")
  }
  return context
}

function applyTheme(tokens: ThemeTokens) {
  const root = document.documentElement

  // Apply mode
  if (tokens.mode === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }

  // Apply CSS variables for colors
  root.style.setProperty("--primary", tokens.colors.primary)
  root.style.setProperty("--secondary", tokens.colors.secondary || "#7c3aed")
  root.style.setProperty("--accent", tokens.colors.accent || "#06b6d4")

  // Apply border radius
  root.style.setProperty("--radius", `${tokens.radius}px`)

  // Apply typography
  root.style.setProperty("--base-font-size", `${tokens.typography.baseSize}px`)
  root.style.setProperty("--heading-weight", `${tokens.typography.headingWeight}`)
  root.style.setProperty("--body-weight", `${tokens.typography.bodyWeight}`)

  // Apply font family to document
  const fontMap: Record<string, string> = {
    Geist: '"Geist", sans-serif',
    "system-ui": "system-ui, -apple-system, sans-serif",
    serif: "Georgia, serif",
    monospace: "Courier New, monospace",
  }
  root.style.setProperty("--font-family", fontMap[tokens.typography.font] || fontMap["Geist"])
  document.body.style.fontFamily = fontMap[tokens.typography.font] || fontMap["Geist"]

  // Apply spacing scale
  root.style.setProperty("--spacing-scale", `${tokens.spacingScale}`)

  // Apply density class
  root.classList.remove("density-compact", "density-comfortable")
  root.classList.add(`density-${tokens.density}`)

  // Apply contrast class
  root.classList.remove("contrast-high", "contrast-normal")
  root.classList.add(`contrast-${tokens.contrast}`)

  // Apply navigation layout class
  root.classList.remove("nav-integrated", "nav-rail", "nav-overlay", "nav-hidden")
  root.classList.add(`nav-${tokens.navLayout}`)

  // Apply body layout class
  root.classList.remove("body-full", "body-centered", "body-sidebar-content", "body-grid")
  root.classList.add(`body-${tokens.bodyLayout}`)

  // Apply dividers visibility
  if (tokens.showDividers) {
    root.classList.remove("hide-dividers")
    root.classList.add("show-dividers")
  } else {
    root.classList.remove("show-dividers")
    root.classList.add("hide-dividers")
  }

  // Apply navigation labels visibility
  if (tokens.showNavLabels) {
    root.classList.remove("hide-nav-labels")
    root.classList.add("show-nav-labels")
  } else {
    root.classList.remove("show-nav-labels")
    root.classList.add("hide-nav-labels")
  }

  // Apply language
  root.lang = tokens.language
}
