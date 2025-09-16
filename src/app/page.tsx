import Head from "next/head"
import Link from "next/link"
import { Send, BookOpen, Rss, Edit, ArrowRight, Users, TrendingUp, Zap, Coffee, Clock } from "lucide-react"

import Feed from "@/components/feed"
import EditorPicksFeed from "@/components/editor-picks-feed"
import { getWebSiteSchema, getFAQSchema } from "@/lib/generateSchema"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import HomeLatestVideoSection from "@/components/HomeLatestVideoSection"

export default function Home() {
  const _summary = 'Latest updates from our blog.'
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
      <main className="min-h-screen">
        {/* HERO SECTION - FOCUSED ON BLOGGING */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8 text-sm font-medium text-primary">
                <Coffee className="h-4 w-4" />
                Tech Knowledge Hub
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                Learn, Share, and{" "}
                <span className="gradient-text">Grow Together</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                A vibrant community where developers, engineers, and tech enthusiasts share knowledge, 
                insights, and practical solutions to real-world challenges.
              </p>
              
              <div className="flex justify-center gap-4 flex-wrap mb-12">
                <Button size="lg" asChild>
                  <Link href="/blog" className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> 
                    Start Reading
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://discord.gg/gMz8jgA9SC" target="_blank" className="flex items-center">
                    <Send className="mr-2 h-4 w-4" /> 
                    Join Community
                  </a>
                </Button>
              </div>
              
              {/* Community stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Articles Published</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-sm text-muted-foreground">Monthly Readers</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">Contributors</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">Weekly</div>
                  <div className="text-sm text-muted-foreground">New Content</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          {/* LATEST CONTENT SECTION */}
          <section className="py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-6 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Fresh Content
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Latest from Our Community
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the newest insights, tutorials, and discussions from our community of experts.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Latest Video Tutorial</h3>
                    <p className="text-muted-foreground text-sm">Visual learning made easy</p>
                  </div>
                </div>
                <HomeLatestVideoSection />
              </div>
              
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Recent Articles</h3>
                    <p className="text-muted-foreground text-sm">Fresh insights and tutorials</p>
                  </div>
                </div>
                <Feed layout="list" postCount={3} />
              </div>
            </div>
          </section>

          <Separator className="my-12" />

          {/* FEATURED CONTENT */}
          <section className="py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-2 mb-6 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                Editor's Choice
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Handpicked Articles
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our editorial team selects the most valuable content to help you stay ahead in tech.
              </p>
            </div>
            <EditorPicksFeed layout="grid" fallbackCount={6} />
          </section>

          {/* COMMUNITY SECTION */}
          <section className="py-16">
            <div className="bg-secondary/20 rounded-2xl p-8 md:p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8 text-sm font-medium text-primary">
                  <Users className="h-4 w-4" />
                  Growing Community
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Join Thousands of Developers
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Connect with like-minded developers, share your knowledge, get help with challenges, 
                  and stay updated with the latest in technology.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-card border rounded-lg p-6">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Learn Daily</h3>
                    <p className="text-sm text-muted-foreground">Access fresh tutorials and insights every day</p>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Connect</h3>
                    <p className="text-sm text-muted-foreground">Network with developers from around the world</p>
                  </div>
                  <div className="bg-card border rounded-lg p-6">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Grow Skills</h3>
                    <p className="text-sm text-muted-foreground">Level up with practical, real-world solutions</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button size="lg" asChild>
                    <a href="https://discord.gg/gMz8jgA9SC" target="_blank" className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> 
                      Join Discord
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="https://www.youtube.com/@tech.oblivion" target="_blank" className="flex items-center">
                      <Rss className="mr-2 h-4 w-4" /> 
                      Subscribe to YouTube
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* CONTRIBUTE SECTION */}
          <section className="py-16">
            <div className="bg-card border rounded-2xl p-8 md:p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-6 text-sm font-medium">
                  <Edit className="h-4 w-4 text-primary" />
                  Share Your Knowledge
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Become a Contributor
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Have insights to share? Join our community of writers and help fellow developers 
                  learn and grow. Whether it's tutorials, case studies, or technical deep-dives.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Edit className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Write Articles</h3>
                    <p className="text-sm text-muted-foreground">Share tutorials, insights, and experiences</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Build Following</h3>
                    <p className="text-sm text-muted-foreground">Grow your reputation in the tech community</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Impact Others</h3>
                    <p className="text-sm text-muted-foreground">Help thousands of developers learn</p>
                  </div>
                </div>
                
                <Button size="lg" asChild>
                  <Link href="/contact" className="flex items-center">
                    Start Writing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}