"use client"

import { useState } from "react"
import Link from "next/link"
import type { CategoryTreeNode } from "@/lib/types"
import { useUISettings } from "@/lib/providers/ui-settings-provider"
import { CategoryTree } from "./category-tree"
import { Button } from "@/components/ui/button"
import { FiSettings, FiMenu, FiGrid } from "react-icons/fi"

interface SidebarProps {
  categories: CategoryTreeNode[]
  selectedCategoryId: string
  onSelectCategory: (id: string) => void
  onSettingsClick: () => void
}

export function Sidebar({ categories, selectedCategoryId, onSelectCategory, onSettingsClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { tokens } = useUISettings()

  const isHidden = tokens.navLayout === "hidden"
  const isRail = tokens.navLayout === "rail"
  const isCompact = tokens.density === "compact"

  if (isHidden) {
    return null
  }

  return (
    <div
      className={`flex flex-col bg-muted border-r border-border transition-all duration-300 ${isRail ? "w-16" : collapsed ? "w-16" : "w-64"
        } ${isCompact ? "density-compact" : "density-comfortable"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isRail && !collapsed && (
          <Link href="/" className="font-bold text-lg text-foreground hover:opacity-80">
            Shikkha
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          <FiMenu className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <CategoryTree
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
          collapsed={isRail || collapsed}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/admin/categories" className="block">
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent gap-2">
            <FiGrid className="w-4 h-4" />
            <span className="nav-label">{!isRail && !collapsed && "Admin"}</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="w-full justify-start bg-transparent gap-2"
        >
          <FiSettings className="w-4 h-4" />
          <span className="nav-label">{!isRail && !collapsed && "Settings"}</span>
        </Button>
      </div>
    </div>
  )
}
