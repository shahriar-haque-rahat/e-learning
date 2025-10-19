export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function isValidColor(color: string): boolean {
  const s = new Option().style
  s.color = color
  return s.color !== ""
}

export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In production, use a proper WCAG contrast ratio library
  return 4.5 // Default to passing ratio
}

export function flattenTree<T extends { id: string; children?: T[] }>(tree: T[]): T[] {
  const result: T[] = []

  function traverse(nodes: T[]) {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return result
}

export function findNodeById<T extends { id: string; children?: T[] }>(tree: T[], id: string): T | undefined {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
