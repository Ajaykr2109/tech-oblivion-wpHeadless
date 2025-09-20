import React from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
}

const criteria: PasswordCriteria[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const passedCriteria = criteria.filter(criterion => criterion.test(password))
  const strength = passedCriteria.length
  
  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-orange-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength <= 1) return 'Very Weak'
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  if (!password) return null

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={cn(
            'text-sm font-medium',
            strength <= 1 && 'text-red-500',
            strength === 2 && 'text-orange-500',
            strength === 3 && 'text-yellow-500',
            strength === 4 && 'text-blue-500',
            strength === 5 && 'text-green-500'
          )}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              getStrengthColor()
            )}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-1">
        {criteria.map((criterion, index) => {
          const passed = criterion.test(password)
          return (
            <div key={index} className="flex items-center gap-2">
              {passed ? (
                <Check size={14} className="text-green-500 flex-shrink-0" />
              ) : (
                <X size={14} className="text-gray-400 flex-shrink-0" />
              )}
              <span className={cn(
                'text-sm',
                passed ? 'text-green-700 dark:text-green-400' : 'text-gray-500'
              )}>
                {criterion.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}