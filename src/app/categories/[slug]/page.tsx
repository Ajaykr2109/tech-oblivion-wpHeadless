import React, { Suspense } from 'react'
import { Search } from 'lucide-react'

import CategoryFeed from '@/components/category-feed'
import FeedSkeleton from '@/components/feed-skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { safeFetchJSON } from '@/lib/safe-fetch'

export const revalidate = 300
export const dynamic = 'force-static'

export async function generateStaticParams() {
	try {
		const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000'
		type Cat = { slug: string; count: number }
		const categories = await safeFetchJSON<Cat[]>(`${origin}/api/wp/categories`, { next: { revalidate: 3600 } })
		return (categories || [])
			.filter((cat: { count: number }) => cat.count > 0)
			.slice(0, 10)
			.map((cat: { slug: string }) => ({ slug: cat.slug }))
	} catch (error) {
		console.warn('Error generating static params for categories:', error)
		return []
	}
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold tracking-tight">Category: <span className="capitalize">{slug.replace(/-/g, ' ')}</span></h1>
				<p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
					Browsing all articles filed under this category.
				</p>
			</div>

			<div className="mb-8 p-4 border rounded-lg bg-card/50">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
					<div className="md:col-span-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input placeholder="Search within this category..." className="pl-10" />
						</div>
					</div>
					<Select>
						<SelectTrigger>
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="latest">Latest</SelectItem>
							<SelectItem value="oldest">Oldest</SelectItem>
							<SelectItem value="popular">Popular</SelectItem>
						</SelectContent>
					</Select>
					<Button className="w-full">Apply Filters</Button>
				</div>
			</div>

			<Suspense fallback={<FeedSkeleton layout="grid" count={6} />}>
				<CategoryFeed layout="grid" postCount={12} categorySlug={slug} />
			</Suspense>
		</div>
	)
}