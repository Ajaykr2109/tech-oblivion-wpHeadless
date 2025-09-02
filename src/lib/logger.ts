import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const DEBUG_FILE = path.join(LOG_DIR, 'debug.log')
const INFO_FILE = path.join(LOG_DIR, 'app.log')
const ERROR_FILE = path.join(LOG_DIR, 'error.log')

function ensureDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  } catch {
    // ignore directory creation errors
  }
}

function write(file: string, entry: unknown) {
  try {
    ensureDir()
    fs.appendFileSync(file, JSON.stringify(entry) + '\n')
  } catch {
    // swallow logging errors - console.warn could be added for debugging
    console.warn('Failed to write log')
  }
}

export const logger = {
  debug: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'debug', context, data }
    // console.debug can be noisy; keep for local visibility
    // eslint-disable-next-line no-console
    console.debug('[DEBUG]', JSON.stringify(entry))
    write(DEBUG_FILE, entry)
  },
  info: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'info', context, data }
    // eslint-disable-next-line no-console
    console.log('[LOG]', JSON.stringify(entry))
    write(INFO_FILE, entry)
  },
  error: (context: string, data: unknown) => {
    const entry = { ts: new Date().toISOString(), level: 'error', context, data }
    // eslint-disable-next-line no-console
    console.error('[ERROR]', JSON.stringify(entry))
    write(ERROR_FILE, entry)
  },
}

export default logger
