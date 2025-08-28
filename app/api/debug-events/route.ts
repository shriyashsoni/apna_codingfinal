import { NextResponse } from "next/server"
import { getAllEvents } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: events, error } = await getAllEvents()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const eventInfo =
      events?.map((event) => ({
        id: event.id,
        title: event.title,
        slug: event.id, // Using ID as slug for now
        status: event.status,
        created_at: event.created_at,
      })) || []

    return NextResponse.json({
      total: events?.length || 0,
      events: eventInfo,
    })
  } catch (error) {
    console.error("Debug events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
