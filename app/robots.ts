import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/_next/", "/auth/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/auth/", "/private/"],
      },
    ],
    sitemap: "https://apnacoding.tech/sitemap.xml",
    host: "https://apnacoding.tech",
  }
}
