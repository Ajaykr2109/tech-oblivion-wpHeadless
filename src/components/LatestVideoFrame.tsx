"use client";
import { useEffect, useState } from "react";

export default function LatestVideoFrame() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatestVideo() {
      setLoading(true);
      try {
        const res = await fetch("/api/latest-youtube-video");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setVideoId(data.videoId || null);
      } catch {
        // Ignore fetch errors; videoId will remain null
        if (!cancelled) setVideoId(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLatestVideo();
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
      <span className="text-white/80">Loading...</span>
    </div>
  );

  if (!videoId) return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
      <span className="text-white/80">No video found</span>
    </div>
  );

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      className="w-full h-full"
      allowFullScreen
      title="Latest YouTube Video"
    />
  );
}
