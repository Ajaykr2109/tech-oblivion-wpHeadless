import Link from 'next/link'
import { ExternalLink, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewPostEditPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Post Editor</CardTitle>
          <CardDescription>
            Create and edit your posts using our dedicated editor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Full Editor Available</h3>
              <p className="text-muted-foreground mb-4">
                Use our comprehensive post editor to create and manage your content.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/editor/new">
                    <Edit className="mr-2 h-4 w-4" />
                    Create New Post
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/posts">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage Posts
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
