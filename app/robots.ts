import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/", "/_next/", "/auth/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/", "/auth/", "/private/"],
      },
    ],
    sitemap: "https://apnacoding.com/sitemap.xml",
    host: "https://apnacoding.com",
  }
}
