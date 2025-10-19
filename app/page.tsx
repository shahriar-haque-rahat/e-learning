"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useUISettings } from "@/lib/providers/ui-settings-provider"
import type { CategoryTreeNode, ThemeTokens } from "@/lib/types"
import * as api from "@/lib/api/mock"
import { Sidebar } from "@/components/sidebar"
import { SettingsPanel } from "@/components/settings-panel"
import { Canvas } from "@/components/canvas"

export default function Home() {
  const searchParams = useSearchParams()
  const { tokens, updateTokens } = useUISettings()
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("emergency-meeting")
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Check for theme in URL
    const themeParam = searchParams.get("theme")
    if (themeParam) {
      try {
        const decoded = JSON.parse(atob(themeParam)) as ThemeTokens
        updateTokens(decoded)
      } catch (error) {
        console.error("Failed to decode theme:", error)
      }
    }
  }, [searchParams, updateTokens])

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await api.getCategories()
      setCategories(cats)
    }
    loadCategories()
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Canvas categoryId={selectedCategoryId} onSettingsClick={() => setShowSettings(true)} />
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
