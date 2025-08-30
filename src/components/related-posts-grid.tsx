import Feed from "@/components/feed"

export async function RelatedPostsGrid() {
  // Reuse Feed to keep visuals consistent; in a real impl, you might filter by categories/tags
  return (
    <section aria-labelledby="related-posts">
      <h2 id="related-posts" className="text-2xl font-bold mb-4">Recommended for you</h2>
      <Feed layout="grid" postCount={3} />
    </section>
  )
}
