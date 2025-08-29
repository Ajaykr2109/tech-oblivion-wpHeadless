import Feed from "@/components/feed";
import { Button } from "@/components/ui/button";
import { PlayCircle, Rss, BookOpen, Send } from "lucide-react";
import { Marquee } from "@/components/marquee";

export default async function Home() {
  const summary = 'Latest updates from our blog.'

  // get first recent post for hero image
  // Fetch the latest video from the YouTube RSS feed
  let latestVideoEmbedUrl: string | null = null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const rssResponse = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UC_f3tV18-R4k5E9l3i6x8A', {
      // Cache this for 15 minutes to avoid slowing down TTFB on every request
      next: { revalidate: 900 },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (rssResponse.ok) {
      const rssText = await rssResponse.text()
      // Prefer <yt:videoId> as it's cheap to parse
      const m = rssText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const id = m?.[1]
      if (id) latestVideoEmbedUrl = `https://www.youtube.com/embed/${id}`
    }
  } catch (error)
 {
    console.error('Error fetching YouTube RSS feed:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center pt-8 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to tech.oblivion</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">Technology with purpose</p>
      </section>

      <div className="bg-card/50 rounded-lg shadow-lg p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-12">
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-semibold">Recent Updates</h2>
            <div className="border rounded-lg p-2 h-10 overflow-hidden flex items-center bg-background/50">
              <span className="text-sm font-semibold bg-primary text-primary-foreground rounded-md px-2 py-1 mr-4 shrink-0">Live</span>
              <Marquee>
                <span>{summary}</span>
              </Marquee>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
              {latestVideoEmbedUrl ? (
                <iframe
                  src={latestVideoEmbedUrl}
                  title="Latest YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button variant="outline" size="lg" asChild><a href="https://discord.gg/gMz8jgA9SC" target="_blank" rel="noopener noreferrer"><Send className="mr-2 h-4 w-4" /> Join Discord</a></Button>
              <Button variant="outline" size="lg" asChild><a href="/blog"><BookOpen className="mr-2 h-4 w-4" /> Read Blog</a></Button>
              <Button variant="outline" size="lg" asChild><a href="https://www.youtube.com/@tech.oblivion" target="_blank" rel="noopener noreferrer"><Rss className="mr-2 h-4 w-4" /> YouTube Channel</a></Button>
            </div>
          </div>
          <div className="flex flex-col space-y-6 h-full">
            <h2 className="text-2xl font-semibold">Recent Posts</h2>
            <div className="flex-grow">
              <Feed layout="list" postCount={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
