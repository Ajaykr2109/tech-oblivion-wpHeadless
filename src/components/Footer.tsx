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
              <a href="https://discord.gg/gMz8jgA9SC" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Send /></a>
              <a href="https://www.youtube.com/@tech.oblivion" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Rss /></a>
              <a href="/blog" className="text-muted-foreground hover:text-foreground"><BookOpen /></a>
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
