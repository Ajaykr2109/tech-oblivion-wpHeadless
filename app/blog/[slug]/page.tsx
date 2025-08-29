
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar'
import { dummyPosts } from '@/data/dummy-posts'
import { Button } from '@/components/ui/button'
import { Edit, MessageCircle, ThumbsUp, Twitter, Linkedin, Github } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

// This function can remain as-is for now, as it's for SEO and doesn't block rendering.
// In a real app, this would fetch live data.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = dummyPosts.find(p => p.slug === params.slug)
  if (!post) {
    return { title: 'Post not found' }
  }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = dummyPosts.find(p => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  // Dummy content for demonstration
  const dummyContentHtml = `
    <p>This is the beginning of a beautiful blog post titled "${post.title}". The content here is a placeholder to demonstrate the page structure.</p>
    <h2>Understanding the Core Concept</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.</p>
    <pre><code class="language-javascript">
    // Example code block
    function greet(name) {
      console.log(\`Hello, \${name}!\`);
    }
    greet('World');
    </code></pre>
    <h3>Further Details</h3>
    <p>Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himaenaeos.</p>
    <ul>
      <li>First list item</li>
      <li>Second list item</li>
      <li>Third list item</li>
    </ul>
    <blockquote>Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.</blockquote>
  `;

  // Calculate reading time from dummy content
  const wordsPerMinute = 225;
  const wordCount = dummyContentHtml.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  const readingTime = `${readingTimeMinutes} min read`;

  // Dummy Table of Contents
  const tableOfContents = [
    { level: 2, text: "Understanding the Core Concept", slug: "understanding-the-core-concept" },
    { level: 3, text: "Further Details", slug: "further-details" },
  ];

  // In a real scenario, you'd parse dummyContentHtml to generate the TOC and apply highlighting.
  // For this template, we'll use the pre-formatted content.
  const highlightedContent = dummyContentHtml.replace(/<pre><code class="language-javascript">([\s\S]*?)<\/code><\/pre>/, (match, code) => {
    const highlighted = hljs.highlight(code, { language: 'javascript' }).value;
    return `<pre><code class="hljs language-javascript">${highlighted}</code></pre>`;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
                <Button variant="outline" asChild>
                    <Link href={`/editor/${post.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
            </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex justify-center items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>By {post.author}</span>
            </div>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="relative w-full max-w-4xl mx-auto mb-12">
             <Image
              src={post.imageUrl}
              alt={post.title}
              width={1024}
              height={576}
              className="rounded-lg object-cover w-full shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-shadow duration-300"
              priority
              data-ai-hint={post.imageHint}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 lg:sticky top-8 self-start hidden lg:block">
                 {tableOfContents.length > 0 && (
                    <div className="p-4 border-l-4 border-primary bg-secondary/50 rounded-r-lg">
                    <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
                    <ul className="space-y-2">
                        {tableOfContents.map((item) => (
                        <li key={item.slug} className={`text-sm level-${item.level} ${item.level > 2 ? 'pl-4' : ''}`}>
                            <a href={`#${item.slug}`} className="text-muted-foreground hover:text-foreground hover:underline">
                            {item.text}
                            </a>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
            </aside>

            <article className="lg:col-span-6">
                <div
                    className="prose dark:prose-invert max-w-none mx-auto [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-4 [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>img]:mx-auto [&>img]:max-w-full [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:bg-secondary/30 [&>blockquote]:rounded-r-lg"
                    dangerouslySetInnerHTML={{ __html: highlightedContent }}
                />
            </article>

            <aside className="lg:col-span-3 lg:sticky top-8 self-start">
                <div className="bg-card p-6 rounded-lg shadow-lg">
                    <RelatedPostsSidebar
                    currentPostId={Number(post.id)}
                    currentPostCategories={[]}
                    currentPostTags={[]}
                    />
                </div>
            </aside>
        </div>

        <Separator className="my-12" />

        <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 p-6 rounded-lg flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">WRITTEN BY</h3>
                    <h2 className="text-2xl font-bold mb-2">{post.author}</h2>
                    <p className="text-muted-foreground mb-4">Jane Doe is a senior software engineer specializing in frontend technologies and AI integration. She loves building beautiful, performant user interfaces.</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
                        <a href="#" className="text-muted-foreground hover:text-foreground"><Github /></a>
                    </div>
                </div>
            </div>
        </div>

        <Separator className="my-12" />

        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
                <Button variant="outline" size="lg">
                    <ThumbsUp className="mr-2 h-5 w-5" /> Like (123)
                </Button>
                <h2 className="text-2xl font-bold">Comments (3)</h2>
            </div>

            <div className="space-y-6">
                <form className="grid gap-4">
                    <Textarea placeholder="Write a comment..." rows={4} />
                    <Button className="justify-self-end">Post Comment</Button>
                </form>

                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">Alex Johnson</p>
                        <p className="text-sm text-muted-foreground">This was a great read, thanks for sharing!</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026703d" />
                        <AvatarFallback>MG</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">Maria Garcia</p>
                        <p className="text-sm text-muted-foreground">Very insightful. The code block was particularly helpful.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

    