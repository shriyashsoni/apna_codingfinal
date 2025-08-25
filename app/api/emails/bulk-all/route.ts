import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { sendEmailToAllUsers, sendBulkAnnouncement, sendPlatformUpdate } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { subject, html, type, title, message, updateTitle, updateDetails } = body

    // Validate required fields based on type
    if (type === "bulk_announcement") {
      if (!title || !message) {
        return NextResponse.json(
          { success: false, error: "Title and message are required for bulk announcements" },
          { status: 400 },
        )
      }
    } else if (type === "platform_update") {
      if (!updateTitle || !updateDetails) {
        return NextResponse.json(
          { success: false, error: "Update title and details are required for platform updates" },
          { status: 400 },
        )
      }
    } else {
      if (!subject || !html) {
        return NextResponse.json({ success: false, error: "Subject and HTML content are required" }, { status: 400 })
      }
    }

    // Get current user and verify admin access
    const supabase = createServerComponentClient()

    let user
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }

      user = authUser
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 401 })
    }

    // Check if user is admin
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", user.id)
        .single()

      if (profileError || !profile || (profile.role !== "admin" && profile.email !== "sonishriyash@gmail.com")) {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
      }
    } catch (profileError) {
      console.error("Profile check error:", profileError)
      return NextResponse.json({ success: false, error: "Failed to verify admin access" }, { status: 500 })
    }

    // Send emails based on type
    let result
    if (type === "bulk_announcement") {
      result = await sendBulkAnnouncement(title, message)
    } else if (type === "platform_update") {
      result = await sendPlatformUpdate(updateTitle, updateDetails)
    } else {
      result = await sendEmailToAllUsers(subject, html, type || "bulk_announcement")
    }

    const successCount = result.results.filter((r) => r.success).length
    const failureCount = result.results.filter((r) => !r.success).length

    return NextResponse.json({
      success: result.success,
      totalUsers: result.totalUsers,
      successCount,
      failureCount,
      results: result.results,
      message: `Bulk email operation completed. ${successCount}/${result.totalUsers} emails sent successfully.`,
    })
  } catch (error) {
    console.error("Bulk email to all users API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
