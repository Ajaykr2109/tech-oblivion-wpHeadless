import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
        <p className="text-muted-foreground mt-2">
          Have a question, a project idea, or just want to say hi? I'd love to hear from you.
        </p>
      </div>
      <div className="bg-card/50 p-8 rounded-lg shadow-lg">
        <form className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="What's this about?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Your message..." rows={6} />
          </div>
          <Button type="button" size="lg" className="w-full">Send Message</Button>
        </form>
      </div>
    </div>
  )
}
