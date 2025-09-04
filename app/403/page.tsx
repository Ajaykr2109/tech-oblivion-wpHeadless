import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      
      <p className="text-lg text-muted-foreground mb-6 max-w-md">
        You don't have permission to access this page. Please contact an administrator 
        if you believe this is an error.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          If you need editor access, please contact an administrator to upgrade your account.
        </p>
      </div>
    </div>
  )
}
