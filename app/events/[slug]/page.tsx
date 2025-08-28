import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getEventBySlugId, extractIdFromSlug, getAllEvents } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"
import type { Metadata } from "next"

interface EventPageProps {
  params: {
    slug: string
  }
}

// Loading component
function EventLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading event...</p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    console.log("🔍 Generating metadata for slug:", params.slug)

    const eventId = extractIdFromSlug(params.slug)
    console.log("🔍 Extracted ID for metadata:", eventId)

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
        ...(event.tags || []),
        "tech events",
        "workshops",
        "webinars",
        "conferences",
        "coding events",
        "apna coding",
      ].join(", "),
      openGraph: {
        title: event.title,
        description: event.description.substring(0, 160),
        images: event.image_url ? [{ url: event.image_url }] : [],
        type: "website",
        siteName: "Apna Coding",
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.description.substring(0, 160),
        images: event.image_url ? [event.image_url] : [],
      },
    }
  } catch (error) {
    console.error("❌ Error generating metadata:", error)
    return {
      title: "Event - Apna Coding",
      description: "Discover amazing tech events and workshops from Apna Coding.",
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    console.log("🚀 Event page loading - Raw slug:", params.slug)
    console.log("🚀 Full params object:", JSON.stringify(params, null, 2))

    // Decode the slug in case it's URL encoded
    const decodedSlug = decodeURIComponent(params.slug)
    console.log("🔍 Decoded slug:", decodedSlug)

    // Extract the event ID from the slug
    const eventId = extractIdFromSlug(decodedSlug)
    console.log("🔍 Extracted event ID:", eventId)

    // Try to get the event
    const { data: event, error } = await getEventBySlugId(eventId)

    console.log("📝 Event lookup result:", {
      found: !!event,
      error: error?.message,
      eventTitle: event?.title,
      eventId: event?.id,
    })

    // If we have an error or no event, log more details
    if (error) {
      console.error("❌ Event lookup error:", error)
    }

    if (!event) {
      console.log("❌ Event not found for slug:", params.slug)
      console.log("❌ Tried event ID:", eventId)

      // Let's also check what events are available
      try {
        const { data: allEvents } = await getAllEvents()
        console.log("📊 Total events in database:", allEvents?.length || 0)
        if (allEvents && allEvents.length > 0) {
          console.log(
            "📋 First few events:",
            allEvents.slice(0, 3).map((e) => ({ id: e.id, title: e.title })),
          )
        }
      } catch (debugError) {
        console.error("❌ Error fetching debug info:", debugError)
      }

      notFound()
    }

    console.log("✅ Event found successfully:", event.title)
    console.log("✅ Event details:", {
      id: event.id,
      title: event.title,
      status: event.status,
      date: event.event_date,
    })

    return (
      <Suspense fallback={<EventLoading />}>
        <EventDetailClient event={event} />
      </Suspense>
    )
  } catch (error) {
    console.error("💥 Critical error in EventPage:", error)
    console.error("💥 Error stack:", error instanceof Error ? error.stack : "No stack trace")
    notFound()
  }
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    console.log("🔧 Generating static params for events...")

    const { data: events } = await getAllEvents()

    if (!events || events.length === 0) {
      console.log("⚠️ No events found for static generation")
      return []
    }

    console.log(`📊 Generating static params for ${events.length} events`)

    const params = events.flatMap((event) => {
      // Generate both the SEO slug and direct ID as params
      const seoSlug =
        event.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim() +
        "-" +
        event.id.substring(0, 8)

      return [
        { slug: event.id }, // Direct ID access
        { slug: seoSlug }, // SEO-friendly slug
      ]
    })

    console.log(`✅ Generated ${params.length} static params`)
    return params
  } catch (error) {
    console.error("❌ Error generating static params:", error)
    return []
  }
}
