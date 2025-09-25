'use client'

import React, { useState, useEffect } from 'react'

import { validatePassword, type PasswordStrength, STRONG_PASSWORD_POLICY } from '@/lib/password-policy'
import { Progress } from '@/components/ui/progress'

interface PasswordStrengthIndicatorProps {
  password: string
  onValidationChange?: (isValid: boolean, strength: PasswordStrength) => void
  className?: string
}

export default function PasswordStrengthIndicator({ 
  password, 
  onValidationChange,
  className = ''
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
    timeToCrack: 'Unknown'
  })
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!password) {
      const emptyStrength = {
        score: 0,
        feedback: [],
        isValid: false,
        timeToCrack: 'Unknown'
      }
      setStrength(emptyStrength)
      onValidationChange?.(false, emptyStrength)
      return
    }

    const checkPassword = async () => {
      setIsChecking(true)
      try {
        const result = await validatePassword(password, STRONG_PASSWORD_POLICY)
        setStrength(result)
        onValidationChange?.(result.isValid, result)
      } catch (error) {
        console.error('Password validation error:', error)
        const errorStrength = {
          score: 0,
          feedback: ['Unable to validate password'],
          isValid: false,
          timeToCrack: 'Unknown'
        }
        setStrength(errorStrength)
        onValidationChange?.(false, errorStrength)
      } finally {
        setIsChecking(false)
      }
    }

    // Debounce password checking
    const timeoutId = setTimeout(checkPassword, 300)
    return () => clearTimeout(timeoutId)
  }, [password, onValidationChange])

  const getStrengthColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400'
    if (score >= 3) return 'text-blue-600 dark:text-blue-400'
    if (score >= 2) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 1) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getStrengthLabel = (score: number) => {
    if (score >= 4) return 'Very Strong'
    if (score >= 3) return 'Strong'
    if (score >= 2) return 'Fair'
    if (score >= 1) return 'Weak'
    return 'Very Weak'
  }

  const getProgressColor = (score: number) => {
    if (score >= 4) return 'bg-green-500'
    if (score >= 3) return 'bg-blue-500'
    if (score >= 2) return 'bg-yellow-500'
    if (score >= 1) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (!password) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Password Strength</span>
          <span className={getStrengthColor(strength.score)}>
            {isChecking ? 'Checking...' : getStrengthLabel(strength.score)}
          </span>
        </div>
        <Progress 
          value={(strength.score / 4) * 100} 
          className="h-2"
          style={{
            backgroundColor: 'var(--muted)',
          }}
        />
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(strength.score)}`}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>

      {/* Time to Crack */}
      {strength.timeToCrack && strength.timeToCrack !== 'Unknown' && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Estimated time to crack: <span className="font-medium">{strength.timeToCrack}</span>
        </div>
      )}

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <ul className="space-y-1 text-sm">
          {strength.feedback.map((message, index) => (
            <li 
              key={index} 
              className={`flex items-start gap-2 ${
                message.includes('Excellent') || message.includes('Good') 
                  ? 'text-green-600 dark:text-green-400' 
                  : message.includes('breaches') || message.includes('must') || message.includes('Contains')
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              <span className="mt-1 text-xs">
                {message.includes('Excellent') || message.includes('Good') ? '✓' : '•'}
              </span>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Requirements Checklist */}
      <div className="text-xs space-y-1 text-gray-500 dark:text-gray-400">
        <div className="font-medium">Requirements:</div>
        <div className="grid grid-cols-2 gap-1">
          <span className={password.length >= 12 ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ 12+ characters
          </span>
          <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ Uppercase letter
          </span>
          <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ Lowercase letter
          </span>
          <span className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ Number
          </span>
          <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ Special character
          </span>
          <span className={!isChecking && strength.score > 0 ? 'text-green-600 dark:text-green-400' : ''}>
            ✓ No common patterns
          </span>
        </div>
      </div>
    </div>
  )
}