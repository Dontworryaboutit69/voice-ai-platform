import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VoiceAI — AI Phone Agent Platform",
    short_name: "VoiceAI",
    description:
      "Build agency-grade AI phone agents that actually sound human. Self-learning AI receptionists for your business.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
