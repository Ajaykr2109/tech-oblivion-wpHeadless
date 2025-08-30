import Feed from "@/components/feed"
import Head from "next/head"
import { getWebSiteSchema, getVideoSchema, getFAQSchema } from "@/lib/generateSchema"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { PlayCircle, Send, BookOpen, Rss, Edit } from "lucide-react"
import HomeLatestVideoSection from "@/components/HomeLatestVideoSection"
import { Marquee } from "@/components/marquee"

export default function Home() {
  const summary = 'Latest updates from our blog.'
  // Example FAQ data; replace with real data if available
  const faqs = [
    { question: "What is Tech.Oblivion?", answer: "A modern tech blog and community for web, AI, and engineering." },
    { question: "How can I contribute?", answer: "Join as an author or participate in the community Discord." }
  ]

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebSiteSchema()) }}
        />
  {/* VideoObject schema can be injected in the client component if needed */}
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
          />
        )}
      </Head>
      <main className="container mx-auto px-4 pt-6 pb-16">
      {/* HERO */}
      <section className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Technology with Purpose
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Modern web, AI, and practical engineering. Insights that matter.
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button size="lg" asChild>
            <Link href="/blog"><BookOpen className="mr-2 h-4 w-4" /> Read Blog</Link>
          </Button>
          <Button size="lg" asChild>
            <a href="https://discord.gg/gMz8jgA9SC" target="_blank"><Send className="mr-2 h-4 w-4" /> Join Discord</a>
          </Button>
        </div>
      </section>

      {/* LATEST */}
      <section className="grid md:grid-cols-2 gap-8 items-stretch mb-14">
  <HomeLatestVideoSection />
        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-semibold">Latest Articles</h2>
          <Feed layout="list" postCount={3} />
        </div>
      </section>

      <Separator className="my-12" />

      {/* CONTENT HUBS */}
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-center mb-8">Editor’s Picks</h2>
        <Feed layout="grid" postCount={3} />
      </section>
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-center mb-8">Trending Now</h2>
        <Feed layout="grid" postCount={3} />
      </section>

      {/* COMMUNITY */}
      <section className="mb-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Connect with like-minded developers, share projects, and stay updated.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild><a href="https://discord.gg/gMz8jgA9SC" target="_blank"><Send className="mr-2 h-4 w-4" /> Discord</a></Button>
          <Button asChild><a href="https://www.youtube.com/@tech.oblivion" target="_blank"><Rss className="mr-2 h-4 w-4" /> YouTube</a></Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
        {/* keep Accordion, add FAQPage schema separately */}
      </section>

      {/* CTA */}
      <section className="bg-card/50 rounded-lg p-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Become an Open Author</h2>
        <p className="max-w-xl mx-auto mb-6 text-muted-foreground">
          Got an idea worth sharing? Join as a writer and inspire the community.
        </p>
        <Button size="lg" asChild>
          <Link href="/contact">Get Started <Edit className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>
    </main>
    </>
  )
}
