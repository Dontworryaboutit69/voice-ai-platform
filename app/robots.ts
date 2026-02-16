import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/onboarding/", "/agents/*/"],
      },
    ],
    sitemap: "https://voiceaiplatform.com/sitemap.xml",
  };
}
