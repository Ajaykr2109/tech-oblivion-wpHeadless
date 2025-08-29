type PostSlim = { id:number; slug:string; title:{rendered:string}; excerpt?:{rendered:string}; date:string };
type PostFull = { title:{rendered:string}; content:{rendered:string}; slug:string; yoast_head_json?:any };

const WP = process.env.WP_URL!

export async function getPosts(limit=10): Promise<PostSlim[]> {
  const url = `${WP}/wp-json/wp/v2/posts?per_page=${limit}&_fields=id,slug,title,excerpt,date`;
  const r = await fetch(url, { next: { revalidate: 120, tags: ['wp:posts'] } });
  if (!r.ok) throw new Error('Failed posts fetch');
  return r.json();
}

export async function getPostBySlug(slug:string): Promise<PostFull | null> {
  const url = `${WP}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=title,content,slug,yoast_head_json`;
  const r = await fetch(url, { next: { revalidate: 300, tags: [`wp:post:${slug}`] } });
  if (!r.ok) throw new Error('Failed post fetch');
  const arr = await r.json();
  return arr?.[0] ?? null;
}
