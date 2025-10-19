import type { Category, ThemeTokens, UiPreset, CategoryTreeNode } from "@/lib/types"

const CATEGORIES_KEY = "shikkha.categories"
const SETTINGS_KEY = "shikkha.settings"
const PRESETS_KEY = "shikkha.presets"

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Default theme tokens
const DEFAULT_TOKENS: ThemeTokens = {
  mode: "light",
  contrast: "normal",
  density: "comfortable",
  navLayout: "integrated",
  bodyLayout: "full",
  colors: {
    primary: "#2563eb",
    secondary: "#7c3aed",
    accent: "#06b6d4",
  },
  typography: {
    font: "Geist",
    baseSize: 16,
    headingWeight: 700,
    bodyWeight: 400,
  },
  radius: 8,
  spacingScale: 1,
  showDividers: true,
  showNavLabels: true,
  language: "en",
}

// Seed data
const SEED_CATEGORIES: Category[] = [
  {
    id: "overview",
    name: "Overview",
    slug: "overview",
    parentId: null,
    path: [],
    order: 0,
    icon: "home",
    visible: true,
    color: "#3b82f6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "welcome",
    name: "Welcome",
    slug: "welcome",
    parentId: "overview",
    path: ["overview"],
    order: 0,
    icon: "star",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "orientation",
    name: "Orientation",
    slug: "orientation",
    parentId: "overview",
    path: ["overview"],
    order: 1,
    icon: "compass",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fundamental",
    name: "Fundamental",
    slug: "fundamental",
    parentId: null,
    path: [],
    order: 1,
    icon: "book",
    visible: true,
    color: "#8b5cf6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fund-overview",
    name: "Overview",
    slug: "fund-overview",
    parentId: "fundamental",
    path: ["fundamental"],
    order: 0,
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "emergency-meeting",
    name: "Emergency meeting",
    slug: "emergency-meeting",
    parentId: "fundamental",
    path: ["fundamental"],
    order: 1,
    icon: "alert",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "typing",
    name: "Typing",
    slug: "typing",
    parentId: "fundamental",
    path: ["fundamental"],
    order: 2,
    icon: "keyboard",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Initialize localStorage with seed data
function initializeStorage() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(SEED_CATEGORIES))
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_TOKENS))
  }
  if (!localStorage.getItem(PRESETS_KEY)) {
    localStorage.setItem(PRESETS_KEY, JSON.stringify([]))
  }
}

export async function getCategories(opts?: { flat?: boolean }) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(CATEGORIES_KEY)
  const categories: Category[] = data ? JSON.parse(data) : SEED_CATEGORIES

  if (opts?.flat) {
    return categories
  }

  return buildTree(categories)
}

export async function createCategory(payload: Partial<Category>) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(CATEGORIES_KEY)
  const categories: Category[] = data ? JSON.parse(data) : []

  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name: payload.name || "Untitled",
    slug: payload.slug || generateSlug(payload.name || "untitled"),
    parentId: payload.parentId || null,
    path: payload.path || [],
    order: payload.order ?? categories.length,
    icon: payload.icon || null,
    visible: payload.visible ?? true,
    color: payload.color || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  categories.push(newCategory)
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))

  return newCategory
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(CATEGORIES_KEY)
  const categories: Category[] = data ? JSON.parse(data) : []

  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) throw new Error("Category not found")

  categories[index] = {
    ...categories[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  return categories[index]
}

export async function deleteCategory(id: string, opts?: { cascade?: boolean }) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(CATEGORIES_KEY)
  let categories: Category[] = data ? JSON.parse(data) : []

  if (opts?.cascade) {
    const toDelete = new Set<string>()
    const collect = (catId: string) => {
      toDelete.add(catId)
      categories.filter((c) => c.parentId === catId).forEach((c) => collect(c.id))
    }
    collect(id)
    categories = categories.filter((c) => !toDelete.has(c.id))
  } else {
    categories = categories.filter((c) => c.id !== id)
  }

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export async function reorderCategories(moves: { id: string; parentId: string | null; order: number }[]) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(CATEGORIES_KEY)
  const categories: Category[] = data ? JSON.parse(data) : []

  moves.forEach((move) => {
    const cat = categories.find((c) => c.id === move.id)
    if (cat) {
      cat.parentId = move.parentId
      cat.order = move.order
      cat.path = computePath(cat.id, categories)
      cat.updatedAt = new Date().toISOString()
    }
  })

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export async function getSettings(): Promise<ThemeTokens> {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(SETTINGS_KEY)
  return data ? JSON.parse(data) : DEFAULT_TOKENS
}

export async function saveSettings(tokens: ThemeTokens) {
  await delay()
  initializeStorage()

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(tokens))
  return tokens
}

export async function listPresets(): Promise<UiPreset[]> {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(PRESETS_KEY)
  return data ? JSON.parse(data) : []
}

export async function createPreset(name: string, tokens: ThemeTokens): Promise<UiPreset> {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(PRESETS_KEY)
  const presets: UiPreset[] = data ? JSON.parse(data) : []

  const preset: UiPreset = {
    id: `preset-${Date.now()}`,
    name,
    tokens,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  presets.push(preset)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))

  return preset
}

export async function loadPreset(id: string): Promise<ThemeTokens> {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(PRESETS_KEY)
  const presets: UiPreset[] = data ? JSON.parse(data) : []

  const preset = presets.find((p) => p.id === id)
  if (!preset) throw new Error("Preset not found")

  return preset.tokens
}

export async function deletePreset(id: string) {
  await delay()
  initializeStorage()

  const data = localStorage.getItem(PRESETS_KEY)
  let presets: UiPreset[] = data ? JSON.parse(data) : []

  presets = presets.filter((p) => p.id !== id)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
}

// Utility functions
export function buildTree(flat: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []

  flat.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] })
  })

  flat.forEach((cat) => {
    const node = map.get(cat.id)!
    if (cat.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(cat.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  roots.sort((a, b) => a.order - b.order)
  roots.forEach((root) => sortChildren(root))

  return roots
}

function sortChildren(node: CategoryTreeNode) {
  node.children.sort((a, b) => a.order - b.order)
  node.children.forEach(sortChildren)
}

function computePath(id: string, categories: Category[]): string[] {
  const cat = categories.find((c) => c.id === id)
  if (!cat || !cat.parentId) return []

  const parent = categories.find((c) => c.id === cat.parentId)
  if (!parent) return [cat.parentId]

  return [...computePath(cat.parentId, categories), cat.parentId]
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}
