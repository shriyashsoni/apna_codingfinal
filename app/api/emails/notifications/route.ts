import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { getEmailNotifications, getEmailStats } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // Get current user and verify admin access
    const supabase = createServerComponentClient()

    let user
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      user = authUser
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Check if user is admin
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } catch (profileError) {
      console.error("Profile check error:", profileError)
      return NextResponse.json({ error: "Failed to verify admin access" }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const stats = searchParams.get("stats") === "true"

    if (stats) {
      // Return email statistics
      try {
        const emailStats = await getEmailStats()
        return NextResponse.json(emailStats)
      } catch (statsError) {
        console.error("Error getting email stats:", statsError)
        return NextResponse.json({
          total: 0,
          sent: 0,
          failed: 0,
          today: 0,
          success_rate: 0,
        })
      }
    } else {
      // Return email notifications list
      try {
        const notifications = await getEmailNotifications(limit)
        return NextResponse.json(notifications)
      } catch (notificationsError) {
        console.error("Error getting email notifications:", notificationsError)
        return NextResponse.json([])
      }
    }
  } catch (error) {
    console.error("Email notifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
