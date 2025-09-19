import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Profile header skeleton */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center gap-6 md:flex-row md:text-left">
            {/* Avatar skeleton */}
            <Skeleton className="h-28 w-28 rounded-full" />
            
            <div className="flex-1">
              {/* Name skeleton */}
              <Skeleton className="h-8 w-48 mb-2" />
              
              {/* Role skeleton */}
              <Skeleton className="h-4 w-32 mb-1" />
              
              {/* Username skeleton */}
              <Skeleton className="h-4 w-24 mb-3" />
              
              {/* Bio skeleton */}
              <div className="space-y-2 max-w-2xl">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              {/* Actions and social links skeleton */}
              <div className="mt-4 flex items-center gap-6 flex-wrap">
                <Skeleton className="h-10 w-32" /> {/* Edit profile button */}
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-muted rounded-md w-fit">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="transition hover:shadow-md">
            <div className="p-6">
              {/* Article title skeleton */}
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              
              {/* Date skeleton */}
              <Skeleton className="h-4 w-24 mb-4" />
              
              {/* Excerpt skeleton */}
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              {/* Read more link skeleton */}
              <Skeleton className="h-4 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}