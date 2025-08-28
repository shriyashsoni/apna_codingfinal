import { notFound } from "next/navigation"
import { getEventBySlugId, extractIdFromSlug } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"
import type { Metadata } from "next"

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const eventId = extractIdFromSlug(params.slug)
  const { data: event } = await getEventBySlugId(eventId)

  if (!event) {
    return {
      title: "Event Not Found - Apna Coding",
      description: "The requested event could not be found.",
    }
  }

  return {
    title: `${event.title} - Apna Coding`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160),
      images: event.image_url ? [event.image_url] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description.substring(0, 160),
      images: event.image_url ? [event.image_url] : [],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  console.log("🔍 Event page params:", params)

  const eventId = extractIdFromSlug(params.slug)
  console.log("🔍 Extracted event ID:", eventId)

  const { data: event, error } = await getEventBySlugId(eventId)

  console.log("🔍 Event lookup result:", { event: event?.title, error })

  if (!event || error) {
    console.log("❌ Event not found, showing 404")
    notFound()
  }

  return <EventDetailClient event={event} />
}
