import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getEventBySlugId, generateSlug } from "@/lib/supabase"
import EventDetailClient from "./EventDetailClient"
import SEO from "@/components/seo"

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { data: event } = await getEventBySlugId(params.slug)

  if (!event) {
    return {
      title: "Event Not Found - Apna Coding",
      description: "The requested event could not be found.",
    }
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return {
    title: `${event.title} - ${eventDate} | Apna Coding`,
    description: event.description.substring(0, 160),
    keywords: [
      event.title,
      "coding event",
      "tech event",
      "programming",
      "apna coding",
      ...event.technologies,
      event.event_type,
    ].join(", "),
    openGraph: {
      title: event.title,
      description: event.description,
      type: "article",
      publishedTime: event.created_at,
      modifiedTime: event.updated_at,
      images: event.image_url
        ? [
            {
              url: event.image_url,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ]
        : [],
      locale: "en_US",
      siteName: "Apna Coding",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description.substring(0, 200),
      images: event.image_url ? [event.image_url] : [],
    },
    alternates: {
      canonical: `/events/${generateSlug(event.title, event.id)}`,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { data: event, error } = await getEventBySlugId(params.slug)

  if (error || !event) {
    console.error("Event not found:", params.slug, error)
    notFound()
  }

  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.event_date,
    endDate: event.end_date || event.event_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.event_mode === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.event_mode === "offline"
          ? "https://schema.org/OfflineEventAttendanceMode"
          : "https://schema.org/MixedEventAttendanceMode",
    location:
      event.event_mode === "online"
        ? {
            "@type": "VirtualLocation",
            url: event.registration_link || "https://apnacoding.com",
          }
        : {
            "@type": "Place",
            name: event.location,
            address: event.location,
          },
    image: event.image_url || "/placeholder.svg?height=400&width=600",
    organizer: {
      "@type": "Organization",
      name: event.organizer || "Apna Coding",
      url: "https://apnacoding.com",
    },
    offers: {
      "@type": "Offer",
      price: event.registration_fee.toString(),
      priceCurrency: "INR",
      availability: event.registration_open ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: event.registration_link || `https://apnacoding.com/events/${params.slug}`,
    },
  }

  return (
    <>
      <SEO
        title={`${event.title} - ${eventDate}`}
        description={event.description}
        keywords={[event.title, "coding event", "tech event", ...event.technologies].join(", ")}
        image={event.image_url}
        url={`/events/${params.slug}`}
        type="article"
        structuredData={structuredData}
      />
      <EventDetailClient event={event} />
    </>
  )
}
