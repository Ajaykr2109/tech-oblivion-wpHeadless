
export type Post = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  imageUrl: string;
  imageHint: string;
  excerpt: string;
  slug: string;
  date: string;
};

export const dummyPosts: Post[] = [
  {
    id: "1",
    title: "The Future of AI in Web Development",
    author: "Jane Doe",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    imageUrl: "https://picsum.photos/800/600?random=1",
    imageHint: "AI technology",
    excerpt: "Discover how artificial intelligence is revolutionizing the way we build and interact with websites.",
    slug: "future-of-ai-in-web-dev",
    date: "2024-07-28",
  },
  {
    id: "2",
    title: "A Deep Dive into React Server Components",
    author: "John Smith",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
    imageUrl: "https://picsum.photos/800/600?random=2",
    imageHint: "server code",
    excerpt: "Exploring the latest advancements in React and how server components are changing the game.",
    slug: "react-server-components-deep-dive",
    date: "2024-07-27",
  },
  {
    id: "3",
    title: "Mastering Tailwind CSS for Modern UIs",
    author: "Emily White",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d",
    imageUrl: "https://picsum.photos/800/600?random=3",
    imageHint: "modern design",
    excerpt: "Tips and tricks for leveraging Tailwind CSS to create beautiful and responsive user interfaces.",
    slug: "mastering-tailwind-css",
    date: "2024-07-26",
  },
  {
    id: "4",
    title: "Getting Started with Next.js 14",
    author: "Chris Green",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d",
    imageUrl: "https://picsum.photos/800/600?random=4",
    imageHint: "web framework",
    excerpt: "A comprehensive guide to setting up your first project with the latest version of Next.js.",
    slug: "getting-started-with-nextjs-14",
    date: "2024-07-25",
  },
  {
    id: "5",
    title: "The Rise of Genkit for AI Applications",
    author: "Sarah Brown",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d",
    imageUrl: "https://picsum.photos/800/600?random=5",
    imageHint: "AI development",
    excerpt: "An overview of Genkit and how it simplifies building powerful, production-ready AI apps.",
    slug: "rise-of-genkit",
    date: "2024-07-24",
  },
  {
    id: "6",
    title: "Optimizing Your Site for Core Web Vitals",
    author: "Michael Black",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026709d",
    imageUrl: "https://picsum.photos/800/600?random=6",
    imageHint: "website performance",
    excerpt: "Practical advice for improving your website's performance and user experience metrics.",
    slug: "optimizing-core-web-vitals",
    date: "2024-07-23",
  },
];
