"use client";

import { Play } from "lucide-react";
import { clsx } from "clsx";

interface VideoPlaceholderProps {
  videoUrl?: string | null;
  aspectRatio?: "16/9" | "4/3" | "1/1";
  className?: string;
  label?: string;
}

export function VideoPlaceholder({
  videoUrl,
  aspectRatio = "16/9",
  className,
  label = "Video Coming Soon",
}: VideoPlaceholderProps) {
  const aspectClasses = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  };

  if (videoUrl) {
    return (
      <div
        className={clsx(
          "relative rounded-2xl overflow-hidden",
          aspectClasses[aspectRatio],
          className
        )}
      >
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-gradient-to-b from-indigo-950/50 to-black flex items-center justify-center group cursor-pointer",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-50" />

      {/* Play button */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/15 transition-all duration-300">
          <Play className="w-6 h-6 text-white/60 ml-0.5" />
        </div>
        <span className="text-sm text-white/30 font-medium">{label}</span>
      </div>
    </div>
  );
}
