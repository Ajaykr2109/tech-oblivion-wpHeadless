import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AboutPage() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-2xl animate-fade-in">
      <div className="flex flex-col items-center bg-card/60 rounded-xl shadow-lg p-8 mb-8">
        <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/30">
          <AvatarImage src="https://avatars.githubusercontent.com/u/10296482?v=4" alt="Ajay Chaturvedi" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-1 text-center">Ajay Chaturvedi</h1>
        <p className="text-muted-foreground mb-4 text-center">Founder, TechOblivion</p>
        <p className="mb-6 text-lg text-center">I’m Ajay, passionate about technology and problem-solving. Through <span className="font-semibold">TechOblivion</span>, I share my journey, projects, and ideas to inspire and build together.</p>
        <div className="flex flex-wrap justify-center gap-3 mb-2">
          <a href="https://techoblivion.in/" className="btn-link" target="_blank" rel="noopener noreferrer">🌐 Website</a>
          <a href="https://github.com/Ajaykr2109" className="btn-link" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.facebook.com/ajaykrchaturvedi/" className="btn-link" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://x.com/ChaturvediKrAj" className="btn-link" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a href="https://www.linkedin.com/in/ajaykrchaturvedi/" className="btn-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.youtube.com/@tech.oblivion" className="btn-link" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </div>
      <div className="bg-muted/40 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">About TechOblivion</h2>
        <p className="mb-2">TechOblivion is a platform dedicated to sharing knowledge, projects, and inspiration in technology. Whether you’re a developer, enthusiast, or just curious, you’ll find something to spark your interest.</p>
        <ul className="list-disc list-inside text-muted-foreground mb-2">
          <li>Project showcases & tutorials</li>
          <li>Tech blogs & insights</li>
          <li>Community-driven learning</li>
        </ul>
        <p className="text-sm text-muted-foreground">© 2025 Tech Oblivion. All Rights Reserved.</p>
      </div>
    </section>
  );
}
