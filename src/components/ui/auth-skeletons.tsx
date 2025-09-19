import { Skeleton } from '@/components/ui/skeleton'

export function AuthButtonSkeleton() {
  return <Skeleton className="h-9 w-20" />
}

export function CommentActionsSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-7 w-12" />
    </div>
  )
}

export function UserMenuSkeleton() {
  return <Skeleton className="h-9 w-24" />
}

export function AdminMenuSkeleton() {
  return <Skeleton className="h-5 w-16" />
}

export function AuthLoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}