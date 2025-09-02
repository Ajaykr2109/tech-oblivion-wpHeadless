"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LatestVideoPlayer() {
  const [video, setVideo] = useState<{ id: string; title: string; thumbnail: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchLatestVideo() {
      setLoading(true);
      try {
        const res = await fetch("/api/latest-youtube-video");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.videoId) {
          // Fetch video details from YouTube oEmbed (for title & thumbnail)
          const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${data.videoId}&format=json`);
          const meta = oembed.ok ? await oembed.json() : {};
          if (!cancelled) setVideo({
            id: data.videoId,
            title: meta.title || "",
            thumbnail: meta.thumbnail_url || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`
          });
        } else if (!cancelled) setVideo(null);
      } catch {
        if (!cancelled) setVideo(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLatestVideo();
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div className="aspect-video w-full bg-black/40 flex items-center justify-center rounded-lg">
      <span className="text-white/80">Loading...</span>
    </div>
  );
  if (!video) return (
    <div className="aspect-video w-full bg-black/40 flex items-center justify-center rounded-lg">
      <span className="text-white/80">No video found</span>
    </div>
  );

  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        {!playing && (
          <button
            className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40 hover:bg-black/60 transition"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover z-0"
              unoptimized
            />
            <svg className="z-10" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.6)" />
              <polygon points="26,20 48,32 26,44" fill="#fff" />
            </svg>
          </button>
        )}
        {playing && (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={video.title || "YouTube video player"}
          />
        )}
      </div>
      <div className="mt-3 text-lg font-semibold text-center text-foreground">
        {video.title}
      </div>
    </div>
  );
}
