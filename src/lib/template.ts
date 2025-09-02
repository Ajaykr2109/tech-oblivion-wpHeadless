export function renderTemplate(template: string, data: Record<string, unknown>): string {
  if (!template) return ''
  return template.replace(/\{([a-zA-Z0-9._$-]+)\}/g, (_, key) => {
    const value = getByPath(data, key)
    return value == null ? '' : String(value)
  })
}

function getByPath(obj: unknown, path: string): unknown {
  try {
    return path.split('.').reduce((acc, k) => {
      if (acc != null && typeof acc === 'object' && k in acc) {
        return (acc as Record<string, unknown>)[k]
      }
      return undefined
    }, obj)
  } catch {
    return undefined
  }
}

export default renderTemplate
