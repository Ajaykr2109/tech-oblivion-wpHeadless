// Client/Server compatible logger - only use Node.js fs on server side
let fs: typeof import('fs') | null = null
let path: typeof import('path') | null = null
let LOG_DIR: string | null = null
let DEBUG_FILE: string | null = null
let INFO_FILE: string | null = null
let ERROR_FILE: string | null = null

// Initialize server-side modules only when available
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require('path')
    if (path) {
      LOG_DIR = path.join(process.cwd(), 'logs')
      DEBUG_FILE = path.join(LOG_DIR, 'debug.log')
      INFO_FILE = path.join(LOG_DIR, 'app.log')
      ERROR_FILE = path.join(LOG_DIR, 'error.log')
    }
  } catch {
    // Server modules not available - running in browser
  }
}

function ensureDir() {
  if (!fs || !LOG_DIR) return
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  } catch {
    // ignore directory creation errors
  }
}

function write(file: string | null, entry: unknown) {
  if (!fs || !file) return // Skip file writing in browser or when paths unavailable
  try {
    ensureDir()
    fs.appendFileSync(file, JSON.stringify(entry) + '\n')
  } catch {
    // swallow logging errors - console.warn could be added for debugging
  }
}

export const logger = {
  debug: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'debug', context, data }
    // Disable console output to reduce noise
    write(DEBUG_FILE, entry)
  },
  info: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'info', context, data }
    // Disable console output to reduce noise
    write(INFO_FILE, entry)
  },
  error: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'error', context, data }
    // Keep error console output for critical issues
    // eslint-disable-next-line no-console
    console.error('[ERROR]', JSON.stringify(entry))
    write(ERROR_FILE, entry)
  },
}

export default logger
