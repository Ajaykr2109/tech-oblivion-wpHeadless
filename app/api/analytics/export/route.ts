export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCSV(rows: Record<string, unknown>[], headers?: string[]) {
  if (!Array.isArray(rows) || rows.length === 0) return ''
  const cols = headers || Object.keys(rows[0])
  const esc = (v: unknown) => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const out = [cols.join(',')]
  for (const r of rows) {
    const row = r as Record<string, unknown>
    out.push(cols.map(c => esc(row[c])).join(','))
  }
  return out.join('\n')
}

export async function GET(req: Request) {
  const inUrl = new URL(req.url)
  const type = inUrl.searchParams.get('type') || 'views'
  const period = inUrl.searchParams.get('period') || 'month'
  const postId = inUrl.searchParams.get('postId') || ''

  let api = ''
  if (type === 'views') {
    api = `/api/analytics/views?period=${encodeURIComponent(period)}${postId ? `&postId=${encodeURIComponent(postId)}` : ''}`
  } else if (type === 'top-posts') {
    api = `/api/analytics/top-posts?period=${encodeURIComponent(period)}`
  } else if (type === 'devices') {
  api = `/api/analytics/summary?period=${encodeURIComponent(period)}`
  } else if (type === 'countries') {
  api = `/api/analytics/summary?period=${encodeURIComponent(period)}`
  } else if (type === 'referers') {
  api = `/api/analytics/summary?period=${encodeURIComponent(period)}`
  } else {
    return new Response('unknown type', { status: 400 })
  }

  const origin = inUrl.origin
  const res = await fetch(new URL(api, origin), { headers: { cookie: req.headers.get('cookie') || '' } })
  if (!res.ok) return new Response(await res.text(), { status: res.status })
  const data = await res.json()
  let csv = ''
  if (type === 'views') {
    csv = toCSV(data?.series || [], ['date','views'])
  } else if (type === 'top-posts') {
    csv = toCSV(data || [], ['id','slug','title','views'])
  } else if (type === 'devices') {
    csv = toCSV((data?.devices || []), ['device_type','count'])
  } else if (type === 'countries') {
    csv = toCSV((data?.countries || []), ['country_code','count'])
  } else if (type === 'referers') {
    csv = toCSV((data?.referers || []), ['source','count','category'])
  }
  return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${type}-${period}.csv"` } })
}
