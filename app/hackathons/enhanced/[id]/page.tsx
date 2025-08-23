import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEnhancedHackathonById } from "@/lib/hackathon-system"
import EnhancedHackathonClient from "./EnhancedHackathonClient"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: hackathon } = await getEnhancedHackathonById(params.id)

  if (!hackathon) {
    return {
      title: "Hackathon Not Found - Apna Coding",
      description: "The hackathon you're looking for doesn't exist.",
    }
  }

  const baseUrl = "https://apnacoding.tech"
  const hackathonUrl = `${baseUrl}/hackathons/enhanced/${hackathon.id}`
  const imageUrl = hackathon.image_url || hackathon.banner_url || `${baseUrl}/images/hackathon-hero.png`

  return {
    title: `${hackathon.title} - ${hackathon.organizer} | Apna Coding`,
    description: hackathon.short_description || hackathon.description.substring(0, 160),
    keywords: [
      hackathon.title,
      hackathon.organizer,
      "hackathon",
      "coding competition",
      "programming contest",
      ...hackathon.technologies,
      hackathon.difficulty,
      hackathon.mode,
    ],
    authors: [{ name: "Apna Coding" }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: hackathonUrl,
    },
    openGraph: {
      title: `${hackathon.title} - ${hackathon.organizer}`,
      description: hackathon.short_description || hackathon.description.substring(0, 200),
      url: hackathonUrl,
      siteName: "Apna Coding",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${hackathon.title} - ${hackathon.organizer}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hackathon.title} - ${hackathon.organizer}`,
      description: hackathon.short_description || hackathon.description.substring(0, 200),
      site: "@apnacoding",
      creator: "@shriyashsoni",
      images: [imageUrl],
    },
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
    verification: {
      google: "your-google-verification-code",
    },
  }
}

export default async function EnhancedHackathonPage({ params }: Props) {
  const { data: hackathon, success } = await getEnhancedHackathonById(params.id)

  if (!success || !hackathon) {
    notFound()
  }

  return <EnhancedHackathonClient hackathon={hackathon} />
}
