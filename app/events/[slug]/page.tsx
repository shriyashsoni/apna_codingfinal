import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEventBySlugId, extractIdFromSlug, getAllEvents } from "@/lib/supabase"
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
    console.log("🚀 Event page loading - Raw slug:", params.slug)

    // First, let's try to get all events to see what we have
    const { data: allEvents } = await getAllEvents()
    console.log("📊 Total events in database:", allEvents?.length || 0)

    if (allEvents && allEvents.length > 0) {
      console.log(
        "📋 Available events:",
        allEvents.map((e) => ({ id: e.id, title: e.title })),
      )
    }

    const eventId = extractIdFromSlug(params.slug)
    console.log("🔍 Extracted event ID:", eventId)

    const { data: event, error } = await getEventBySlugId(eventId)

    console.log("📝 Event lookup result:", {
      found: !!event,
      error: error?.message,
      eventTitle: event?.title,
    })

    if (error) {
      console.error("❌ Event lookup error:", error)
    }

    if (!event) {
      console.log("❌ Event not found, showing 404")
      notFound()
    }

    console.log("✅ Event found, rendering page:", event.title)
    return <EventDetailClient event={event} />
  } catch (error) {
    console.error("💥 Critical error in EventPage:", error)
    notFound()
  }
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  try {
    const { data: events } = await getAllEvents()

    if (!events) return []

    return events.map((event) => ({
      slug: event.id, // Use the actual ID as slug for now
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}
