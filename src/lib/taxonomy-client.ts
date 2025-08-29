export type WpCategory = { id: number; name: string; slug: string; parent: number; count?: number }
export type WpTag = { id: number; name: string; slug: string; count?: number }

export async function fetchAllCategories(): Promise<WpCategory[]> {
  const res = await fetch('/api/wp/categories?per_page=100&hide_empty=0', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed categories: ${res.status}`)
  return res.json()
}

export function buildCategoryTree(cats: WpCategory[]) {
  const byId = new Map<number, any>()
  const roots: any[] = []
  cats.forEach(c => byId.set(c.id, { ...c, children: [] as any[] }))
  cats.forEach(c => {
    const node = byId.get(c.id)
    if (c.parent && byId.has(c.parent)) {
      byId.get(c.parent).children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export async function createCategory(input: { name: string; slug?: string; parent?: number }) {
  const res = await fetch('/api/wp/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Create category failed: ${res.status}`)
  return res.json()
}

export async function fetchAllTags(): Promise<WpTag[]> {
  const res = await fetch('/api/wp/tags?per_page=100', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed tags: ${res.status}`)
  return res.json()
}

export async function resolveTags(names: string[]): Promise<number[]> {
  const res = await fetch('/api/wp/tags/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  })
  if (!res.ok) throw new Error('Resolve tags failed')
  const j = await res.json()
  return Array.isArray(j?.ids) ? j.ids : []
}
