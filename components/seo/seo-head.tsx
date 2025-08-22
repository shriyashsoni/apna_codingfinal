import type { Metadata } from "next"

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "profile"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = "/logo.png",
  url = "https://apnacoding.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOProps): Metadata {
  const fullTitle = title.includes("Apna Coding") ? title : `${title} | Apna Coding`
  const fullImage = image.startsWith("http") ? image : `https://apnacoding.com${image}`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : [{ name: "Apna Coding Team" }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      title: fullTitle,
      description,
      siteName: "Apna Coding",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : ["Apna Coding Team"],
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@apnacoding",
      creator: "@apnacoding",
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: url,
    },
    other: {
      "google-site-verification": "your-google-verification-code",
    },
  }
}

export function generatePageJsonLd(data: any) {
  return {
    __html: JSON.stringify(data),
  }
}
