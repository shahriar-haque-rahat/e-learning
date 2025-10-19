"use client"

import type React from "react"

import { useState } from "react"
import type { CategoryTreeNode } from "@/lib/types"
import { FiChevronRight, FiFolder } from "react-icons/fi"
import { RxDragHandleVertical } from "react-icons/rx"

interface CategoryTreeDndProps {
  categories: CategoryTreeNode[]
  selectedCategoryId: string
  onSelectCategory: (id: string) => void
  onReorder?: (moves: { id: string; parentId: string | null; order: number }[]) => void
  collapsed?: boolean
  level?: number
  draggingId?: string | null
  onDragStart?: (id: string) => void
  onDragEnd?: () => void
}

export function CategoryTreeDnd({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onReorder,
  collapsed = false,
  level = 0,
  draggingId,
  onDragStart,
  onDragEnd,
}: CategoryTreeDndProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["overview", "fundamental"]))
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("categoryId", id)
    onDragStart?.(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverId(id)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData("categoryId")
    if (sourceId !== targetId && onReorder) {
      onReorder([{ id: sourceId, parentId: targetId, order: 0 }])
    }
    setDragOverId(null)
    onDragEnd?.()
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const base =
          "flex items-center gap-2 px-3 py-2 rounded-md cursor-move transition-colors hover:bg-background/50"
        const isSelected = selectedCategoryId === category.id
        const isDragOver = dragOverId === category.id
        const isDragging = draggingId === category.id
        const rowClass = [
          base,
          isSelected ? "bg-primary text-primary-foreground" : "",
          isDragOver ? "bg-accent/20 border-2 border-accent" : "",
          isDragging ? "opacity-50" : "",
        ]
          .filter(Boolean)
          .join(" ")

        return (
          <div key={category.id}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, category.id)}
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category.id)}
              className={rowClass}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
              <RxDragHandleVertical className="w-4 h-4 flex-shrink-0 opacity-50" />

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

              <span
                className="flex-1 truncate text-sm font-medium"
                onClick={() => onSelectCategory(category.id)}
              >
                {category.name}
              </span>
            </div>

            {expanded.has(category.id) && category.children.length > 0 && (
              <CategoryTreeDnd
                categories={category.children}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
                onReorder={onReorder}
                collapsed={collapsed}
                level={level + 1}
                draggingId={draggingId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
