module.exports = new Proxy({}, {
  get: (t, p) => {
    if (p === 'headers') return () => new Map()
    if (p === 'cookies') return () => ({ get: () => undefined, set: () => {}, delete: () => {} })
    if (p === 'redirect') return () => {}
    if (p === 'notFound') return () => {}
    if (p === 'revalidatePath') return () => {}
    if (p === 'revalidateTag') return () => {}
    return () => {}
  }
})
