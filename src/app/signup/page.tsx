"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TermsModal } from '@/components/auth/TermsModal'
import { SectionDivider } from '@/components/auth/SectionDivider'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'
import { CollapsibleSection } from '@/components/auth/CollapsibleSection'

interface FormData {
  email: string
  username: string
  display_name: string
  password: string
  confirm_password: string
  gender: string
  date_of_birth: string
  terms_accepted: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [csrf, setCsrf] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    display_name: '',
    password: '',
    confirm_password: '',
    gender: '',
    date_of_birth: '',
    terms_accepted: false
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          // User is already logged in, redirect to homepage
          window.location.href = '/'
          return
        }
      } catch {
        // Not logged in, continue to show signup form
      } finally {
        setCheckingAuth(false)
      }
    }

    // Ensure CSRF token exists
    const ensureCsrf = async () => {
      try {
        const existing = getCsrfCookie()
        if (existing) {
          setCsrf(existing)
          return
        }
        const res = await fetch('/api/csrf')
        if (res.ok) {
          const j = await res.json()
          setCsrf(j.token)
        }
      } catch {
        // Ignore CSRF fetch errors - will retry on form submission
      }
    }

    ensureCsrf()
    checkAuth()
  }, [])

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
        return ''
      
      case 'username':
        if (!value) return 'Username is required'
        if (value.length < 3) return 'Username must be at least 3 characters'
        if (value.length > 50) return 'Username must be less than 50 characters'
        if (!/^[a-z0-9_]+$/.test(value.toLowerCase())) return 'Username can only contain letters, numbers, and underscores'
        return ''
      
      case 'display_name':
        if (!value) return 'Display name is required'
        if (value.length < 2) return 'Display name must be at least 2 characters'
        return ''
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return ''
      
      case 'confirm_password':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      
      case 'date_of_birth':
        if (value) {
          const dob = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - dob.getFullYear()
          const monthDiff = today.getMonth() - dob.getMonth()
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            // Haven't reached birthday this year
          }
          
          if (age < 13) return 'You must be at least 13 years old'
        }
        return ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (typeof value === 'string') {
      const fieldError = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: fieldError }))
      
      // Also revalidate confirm_password when password changes
      if (name === 'password' && formData.confirm_password) {
        const confirmError = validateField('confirm_password', formData.confirm_password)
        setErrors(prev => ({ ...prev, confirm_password: confirmError }))
      }
    }
  }

  const isFormValid = () => {
    const requiredFields = ['email', 'username', 'display_name', 'password', 'confirm_password']
    const hasErrors = Object.values(errors).some(error => error !== '')
    const hasEmptyRequired = requiredFields.some(field => !formData[field as keyof FormData])
    
    return !hasErrors && !hasEmptyRequired && formData.terms_accepted
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'terms_accepted' && key !== 'gender') {
        const error = validateField(key, formData[key as keyof FormData] as string)
        if (error) newErrors[key] = error
      }
    })

    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must agree to the Terms of Service and Privacy Policy'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the errors below')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/register', { 
        method: 'POST', 
        headers: { 
          'content-type': 'application/json', 
          'x-csrf-token': csrf || getCsrfCookie() 
        }, 
        body: JSON.stringify({
          email: formData.email,
          username: formData.username.toLowerCase(),
          display_name: formData.display_name,
          password: formData.password,
          gender: formData.gender || undefined,
          date_of_birth: formData.date_of_birth || undefined
        }) 
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      setSuccess(true)
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  const getCsrfCookie = () => {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid() && !isLoading) {
      e.preventDefault()
      const syntheticEvent = e as unknown as React.FormEvent
      onSubmit(syntheticEvent)
    }
  }

  // Show loading while checking if user is already authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-0px)] bg-gradient-to-b from-background to-background/80 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Welcome to Tech Oblivion!</CardTitle>
            <CardDescription>Your account has been created successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You can now sign in with your credentials and start exploring our content.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Sign In Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-gradient-to-b from-background to-background/80 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" asChild>
          <Link href="/" aria-label="Back to tech.oblivion">← Back to tech.oblivion</Link>
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl shadow-xl border bg-card/80 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Join oblivion</span>
          </CardTitle>
          <CardDescription className="mt-1">Create your account to start your journey</CardDescription>
        </CardHeader>
        
        <CardContent onKeyDown={handleKeyDown}>
          {error && (
            <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Account Information Section */}
            <SectionDivider label="Account Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com" 
                  autoComplete="email" 
                  required 
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username" 
                  name="username" 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                  placeholder="your_username" 
                  autoComplete="username" 
                  required 
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input 
                id="display_name" 
                name="display_name" 
                type="text" 
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Your friendly name" 
                autoComplete="name" 
                required 
              />
              {errors.display_name && <p className="text-sm text-red-500">{errors.display_name}</p>}
            </div>

            {/* Security Section */}
            <SectionDivider label="Security" />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="new-password" 
                  required 
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                
                {formData.password && (
                  <PasswordStrengthMeter password={formData.password} className="mt-3" />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input 
                  id="confirm_password" 
                  name="confirm_password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  autoComplete="new-password" 
                  required 
                />
                {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show_password" 
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked === true)}
                />
                <Label htmlFor="show_password" className="text-sm">Show passwords</Label>
              </div>
            </div>

            {/* Optional Profile Details */}
            <CollapsibleSection 
              title="Add profile details" 
              description="Optional information to personalize your experience"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input 
                    id="date_of_birth" 
                    name="date_of_birth" 
                    type="date" 
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    max={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                  />
                  {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>

            {/* Terms and Privacy */}
            <SectionDivider label="Legal" />
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms_accepted" 
                  checked={formData.terms_accepted}
                  onCheckedChange={(checked) => handleInputChange('terms_accepted', checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="terms_accepted" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <TermsModal 
                      trigger={
                        <button type="button" className="underline text-primary hover:text-primary/80">
                          Terms of Service and Privacy Policy
                        </button>
                      } 
                    />
                  </Label>
                  {errors.terms_accepted && <p className="text-sm text-red-500">{errors.terms_accepted}</p>}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!isFormValid() || isLoading} 
              aria-busy={isLoading}
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
