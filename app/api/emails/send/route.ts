import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"

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

    const { to, subject, html, type = "admin_notification", userId } = body

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: "Missing required fields: to, subject, html" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ success: false, error: "Invalid email address format" }, { status: 400 })
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
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || !profile || profile.role !== "admin") {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
      }
    } catch (profileError) {
      console.error("Profile check error:", profileError)
      return NextResponse.json({ success: false, error: "Failed to verify admin access" }, { status: 500 })
    }

    // Send email
    const result = await sendEmail(to, subject, html, type, userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        emailId: result.emailId,
      })
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
