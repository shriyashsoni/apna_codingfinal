import type { Metadata } from "next"
import BlogClientPage from "./BlogClientPage"
import SEOHead from "@/components/seo/seo-head"
import { BreadcrumbSchema } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Coding Tips, Tech News & Updates | Apna Coding Blog",
  description:
    "Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips on the Apna Coding Blog. Explore new topics every week!",
  keywords: [
    "coding blog",
    "tech updates",
    "programming tips",
    "hackathon news",
    "Apna Coding blog",
    "career advice",
    "coding tutorials",
  ],
  openGraph: {
    title: "Coding Tips, Tech News & Updates | Apna Coding Blog",
    description:
      "Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips on the Apna Coding Blog.",
    url: "https://apnacoding.tech/blog",
    siteName: "Apna Coding",
    images: [
      {
        url: "https://apnacoding.tech/images/blog-hero.png",
        width: 1200,
        height: 630,
        alt: "Apna Coding Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Tips, Tech News & Updates | Apna Coding Blog",
    description: "Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips.",
    images: ["https://apnacoding.tech/images/blog-hero.png"],
    creator: "@shriyashsoni",
    site: "@apnacoding",
  },
  alternates: {
    canonical: "https://apnacoding.tech/blog",
  },
}

export default async function BlogPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://apnacoding.tech" },
    { name: "Blog", url: "https://apnacoding.tech/blog" },
  ]

  return (
    <>
      <SEOHead
        title="Coding Tips, Tech News & Updates | Apna Coding Blog"
        description="Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips on the Apna Coding Blog. Explore new topics every week!"
        keywords={["coding blog", "tech updates", "programming tips", "hackathon news", "Apna Coding blog"]}
        canonicalUrl="https://apnacoding.tech/blog"
        ogTitle="Coding Tips, Tech News & Updates | Apna Coding Blog"
        ogDescription="Stay updated with the latest tech news, coding tutorials, career advice, and hackathon tips."
        ogImage="https://apnacoding.tech/images/blog-hero.png"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <BlogClientPage />
    </>
  )
}
