import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase"
import { getEmailNotifications, getEmailStats } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const stats = searchParams.get("stats") === "true"

    if (stats) {
      const emailStats = await getEmailStats()
      return NextResponse.json(emailStats)
    }

    const notifications = await getEmailNotifications(limit)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Email notifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
