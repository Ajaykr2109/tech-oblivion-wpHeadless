import { logger } from './logger'

export function logWPError(context: string, info: { status?: number; statusText?: string; body?: string }) {
  const entry = {
    context,
    status: info.status,
    statusText: info.statusText,
    bodySnippet: info.body ? (typeof info.body === 'string' ? info.body.slice(0, 2000) : String(info.body)) : undefined,
  }

  // Error-level for HTTP >=500 or explicit errors
  if (entry.status && entry.status >= 500) {
    logger.error(context, entry)
  } else if (entry.status && entry.status >= 400) {
    // client errors -> info
    logger.info(context, entry)
  } else {
    // otherwise debug
    logger.debug(context, entry)
  }
}

export default logWPError
