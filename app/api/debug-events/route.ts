import { NextResponse } from "next/server"
import { getAllEvents, generateSlug } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: events, error } = await getAllEvents()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const eventsWithSlugs = events?.map((event) => ({
      id: event.id,
      title: event.title,
      slug: generateSlug(event.title, event.id),
      url: `/events/${generateSlug(event.title, event.id)}`,
      direct_url: `/events/${event.id}`,
      event_date: event.event_date,
      status: event.status,
    }))

    return NextResponse.json({
      message: "Events debug information",
      total_events: events?.length || 0,
      events: eventsWithSlugs,
    })
  } catch (error) {
    console.error("Debug events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
