"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TermsModalProps {
  trigger?: React.ReactNode
}

export function TermsModal({ trigger }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="p-0 h-auto underline text-sm">
            Terms & Privacy Policy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Terms of Service & Privacy Policy</DialogTitle>
          <DialogDescription>
            Please read our Terms of Service and Privacy Policy before creating your account.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Terms of Service Section */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Terms of Service
                <Link 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink size={16} />
                </Link>
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  By creating an account, you agree to our Terms of Service. You must be at least 13 years old to use our services.
                </p>
                <ul className="space-y-1">
                  <li>• Use our website only for lawful purposes</li>
                  <li>• Provide accurate information when creating your account</li>
                  <li>• Keep your login credentials secure</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow community guidelines when posting content</li>
                </ul>
              </div>
            </section>

            {/* Privacy Policy Section */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Privacy Policy
                <Link 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink size={16} />
                </Link>
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  We respect your privacy and are committed to protecting your personal information.
                </p>
                <h4 className="font-medium text-foreground mt-4 mb-2">Information We Collect:</h4>
                <ul className="space-y-1">
                  <li>• Account information (username, email, display name)</li>
                  <li>• Optional profile information (gender, date of birth)</li>
                  <li>• Usage data and analytics for improving our services</li>
                  <li>• Cookies for authentication and site functionality</li>
                </ul>
                
                <h4 className="font-medium text-foreground mt-4 mb-2">How We Use Your Information:</h4>
                <ul className="space-y-1">
                  <li>• To provide and improve our services</li>
                  <li>• To communicate with you about your account</li>
                  <li>• To personalize your experience</li>
                  <li>• To comply with legal obligations</li>
                </ul>

                <h4 className="font-medium text-foreground mt-4 mb-2">Your Rights:</h4>
                <ul className="space-y-1">
                  <li>• Access and update your personal information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Opt-out of non-essential communications</li>
                  <li>• Request data portability</li>
                </ul>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Data Protection</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  We implement appropriate security measures to protect your personal information. 
                  Your data is stored securely and is not shared with third parties except as 
                  described in our Privacy Policy.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
        <div className="p-6 pt-0 border-t">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}