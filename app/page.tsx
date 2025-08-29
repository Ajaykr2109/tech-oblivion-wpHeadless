import Feed from "@/components/feed";
import { Button } from "@/components/ui/button";
import { PlayCircle, Rss, BookOpen, Send, Edit } from "lucide-react";
import { Marquee } from "@/components/marquee";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

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

      <div className="bg-card/50 rounded-lg shadow-lg p-6 md:p-8 mb-16">
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

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Posts</h2>
        <Feed layout="grid" postCount={3} />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Most Popular</h2>
        <Feed layout="grid" postCount={3} />
      </section>

      <section className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is tech.oblivion about?</AccordionTrigger>
            <AccordionContent>
              tech.oblivion is a platform dedicated to exploring the future of technology, with a focus on web development, artificial intelligence, and purposeful innovation. We share articles, tutorials, and insights to help developers and tech enthusiasts stay ahead of the curve.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How can I contribute an article?</AccordionTrigger>
            <AccordionContent>
              We're always looking for talented writers to share their expertise! If you're interested in becoming an open author, please check out our "Become an Author" section below and get in touch with us.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Do you have a community I can join?</AccordionTrigger>
            <AccordionContent>
              Yes! We have a Discord server where you can connect with other developers, ask questions, and discuss the latest trends in technology. You can find the link in the header and footer of our site.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger>How often is new content published?</AccordionTrigger>
            <AccordionContent>
              We aim to publish new articles and videos weekly. Follow us on our social channels or subscribe to our newsletter to stay updated with the latest content.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Become an Open Author</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Have an idea or a project you want to share with the community? We are looking for passionate developers and writers to contribute to tech.oblivion.
        </p>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">Get Started <Edit className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>

    </div>
  )
}
