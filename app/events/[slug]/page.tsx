import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEventBySlugId, extractIdFromSlug } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    const eventId = extractIdFromSlug(params.slug)
    const { data: event } = await getEventBySlugId(eventId)

    if (!event) {
      return {
        title: "Event Not Found - Apna Coding",
        description: "The requested event could not be found.",
      }
    }

    return {
      title: `${event.title} - Apna Coding Events`,
      description: event.description.substring(0, 160),
      keywords: [
        event.title,
        event.event_type,
        event.organizer,
        ...event.technologies,
        ...event.tags,
        "tech events",
        "workshops",
        "webinars",
        "conferences",
        "coding events",
        "apna coding",
      ].join(", "),
      openGraph: {
        title: event.title,
        description: event.description,
        images: event.image_url ? [{ url: event.image_url }] : [],
        type: "website",
        siteName: "Apna Coding",
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.description,
        images: event.image_url ? [event.image_url] : [],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Event - Apna Coding",
      description: "Discover amazing tech events and workshops from Apna Coding.",
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    const eventId = extractIdFromSlug(params.slug)
    console.log("Event page - Slug:", params.slug, "Extracted ID:", eventId)

    const { data: event, error } = await getEventBySlugId(eventId)

    if (error || !event) {
      console.error("Event not found:", error)
      notFound()
    }

    return <EventDetailClient event={event} />
  } catch (error) {
    console.error("Error loading event:", error)
    notFound()
  }
}
