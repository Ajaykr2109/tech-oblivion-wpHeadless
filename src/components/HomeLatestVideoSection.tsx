"use client";
import LatestVideoPlayer from "@/components/LatestVideoPlayer";

export default function HomeLatestVideoSection() {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-semibold">Latest Video</h2>
  <LatestVideoPlayer />
    </div>
  );
}
