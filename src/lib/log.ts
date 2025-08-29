import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'wp-errors.log')

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  } catch (e) {
    // ignore
  }
}

export function logWPError(context: string, info: { status?: number; statusText?: string; body?: string }) {
  const entry = {
    ts: new Date().toISOString(),
    context,
    status: info.status,
    statusText: info.statusText,
    bodySnippet: info.body ? (typeof info.body === 'string' ? info.body.slice(0, 1000) : String(info.body)) : undefined,
  }
  // Console for immediate dev visibility
  // eslint-disable-next-line no-console
  console.error('[WP ERROR]', JSON.stringify(entry))

  try {
    ensureLogDir()
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n')
  } catch (e) {
    // ignore logging failures to avoid crashing server
  }
}

export default logWPError
