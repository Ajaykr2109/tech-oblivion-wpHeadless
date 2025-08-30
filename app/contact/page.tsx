"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false)
  const email = 'info@techoblivion.in'
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="text-muted-foreground mt-2">Prefer email? Shoot me a message.</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-lg border bg-card/50 px-4 py-3">
          <div className="text-left">
            <div className="text-xs uppercase text-muted-foreground">Email</div>
            <div className="font-medium">{email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyEmail}>{copied ? 'Copied' : 'Copy'}</Button>
            <Button asChild size="sm"><a href={`mailto:${email}`}>Open mail app</a></Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">I usually respond within a day.</p>
      </div>
      <div className="bg-card/50 p-8 rounded-lg shadow-lg">
        <form className="grid gap-6" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const name = String(fd.get('name') || '');
          const fromEmail = String(fd.get('email') || '');
          const subject = String(fd.get('subject') || '');
          const message = String(fd.get('message') || '');
          const body = `${message}\n\n---\nFrom: ${name || 'Anonymous'}${fromEmail ? ` <${fromEmail}>` : ''}`;
          const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = url;
        }}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your.email@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="What's this about?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="Your message..." rows={6} />
          </div>
          <Button type="submit" size="lg" className="w-full">Open mail app to send</Button>
        </form>
      </div>
    </div>
  )
}
