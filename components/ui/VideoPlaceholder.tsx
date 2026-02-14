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
        "relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center group cursor-pointer",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50" />

      {/* Play button */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
        <span className="text-sm font-medium text-white/70">{label}</span>
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 dot-grid opacity-30" />
    </div>
  );
}
