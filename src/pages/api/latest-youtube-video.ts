// Next.js API route to fetch the latest YouTube video ID for your channel
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rssRes = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCQPQCy_QR1rJc-a_YxHSYjg');
    if (!rssRes.ok) return res.status(502).json({ error: 'Failed to fetch YouTube RSS' });
    const rssText = await rssRes.text();
    const match = rssText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!match) return res.status(404).json({ error: 'No video found' });
    return res.status(200).json({ videoId: match[1] });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
}
