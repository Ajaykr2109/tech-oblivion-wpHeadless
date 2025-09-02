import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Root, Content, Heading } from 'mdast'
import { toString } from 'mdast-util-to-string'
import GithubSlugger from 'github-slugger'

export type TocItem = { id: string; depth: number; value: string }

export function extractTocFromMarkdown(markdown: string, options?: { minDepth?: number; maxDepth?: number }) {
  const minDepth = options?.minDepth ?? 2
  const maxDepth = options?.maxDepth ?? 3
  const tree = unified().use(remarkParse).parse(markdown) as Root
  const slugger = new GithubSlugger()
  const items: TocItem[] = []

  function visit(node: Content) {
    if (node.type === 'heading') {
      const h = node as Heading
      const depth = h.depth
      if (depth >= minDepth && depth <= maxDepth) {
        const text = toString(h)
        const id = slugger.slug(text)
        items.push({ id, depth, value: text })
      }
    }
    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach(visit)
    }
  }

  ;(tree.children as Content[]).forEach(visit)
  return items
}
