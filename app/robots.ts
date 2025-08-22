import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/profile", "/_next/", "/auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dashboard/profile", "/auth/"],
      },
    ],
    sitemap: "https://apnacoding.tech/sitemap.xml",
    host: "https://apnacoding.tech",
  }
}
