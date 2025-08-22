import type { Metadata } from "next"
import MentorshipPageClient from "./MentorshipPageClient"
import SEOHead from "@/components/seo/seo-head"
import { BreadcrumbSchema } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Tech Mentorship Programs | Apna Coding",
  description:
    "Get personalized mentorship from top tech industry leaders. Join Apna Coding's mentorship program to advance your skills, land your dream job, and grow your career.",
  keywords: [
    "coding mentorship",
    "tech mentors",
    "career coaching",
    "software engineering mentorship",
    "Apna Coding mentors",
    "programming guidance",
    "tech career growth",
  ],
  openGraph: {
    title: "Tech Mentorship Programs | Apna Coding",
    description:
      "Get personalized mentorship from top tech industry leaders. Advance your skills and grow your career.",
    url: "https://apnacoding.tech/mentorship",
    siteName: "Apna Coding",
    images: [
      {
        url: "https://apnacoding.tech/images/mentorship-hero.png",
        width: 1200,
        height: 630,
        alt: "Apna Coding Mentorship Programs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Mentorship Programs | Apna Coding",
    description:
      "Get personalized mentorship from top tech industry leaders. Advance your skills and grow your career.",
    images: ["https://apnacoding.tech/images/mentorship-hero.png"],
    creator: "@shriyashsoni",
    site: "@apnacoding",
  },
  alternates: {
    canonical: "https://apnacoding.tech/mentorship",
  },
}

export default async function MentorshipPage() {
  const breadcrumbItems = [
    { name: "Home", url: "https://apnacoding.tech" },
    { name: "Mentorship", url: "https://apnacoding.tech/mentorship" },
  ]

  return (
    <>
      <SEOHead
        title="Tech Mentorship Programs | Apna Coding"
        description="Get personalized mentorship from top tech industry leaders. Join Apna Coding's mentorship program to advance your skills, land your dream job, and grow your career."
        keywords={[
          "coding mentorship",
          "tech mentors",
          "career coaching",
          "software engineering mentorship",
          "Apna Coding mentors",
        ]}
        canonicalUrl="https://apnacoding.tech/mentorship"
        ogTitle="Tech Mentorship Programs | Apna Coding"
        ogDescription="Get personalized mentorship from top tech industry leaders. Advance your skills and grow your career."
        ogImage="https://apnacoding.tech/images/mentorship-hero.png"
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <MentorshipPageClient />
    </>
  )
}
