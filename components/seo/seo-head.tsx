import Head from "next/head"
import type { Metadata } from "next"

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
  nofollow?: boolean
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export function generateMetadata({
  title,
  description,
  keywords,
  canonical,
  ogImage = "https://apnacoding.tech/logo.png",
  ogType = "website",
  noindex = false,
  nofollow = false,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
}: SEOHeadProps): Metadata {
  const fullTitle = title.includes("Apna Coding") ? title : `${title} | Apna Coding`
  const fullCanonical = canonical || "https://apnacoding.tech"

  const robots = []
  if (noindex) robots.push("noindex")
  if (nofollow) robots.push("nofollow")
  if (robots.length === 0) robots.push("index", "follow")

  return {
    title: fullTitle,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: "Apna Coding" }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    robots: robots.join(", "),
    alternates: {
      canonical: fullCanonical,
    },
    openGraph: {
      type: ogType as any,
      locale: "en_US",
      url: fullCanonical,
      title: fullTitle,
      description,
      siteName: "Apna Coding",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      creator: "@apnacoding",
      site: "@apnacoding",
    },
    other: {
      "revisit-after": "7 days",
      distribution: "global",
      language: "English",
      rating: "General",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "theme-color": "#000000",
      "msapplication-TileColor": "#000000",
    },
  }
}

export default function SEOHead(props: SEOHeadProps) {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage = "https://apnacoding.tech/logo.png",
    ogType = "website",
    noindex = false,
    nofollow = false,
    author,
    publishedTime,
    modifiedTime,
  } = props

  const fullTitle = title.includes("Apna Coding") ? title : `${title} | Apna Coding`
  const fullCanonical = canonical || "https://apnacoding.tech"

  const robots = []
  if (noindex) robots.push("noindex")
  if (nofollow) robots.push("nofollow")
  if (robots.length === 0) robots.push("index", "follow")

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || "Apna Coding"} />
      <meta name="robots" content={robots.join(", ")} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Apna Coding" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@apnacoding" />
      <meta name="twitter:site" content="@apnacoding" />

      {/* Additional Meta Tags */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="General" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="msapplication-TileColor" content="#000000" />
    </Head>
  )
}
