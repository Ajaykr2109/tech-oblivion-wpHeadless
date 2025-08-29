import { cached } from './serverCache'

export type TocItem = { level: 2 | 3; text: string; slug: string }

export function extractTOCFromHtml(html: string): TocItem[] {
  const items: TocItem[] = []
  const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const level = Number(m[1]) as 2 | 3
    const text = m[2].replace(/<[^>]+>/g, '')
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    items.push({ level, text, slug })
  }
  return items
}

export async function getOrBuildToc(postId: number, html: string) {
  const key = `toc:${postId}`
  return cached<TocItem[]>(key, 3600, [key], async () => extractTOCFromHtml(html))
}
