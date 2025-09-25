// Strong password policy implementation with breach checking

export interface PasswordStrength {
  score: number      // 0-4 (0: very weak, 4: very strong)
  feedback: string[] // Array of feedback messages
  isValid: boolean   // Meets minimum requirements
  timeToCrack: string // Estimated time to crack
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  forbidCommonPatterns: boolean
  checkHaveIBeenPwned: boolean
}

// Production-grade password policy
export const STRONG_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPatterns: true,
  checkHaveIBeenPwned: true
}

// Common weak patterns to forbid
const COMMON_PATTERNS = [
  /^(.)\1{2,}$/,           // Repeated characters (aaa, 111)
  /^(012|123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210)/,
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
  /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i,
  /password/i,
  /^(admin|user|guest|test|demo)/i,
  /^(welcome|login|secret|private)/i
]

// Check if password contains common patterns
function hasCommonPatterns(password: string): string[] {
  const issues: string[] = []
  
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      issues.push('Contains common patterns or sequences')
      break
    }
  }
  
  // Check for keyboard patterns
  if (password.toLowerCase().includes('qwerty') || 
      password.toLowerCase().includes('asdf') ||
      password.toLowerCase().includes('zxcv')) {
    issues.push('Contains keyboard patterns')
  }
  
  // Check for repeated words
  const words = password.toLowerCase().match(/[a-z]{3,}/g) || []
  for (const word of words) {
    if (password.toLowerCase().split(word).length - 1 > 1) {
      issues.push('Contains repeated words')
      break
    }
  }
  
  return issues
}

// Calculate password entropy and strength
function calculatePasswordStrength(password: string, policy: PasswordPolicy): PasswordStrength {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length < policy.minLength) {
    feedback.push(`Password must be at least ${policy.minLength} characters long`)
  } else {
    score += Math.min(2, Math.floor(password.length / 6)) // 0-2 points for length
  }
  
  // Character variety checks
  let charsetSize = 0
  
  if (policy.requireLowercase) {
    if (/[a-z]/.test(password)) {
      charsetSize += 26
      score += 0.5
    } else {
      feedback.push('Password must contain lowercase letters')
    }
  }
  
  if (policy.requireUppercase) {
    if (/[A-Z]/.test(password)) {
      charsetSize += 26
      score += 0.5
    } else {
      feedback.push('Password must contain uppercase letters')
    }
  }
  
  if (policy.requireNumbers) {
    if (/[0-9]/.test(password)) {
      charsetSize += 10
      score += 0.5
    } else {
      feedback.push('Password must contain numbers')
    }
  }
  
  if (policy.requireSpecialChars) {
    if (/[^a-zA-Z0-9]/.test(password)) {
      charsetSize += 32 // Common special characters
      score += 0.5
    } else {
      feedback.push('Password must contain special characters (!@#$%^&*)')
    }
  }
  
  // Check for common patterns
  if (policy.forbidCommonPatterns) {
    const patternIssues = hasCommonPatterns(password)
    if (patternIssues.length > 0) {
      feedback.push(...patternIssues)
      score -= 1
    } else {
      score += 0.5
    }
  }
  
  // Calculate entropy and time to crack
  const entropy = Math.log2(Math.pow(charsetSize, password.length))
  let timeToCrack = 'Unknown'
  
  if (entropy > 0) {
    const secondsToCrack = Math.pow(2, entropy - 1) / 1e9 // Assume 1 billion guesses per second
    
    if (secondsToCrack < 60) {
      timeToCrack = 'Less than 1 minute'
    } else if (secondsToCrack < 3600) {
      timeToCrack = `${Math.ceil(secondsToCrack / 60)} minutes`
    } else if (secondsToCrack < 86400) {
      timeToCrack = `${Math.ceil(secondsToCrack / 3600)} hours`
    } else if (secondsToCrack < 31536000) {
      timeToCrack = `${Math.ceil(secondsToCrack / 86400)} days`
    } else if (secondsToCrack < 31536000000) {
      timeToCrack = `${Math.ceil(secondsToCrack / 31536000)} years`
    } else {
      timeToCrack = 'Centuries'
    }
  }
  
  // Clamp score between 0-4
  score = Math.max(0, Math.min(4, score))
  
  // Check if password meets all requirements
  const isValid = feedback.length === 0
  
  // Add positive feedback for strong passwords
  if (isValid) {
    if (score >= 4) {
      feedback.push('Excellent! Very strong password')
    } else if (score >= 3) {
      feedback.push('Good! Strong password')
    } else if (score >= 2) {
      feedback.push('Fair password strength')
    }
  }
  
  return {
    score,
    feedback,
    isValid,
    timeToCrack
  }
}

// Check password against HaveIBeenPwned database
export async function checkPasswordBreach(password: string): Promise<{ 
  isBreached: boolean; 
  breachCount: number; 
  error?: string 
}> {
  try {
    // Use SHA-1 hash with k-anonymity (only send first 5 chars of hash)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = new Uint8Array(hashBuffer)
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
    
    const prefix = hashHex.substring(0, 5)
    const suffix = hashHex.substring(5)
    
    // Query HaveIBeenPwned API with k-anonymity
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'TechOblivion-PasswordChecker/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    
    for (const line of lines) {
      const [hashSuffix, count] = line.trim().split(':')
      if (hashSuffix === suffix) {
        return {
          isBreached: true,
          breachCount: parseInt(count, 10) || 0
        }
      }
    }
    
    return {
      isBreached: false,
      breachCount: 0
    }
  } catch (error) {
    console.error('Password breach check failed:', error)
    return {
      isBreached: false,
      breachCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Main password validation function
export async function validatePassword(
  password: string, 
  policy: PasswordPolicy = STRONG_PASSWORD_POLICY
): Promise<PasswordStrength & { breachInfo?: { isBreached: boolean; breachCount: number } }> {
  const strength = calculatePasswordStrength(password, policy)
  
  // Check for breaches if policy requires it
  if (policy.checkHaveIBeenPwned && strength.isValid) {
    try {
      const breachInfo = await checkPasswordBreach(password)
      
      if (breachInfo.isBreached) {
        strength.isValid = false
        strength.feedback.unshift(
          `This password has been found in ${breachInfo.breachCount.toLocaleString()} data breaches. Please choose a different password.`
        )
        strength.score = Math.max(0, strength.score - 2)
      }
      
      return { ...strength, breachInfo }
    } catch (error) {
      console.error('Breach check failed:', error)
      // Continue without breach check if API is unavailable
    }
  }
  
  return strength
}

// Generate secure password suggestion
export function generateSecurePassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + specialChars
  const mandatoryChars = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ]
  
  let password = mandatoryChars.join('')
  
  // Fill remaining length with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}