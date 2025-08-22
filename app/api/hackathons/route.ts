import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Prepare hackathon data
    const hackathonData = {
      title: body.title,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      location: body.location,
      mode: body.mode || "hybrid",
      organizer: body.organizer,
      prize_pool: body.prize_pool,
      max_team_size: body.max_team_size ? Number.parseInt(body.max_team_size) : null,
      registration_link: body.registration_link,
      whatsapp_link: body.whatsapp_link,
      image_url: body.image_url,
      technologies: body.technologies || [],
      partnerships: body.partnerships || [],
      difficulty: body.difficulty || "intermediate",
      status: body.status || "upcoming",
      featured: body.featured || false,
      participants_count: 0,
      registration_deadline: body.registration_deadline,
      slug: slug,
    }

    const { data, error } = await supabase.from("hackathons").insert([hackathonData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
