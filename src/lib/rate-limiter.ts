// Simple in-memory rate limiter (can be enhanced with Redis for production)
// For distributed systems, replace with Redis-backed implementation

// In-memory store for rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(key)
    }
  }
}, 60000) // Cleanup every minute

// Rate limiter configuration
interface RateLimiterConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
}

// Default configuration: 60 requests per minute
const DEFAULT_CONFIG: RateLimiterConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
}

// Generate a rate limiting key from request
function getClientKey(req: Request, prefix = 'rate_limit'): string {
  // Try to get real IP from various headers (for reverse proxy setups)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = forwardedFor?.split(',')[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             '127.0.0.1' // fallback for development
  
  return `${prefix}:${ip}`
}

// In-memory rate limiter (TODO: Replace with Redis for production)
export async function rateLimiter(
  req: Request, 
  config: Partial<RateLimiterConfig> = {}
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const { windowMs, maxRequests, keyGenerator } = { ...DEFAULT_CONFIG, ...config }
  
  try {
    const key = keyGenerator ? keyGenerator(req) : getClientKey(req)
    const now = Date.now()
    
    // Get or create bucket for this key
    const bucket = requestCounts.get(key)
    
    if (!bucket || bucket.resetTime <= now) {
      // Create new bucket or reset expired bucket
      const resetTime = now + windowMs
      requestCounts.set(key, { count: 1, resetTime })
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime
      }
    }
    
    // Increment existing bucket
    bucket.count++
    const remaining = Math.max(0, maxRequests - bucket.count)
    
    return {
      success: bucket.count <= maxRequests,
      limit: maxRequests,
      remaining,
      resetTime: bucket.resetTime
    }
  } catch (error) {
    console.error('Rate limiter error:', error)
    // Fail open - allow request if rate limiter fails
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: Date.now() + windowMs
    }
  }
}

// Rate limiter for different endpoints
export const rateLimitConfigs = {
  // API endpoints
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  
  // Authentication endpoints (stricter)
  auth: { windowMs: 60 * 1000, maxRequests: 10 },
  
  // Password reset (very strict)
  passwordReset: { windowMs: 60 * 1000, maxRequests: 3 },
  
  // Comment submission
  comments: { windowMs: 60 * 1000, maxRequests: 5 },
  
  // Search endpoints
  search: { windowMs: 60 * 1000, maxRequests: 30 },
  
  // File uploads
  upload: { windowMs: 60 * 1000, maxRequests: 10 }
}

// Middleware factory for rate limiting
export function createRateLimitMiddleware(config: Partial<RateLimiterConfig> = {}) {
  return async (req: Request): Promise<Response | null> => {
    const result = await rateLimiter(req, config)
    
    if (!result.success) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
      
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
          }
        }
      )
    }
    
    return null // Continue processing
  }
}