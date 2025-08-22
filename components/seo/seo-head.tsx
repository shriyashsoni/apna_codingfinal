import Head from "next/head"

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: string
  noindex?: boolean
  nofollow?: boolean
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = "summary_large_image",
  noindex = false,
  nofollow = false,
}: SEOHeadProps) {
  const robots = []
  if (noindex) robots.push("noindex")
  if (nofollow) robots.push("nofollow")
  if (robots.length === 0) robots.push("index", "follow")

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="robots" content={robots.join(", ")} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Apna Coding" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      <meta name="twitter:site" content="@apnacoding" />
      <meta name="twitter:creator" content="@shriyashsoni" />

      {/* Additional Meta Tags */}
      <meta name="author" content="Apna Coding" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="theme-color" content="#facc15" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  )
}
