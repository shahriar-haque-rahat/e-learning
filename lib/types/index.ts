export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  path: string[]
  order: number
  icon?: string | null
  visible: boolean
  color?: string | null
  createdAt: string
  updatedAt: string
}

export interface ThemeTokens {
  mode: "light" | "dark" | "system"
  contrast: "normal" | "high"
  density: "comfortable" | "compact"
  navLayout: "integrated" | "rail" | "overlay" | "hidden"
  bodyLayout: "full" | "centered" | "sidebar-content" | "grid"
  colors: {
    primary: string
    secondary?: string
    accent?: string
  }
  typography: {
    font: string
    baseSize: number
    headingWeight: number
    bodyWeight: number
  }
  radius: number
  spacingScale: number
  showDividers: boolean
  showNavLabels: boolean
  language: "en" | "bn"
}

export interface UiPreset {
  id: string
  userId?: string | null
  name: string
  tokens: ThemeTokens
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}
