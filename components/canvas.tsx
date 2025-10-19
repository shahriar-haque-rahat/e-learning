"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Category } from "@/lib/types"
import * as api from "@/lib/api/mock"
import { useUISettings } from "@/lib/providers/ui-settings-provider"
import { Button } from "@/components/ui/button"
import { FiSettings, FiGrid } from "react-icons/fi"
import dynamic from "next/dynamic"

// Minimal props we use from react-player to satisfy TS
type MinimalReactPlayerProps = {
  url?: string | string[]
  width?: string | number
  height?: string | number
  controls?: boolean
}
const ReactPlayer = dynamic<MinimalReactPlayerProps>(
  () => import("react-player").then((m) => m.default),
  { ssr: false }
)

interface CanvasProps {
  categoryId: string
  onSettingsClick: () => void
}

export function Canvas({ categoryId, onSettingsClick }: CanvasProps) {
  const { tokens } = useUISettings() // remove if unused
  const [category, setCategory] = useState<Category | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Category[]>([])

  useEffect(() => {
    const loadCategory = async () => {
      const allCats = await api.getCategories({ flat: true })
      const cat = allCats.find((c) => c.id === categoryId) ?? null

      setCategory(cat)

      if (cat) {
        const crumbs: Category[] = []
        let current: Category | null = cat

        while (current) {
          crumbs.unshift(current)

          // Explicitly type parentId so it isn't inferred as 'any'
          const parentId: string | null = current.parentId ?? null

          if (parentId) {
            current = allCats.find((c) => c.id === parentId) ?? null
          } else {
            current = null
          }
        }

        setBreadcrumb(crumbs)
      } else {
        setBreadcrumb([])
      }
    }

    loadCategory()
  }, [categoryId])

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {breadcrumb.map((crumb, idx) => (
              <div key={crumb.id} className="flex items-center gap-2">
                {idx > 0 && <span>/</span>}
                <span>{crumb.name}</span>
              </div>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/categories">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <FiGrid className="w-4 h-4" />
              Admin
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={onSettingsClick} className="gap-2 bg-transparent">
            <FiSettings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto body-layout-wrapper">
        <div className="body-layout-container">
          {categoryId === "emergency-meeting" && (
            <div className="space-y-6">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">This is a demo video player. Replace with your content.</p>
              </div>
            </div>
          )}

          {categoryId !== "emergency-meeting" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Content for {category.name} coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
