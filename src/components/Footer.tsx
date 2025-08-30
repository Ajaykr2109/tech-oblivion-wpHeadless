import React from 'react';
import Link from 'next/link';
import { Send, Rss, BookOpen } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-bold text-lg mb-4">tech.oblivion</h3>
            <p className="text-muted-foreground">Technology with purpose. Exploring the future of web development and AI.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a aria-label="Join our Discord" href="https://discord.gg/gMz8jgA9SC" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                <Send className="h-4 w-4" /> <span className="sr-only">Discord</span>
              </a>
              <a aria-label="Subscribe to our channel" href="https://www.youtube.com/@tech.oblivion" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                <Rss className="h-4 w-4" /> <span className="sr-only">YouTube</span>
              </a>
              <a aria-label="Read our blog" href="/blog" className="inline-flex items-center gap-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1">
                <BookOpen className="h-4 w-4" /> <span className="sr-only">Blog</span>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-muted-foreground mt-8 border-t border-border pt-6">
          <p>&copy; {currentYear} tech.oblivion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
