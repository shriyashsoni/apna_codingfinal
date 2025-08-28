import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { extractIdFromSlug } from "@/lib/supabase"
import { getEventById } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const eventId = extractIdFromSlug(params.slug)
  const { data: event } = await getEventById(eventId)

  if (!event) {
    return {
      title: "Event Not Found - Apna Coding",
      description: "The event you're looking for doesn't exist.",
    }
  }

  const baseUrl = "https://apnacoding.tech"
  const eventUrl = `${baseUrl}/events/${params.slug}`
  const imageUrl = event.image_url || `${baseUrl}/images/courses-hero.png`

  return {
    title: `${event.title} - ${event.organizer} | Apna Coding`,
    description: event.description.substring(0, 160),
    keywords: [
      event.title,
      event.organizer,
      event.event_type,
      "tech event",
      "workshop",
      "webinar",
      ...event.technologies,
      event.event_mode,
    ],
    authors: [{ name: "Apna Coding" }, { name: event.organizer }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      title: `${event.title} - ${event.organizer}`,
      description: event.description.substring(0, 200),
      url: eventUrl,
      siteName: "Apna Coding",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${event.title} - ${event.organizer}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} - ${event.organizer}`,
      description: event.description.substring(0, 200),
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

export default async function EventDetailPage({ params }: Props) {
  const eventId = extractIdFromSlug(params.slug)
  const { data: event, error } = await getEventById(eventId)

  if (error || !event) {
    notFound()
  }

  return <EventDetailClient event={event} />
}
