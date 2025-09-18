"use client";
import LatestVideoPlayer from "@/components/LatestVideoPlayer";

export default function HomeLatestVideoSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <LatestVideoPlayer />
      </div>
    </div>
  );
}
