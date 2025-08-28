import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEventById, extractIdFromSlug } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    const eventId = extractIdFromSlug(params.slug)
    const { data: event } = await getEventById(eventId)

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
      ].join(", "),
      openGraph: {
        title: event.title,
        description: event.description,
        images: event.image_url ? [{ url: event.image_url }] : [],
        type: "website",
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
      description: "Discover amazing tech events and workshops.",
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    const eventId = extractIdFromSlug(params.slug)
    const { data: event, error } = await getEventById(eventId)

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
