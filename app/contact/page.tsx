export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="text-muted-foreground mb-6">Have a question or feedback? Send us a message.</p>
      <form className="grid gap-4">
        <input className="border rounded p-2" placeholder="Your name" />
        <input className="border rounded p-2" placeholder="Your email" type="email" />
        <textarea className="border rounded p-2" placeholder="Your message" rows={5} />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded" type="button">Send</button>
      </form>
    </div>
  )
}
