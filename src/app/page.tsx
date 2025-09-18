import Head from "next/head"
import Link from "next/link"
import { BookOpen, PenTool, TrendingUp, Star, Users, MessageCircle, ChevronRight } from "lucide-react"

import Feed from "@/components/feed"
import EditorPicksFeed from "@/components/editor-picks-feed"
import HomeLatestVideoSection from "@/components/HomeLatestVideoSection"
import { getWebSiteSchema, getFAQSchema } from "@/lib/generateSchema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const _summary = 'Latest updates from our blog.'
  // Example FAQ data; replace with real data if available
  const faqs = [
    { question: "What is Tech.Oblivion?", answer: "A modern tech blog and community for web, AI, and engineering." },
    { question: "How can I contribute?", answer: "Join as an author or participate in the community Discord." }
  ]

  // Popular categories for the blog
  const _popularCategories = [
    { name: "Technology", count: 45, color: "bg-blue-100 text-blue-800" },
    { name: "Programming", count: 38, color: "bg-purple-100 text-purple-800" },
    { name: "Tutorials", count: 32, color: "bg-green-100 text-green-800" },
    { name: "Reviews", count: 28, color: "bg-yellow-100 text-yellow-800" },
    { name: "Tips & Tricks", count: 25, color: "bg-cyan-100 text-cyan-800" },
    { name: "Industry News", count: 22, color: "bg-emerald-100 text-emerald-800" }
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
      <main className="min-h-screen" id="main-content">
        {/* TOP SECTION - VIDEO AND BLOGS */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-stretch">
              {/* Left Column - Latest Video */}
              <div id="latest-video" className="flex flex-col h-[400px] lg:h-[600px] overflow-hidden">
                <div className="flex items-center gap-3 mb-4 lg:mb-6 flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-semibold">Latest Video</h2>
                    <p className="text-muted-foreground text-sm">Watch our newest content</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <HomeLatestVideoSection />
                </div>
              </div>
              
              {/* Right Column - Recent Articles */}
              <div className="flex flex-col h-[400px] lg:h-[600px] overflow-hidden">
                <div className="flex items-center gap-3 mb-4 lg:mb-6 flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-semibold">Recent Articles</h2>
                    <p className="text-muted-foreground text-sm">Latest posts from our community</p>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Feed layout="simple" postCount={4} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
           {/* FEATURED CONTENT */}
          <section className="py-16 bg-secondary/30 rounded-2xl">
            <div className="px-6 md:px-8">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                  <Star className="h-3 w-3 mr-1" />
                  Editor's Choice
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Featured Articles
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Handpicked content that stands out for its quality and insights
                </p>
              </div>
              <EditorPicksFeed layout="grid" fallbackCount={3} />
            </div>
          </section>


          {/* ALL ARTICLES SECTION */}
          <section className="py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  All Articles
                </h2>
                <p className="text-lg text-muted-foreground">
                  Explore our complete collection of content
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/blog" className="flex items-center">
                  View All Posts
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <Feed layout="grid" postCount={6} />
          </section>

         

        

          {/* COMMUNITY CTA SECTION */}
          <section className="py-16">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/20 rounded-2xl p-8 md:p-12 text-center border border-border/50">
              <div className="max-w-3xl mx-auto">
                <Users className="h-12 w-12 text-primary mx-auto mb-6" />
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Join Our Community
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Connect with developers, share knowledge, and stay updated with the latest tech trends. 
                  Be part of a growing community passionate about technology.
                </p>
                
                <div className="flex justify-center gap-4 flex-wrap mb-8">
                  <Button size="lg" asChild>
                    <Link href="/register" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" /> 
                      Join Community
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact" className="flex items-center">
                      <PenTool className="mr-2 h-4 w-4" /> 
                      Start Writing
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Active Discussions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Weekly Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Growing Community</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}