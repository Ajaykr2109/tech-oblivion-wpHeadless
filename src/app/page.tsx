import { Feed } from "@/components/feed";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlayCircle, Rss, BookOpen, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold">
          Welcome to tech.oblivion
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Technology with purpose
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-semibold">Live Now</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg group">
            <Image
              src="https://picsum.photos/1280/720"
              alt="Latest YouTube Video Thumbnail"
              width={1280}
              height={720}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="live stream technology"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" /> Join Discord
            </Button>
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" /> Read Blog
            </Button>
            <Button variant="outline">
              <Rss className="mr-2 h-4 w-4" /> YouTube Channel
            </Button>
          </div>
        </div>
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Feed />
        </div>
      </div>
    </div>
  );
}
