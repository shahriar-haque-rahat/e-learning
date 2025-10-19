"use client"

import { useState } from "react"
import type { CategoryTreeNode } from "@/lib/types"
import { FiChevronRight, FiFolder } from "react-icons/fi"

interface CategoryTreeProps {
  categories: CategoryTreeNode[]
  selectedCategoryId: string
  onSelectCategory: (id: string) => void
  collapsed?: boolean
  level?: number
}

export function CategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  collapsed = false,
  level = 0,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["overview", "fundamental"]))

  const toggleExpanded = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id
        const rowClass =
          "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-background/50" +
          (isSelected ? " bg-primary text-primary-foreground" : "")

        return (
          <div key={category.id}>
            <div className={rowClass} style={{ paddingLeft: `${level * 16 + 12}px` }}>
              {category.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(category.id)
                  }}
                  className="p-0 hover:bg-background/20 rounded"
                >
                  <FiChevronRight
                    className={`w-4 h-4 transition-transform ${expanded.has(category.id) ? "rotate-90" : ""
                      }`}
                  />
                </button>
              )}
              {category.children.length === 0 && <div className="w-4" />}

              <FiFolder className="w-4 h-4 flex-shrink-0" />

              <span className="flex-1 truncate text-sm font-medium" onClick={() => onSelectCategory(category.id)}>
                {category.name}
              </span>
            </div>

            {expanded.has(category.id) && category.children.length > 0 && (
              <CategoryTree
                categories={category.children}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
                collapsed={collapsed}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
