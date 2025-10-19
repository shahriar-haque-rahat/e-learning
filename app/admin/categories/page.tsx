"use client"

import { useEffect, useState } from "react"
import type { Category, CategoryTreeNode } from "@/lib/types"
import * as api from "@/lib/api/mock"
import { CategoryTreeDnd } from "@/components/category-tree-dnd"
import { CategoryForm } from "@/components/category-form"
import { Button } from "@/components/ui/button"
import { FiPlus, FiDownload, FiUpload } from "react-icons/fi"

// --- helper: flat -> tree ---
function buildCategoryTree(flat: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []

  // make nodes
  for (const c of flat) {
    map.set(c.id, { ...c, children: [] })
  }
  // link children
  for (const c of flat) {
    const node = map.get(c.id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    // get flat list, then build tree
    const flat = await api.getCategories({ flat: true })
    setCategories(buildCategoryTree(flat))
  }

  const handleAddCategory = () => {
    setSelectedCategoryId(null)
    setShowForm(true)
  }

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedCategoryId(null)
    loadCategories()
  }

  const handleReorder = async (moves: { id: string; parentId: string | null; order: number }[]) => {
    await api.reorderCategories(moves)
    loadCategories()
  }

  const handleExport = () => {
    const data = JSON.stringify(categories, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "categories.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    try {
      const imported = JSON.parse(text)
      // Clear existing and import new
      const allCats = await api.getCategories({ flat: true })
      for (const cat of allCats) {
        await api.deleteCategory(cat.id)
      }
      // Import new categories (if your export is a tree, you may need to flatten first)
      for (const cat of imported) {
        await api.createCategory(cat)
      }
      loadCategories()
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left: Category Tree */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Categories</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddCategory} className="flex-1 gap-2">
              <FiPlus className="w-4 h-4" />
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
              <FiDownload className="w-4 h-4" />
            </Button>
            <label htmlFor="category-import" className="cursor-pointer">
              <input id="category-import" type="file" accept=".json" onChange={handleImport} className="hidden" />
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <FiUpload className="w-4 h-4" />
              </Button>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <CategoryTreeDnd
            categories={categories}
            selectedCategoryId={selectedCategoryId || ""}
            onSelectCategory={handleSelectCategory}
            onReorder={handleReorder}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
          />
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        {showForm ? (
          <CategoryForm categoryId={selectedCategoryId} onClose={handleFormClose} />
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Select a category or create a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
