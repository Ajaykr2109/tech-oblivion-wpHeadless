export function renderTemplate(template: string, data: Record<string, any>): string {
  if (!template) return ''
  return template.replace(/\{([a-zA-Z0-9_.$\-]+)\}/g, (_, key) => {
    const value = getByPath(data, key)
    return value == null ? '' : String(value)
  })
}

function getByPath(obj: any, path: string) {
  try {
    return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj)
  } catch {
    return undefined
  }
}

export default renderTemplate
