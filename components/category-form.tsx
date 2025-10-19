"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/types"
import * as api from "@/lib/api/mock"
import { Button } from "@/components/ui/button"
import { FiTrash2, FiSave, FiPlus, FiChevronDown, FiChevronRight } from "react-icons/fi"

interface CategoryFormProps {
  categoryId: string | null
  onClose: () => void
}

interface SubcategoryItem {
  id: string
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  visible: boolean
  children: SubcategoryItem[]
}

export function CategoryForm({ categoryId, onClose }: CategoryFormProps) {
  const [category, setCategory] = useState<Partial<Category>>({
    name: "",
    slug: "",
    parentId: null,
    icon: null,
    visible: true,
    color: null,
  })
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const cats = await api.getCategories({ flat: true })
      setAllCategories(cats)

      if (categoryId) {
        const cat = cats.find((c) => c.id === categoryId)
        if (cat) {
          setCategory(cat)
          // Load subcategories for this category
          const subs = cats.filter((c) => c.parentId === categoryId)
          setSubcategories(buildSubcategoryTree(subs, cats))
        }
      }
    }
    load()
  }, [categoryId])

  const buildSubcategoryTree = (items: Category[], allCats: Category[]): SubcategoryItem[] => {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      color: item.color,
      visible: item.visible,
      children: buildSubcategoryTree(
        allCats.filter((c) => c.parentId === item.id),
        allCats,
      ),
    }))
  }

  const handleChange = (key: string, value: any) => {
    setCategory((prev) => ({ ...prev, [key]: value }))
  }

  const addSubcategory = (parentId: string | null = null) => {
    const newSub: SubcategoryItem = {
      id: `new-${Date.now()}`,
      name: "",
      slug: "",
      icon: null,
      color: null,
      visible: true,
      children: [],
    }

    if (parentId === null) {
      setSubcategories([...subcategories, newSub])
    } else {
      const addToTree = (items: SubcategoryItem[]): SubcategoryItem[] => {
        return items.map((item) => {
          if (item.id === parentId) {
            return { ...item, children: [...item.children, newSub] }
          }
          return { ...item, children: addToTree(item.children) }
        })
      }
      setSubcategories(addToTree(subcategories))
    }

    // Auto-expand the parent
    if (parentId) {
      setExpandedIds((prev) => new Set([...prev, parentId]))
    }
  }

  const updateSubcategory = (id: string, updates: Partial<SubcategoryItem>) => {
    const updateInTree = (items: SubcategoryItem[]): SubcategoryItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates }
        }
        return { ...item, children: updateInTree(item.children) }
      })
    }
    setSubcategories(updateInTree(subcategories))
  }

  const deleteSubcategory = (id: string) => {
    const deleteFromTree = (items: SubcategoryItem[]): SubcategoryItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: deleteFromTree(item.children),
        }))
    }
    setSubcategories(deleteFromTree(subcategories))
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save main category
      let mainCatId = categoryId
      if (categoryId) {
        await api.updateCategory(categoryId, category)
      } else {
        const result = await api.createCategory(category)
        mainCatId = result.id
      }

      const saveSubcategories = async (items: SubcategoryItem[], parentId: string) => {
        for (const item of items) {
          const isNew = item.id.startsWith("new-")
          const subCatData = {
            name: item.name,
            slug: item.slug,
            parentId,
            icon: item.icon,
            color: item.color,
            visible: item.visible,
          }

          let subCatId = item.id
          if (isNew) {
            const result = await api.createCategory(subCatData)
            subCatId = result.id
          } else {
            await api.updateCategory(item.id, subCatData)
          }

          // Recursively save children
          if (item.children.length > 0) {
            await saveSubcategories(item.children, subCatId)
          }
        }
      }

      if (mainCatId && subcategories.length > 0) {
        await saveSubcategories(subcategories, mainCatId)
      }

      onClose()
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!categoryId) return
    if (!confirm("Delete this category and all subcategories?")) return

    setLoading(true)
    try {
      await api.deleteCategory(categoryId, { cascade: true })
      onClose()
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const SubcategoryTree = ({ items, level = 0 }: { items: SubcategoryItem[]; level?: number }) => {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-border">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  {item.children.length > 0 && (
                    <button onClick={() => toggleExpanded(item.id)} className="p-1 hover:bg-background rounded">
                      {expandedIds.has(item.id) ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {item.children.length === 0 && <div className="w-6" />}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateSubcategory(item.id, { name: e.target.value })}
                    placeholder="Subcategory name"
                    className="flex-1 px-2 py-1 border border-border rounded text-sm bg-background"
                  />
                  <button
                    onClick={() => deleteSubcategory(item.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 ml-6">
                  <input
                    type="text"
                    value={item.slug}
                    onChange={(e) => updateSubcategory(item.id, { slug: e.target.value })}
                    placeholder="slug"
                    className="px-2 py-1 border border-border rounded text-xs bg-background"
                  />
                  <input
                    type="text"
                    value={item.icon || ""}
                    onChange={(e) => updateSubcategory(item.id, { icon: e.target.value })}
                    placeholder="icon"
                    className="px-2 py-1 border border-border rounded text-xs bg-background"
                  />
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <input
                    type="color"
                    value={item.color || "#000000"}
                    onChange={(e) => updateSubcategory(item.id, { color: e.target.value })}
                    className="w-8 h-6 rounded cursor-pointer border border-border"
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(e) => updateSubcategory(item.id, { visible: e.target.checked })}
                      className="w-3 h-3 rounded border border-border"
                    />
                    Visible
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSubcategory(item.id)}
                    className="ml-auto gap-1 bg-transparent text-xs h-6"
                  >
                    <FiPlus className="w-3 h-3" />
                    Add Sub
                  </Button>
                </div>
              </div>
            </div>

            {expandedIds.has(item.id) && item.children.length > 0 && (
              <div className="ml-6 space-y-2">
                <SubcategoryTree items={item.children} level={level + 1} />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-6 bg-card p-6 rounded-lg border border-border max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold">{categoryId ? "Edit" : "New"} Category</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-2">Name</label>
          <input
            type="text"
            value={category.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm"
            placeholder="Category name"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">Slug</label>
          <input
            type="text"
            value={category.slug || ""}
            onChange={(e) => handleChange("slug", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm"
            placeholder="category-slug"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">Parent Category</label>
          <select
            value={category.parentId || ""}
            onChange={(e) => handleChange("parentId", e.target.value || null)}
            className="w-full px-3 py-2 border border-border rounded text-sm"
          >
            <option value="">None (Top level)</option>
            {allCategories
              .filter((c) => c.id !== categoryId)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">Icon</label>
          <input
            type="text"
            value={category.icon || ""}
            onChange={(e) => handleChange("icon", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm"
            placeholder="icon-name"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={category.color || "#000000"}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-border"
            />
            <input
              type="text"
              value={category.color || ""}
              onChange={(e) => handleChange("color", e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="visible"
            checked={category.visible ?? true}
            onChange={(e) => handleChange("visible", e.target.checked)}
            className="w-4 h-4 rounded border border-border"
          />
          <label htmlFor="visible" className="text-sm font-medium">
            Visible
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subcategories</h3>
          <Button size="sm" onClick={() => addSubcategory()} className="gap-2" disabled={!categoryId && !category.name}>
            <FiPlus className="w-4 h-4" />
            Add Subcategory
          </Button>
        </div>

        {subcategories.length > 0 ? (
          <SubcategoryTree items={subcategories} />
        ) : (
          <p className="text-sm text-muted-foreground italic">No subcategories yet</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} disabled={loading} className="flex-1 gap-2">
          <FiSave className="w-4 h-4" />
          Save
        </Button>
        {categoryId && (
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2">
            <FiTrash2 className="w-4 h-4" />
          </Button>
        )}
        <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </div>
  )
}
