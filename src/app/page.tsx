import Feed from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { PlayCircle, Rss, BookOpen, Send, Edit } from "lucide-react";
import { Marquee } from "@/components/marquee";

export default async function Home() {
  const summary = 'Latest updates from our blog.'

  // Fetch the latest video from the YouTube RSS feed
  let latestVideoEmbedUrl: string | null = null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const rssResponse = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UC_f3tV18-R4k5E9l3i6x8A', {
      next: { revalidate: 900 },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (rssResponse.ok) {
      const rssText = await rssResponse.text()
      const m = rssText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const id = m?.[1]
      if (id) latestVideoEmbedUrl = `https://www.youtube.com/embed/${id}`
    }
  } catch {
    // ignore RSS errors for faster TTFB
  }

  return (
    <div className="container mx-auto px-4 pt-4 pb-10">
      <section className="text-center pt-4 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">Welcome to tech.oblivion</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-1">Technology with purpose</p>
      </section>

      {/* Recent Updates + Recent Posts side-by-side, equal height */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-8 mb-10">
        {/* Recent Updates */}
        <div className="flex flex-col space-y-6 min-h-0 h-full">
          <h2 className="text-2xl font-semibold">Recent Updates</h2>
          <div className="border rounded-lg p-2 h-10 overflow-hidden flex items-center">
            <span className="text-sm font-semibold bg-primary text-primary-foreground rounded-md px-2 py-1 mr-4 shrink-0">Live</span>
            <Marquee>
              <span>{summary}</span>
            </Marquee>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {latestVideoEmbedUrl ? (
              <iframe
                src={latestVideoEmbedUrl}
                title="Latest YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Button variant="default" size="lg" className="btn-gradient-hover" asChild>
              <a href="https://discord.gg/gMz8jgA9SC" target="_blank" rel="noopener noreferrer"><Send className="mr-2 h-4 w-4" /> Join Discord</a>
            </Button>
            <Button variant="outline" size="lg" className="btn-gradient-hover-outline" asChild>
              <a href="/blog"><BookOpen className="mr-2 h-4 w-4" /> Read Blog</a>
            </Button>
            <Button variant="outline" size="lg" className="btn-gradient-hover-outline" asChild>
              <a href="https://www.youtube.com/@tech.oblivion" target="_blank" rel="noopener noreferrer"><Rss className="mr-2 h-4 w-4" /> YouTube Channel</a>
            </Button>
          </div>
        </div>

        {/* Recent Posts - fills height */}
        <div className="h-full flex flex-col space-y-6 min-h-0">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          {/* Render up to 4; CSS hides 4th by default. Use .show-4 on container if you want to reveal it intentionally. */}
          <div className="feed-conditional-4 flex-1 flex flex-col">
            <Feed layout="list" postCount={4} />
          </div>
        </div>
      </div>

      {/* Horizontal separator before additional sections */}
      <Separator className="my-12" />

      {/* Featured Posts */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 heading-accent">Featured Posts</h2>
        <Feed layout="grid" postCount={3} />
      </section>

      {/* Most Popular */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 heading-accent">Most Popular</h2>
        <Feed layout="grid" postCount={3} />
      </section>

      {/* FAQ */}
      <section className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 heading-accent">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is tech.oblivion about?</AccordionTrigger>
            <AccordionContent>
              tech.oblivion explores purposeful tech: modern web, AI, and practical engineering. We publish articles, tutorials, and deep-dives.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How can I contribute an article?</AccordionTrigger>
            <AccordionContent>
              We welcome open authors. Reach out via the contact page to get access and guidelines.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Do you have a community?</AccordionTrigger>
            <AccordionContent>
              Yes—join our Discord to connect, ask questions, and share projects.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How often do you publish?</AccordionTrigger>
            <AccordionContent>
              Weekly cadence. Follow the blog or YouTube channel to stay updated.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mb-4 bg-card/50 rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Become an Open Author</h2>
        <p className="max-w-2xl mx-auto mb-6 text-muted-foreground">
          Have an idea to share with the community? We’re looking for passionate developers and writers.
        </p>
        <Button size="lg" className="btn-gradient-hover" asChild>
          <Link href="/contact">Get Started <Edit className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>
    </div>
  )
}
