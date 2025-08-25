import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { sendBatchEmails } from "@/lib/email"

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

    const { emails } = body

    // Validate emails array
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid emails array" }, { status: 400 })
    }

    // Validate each email object
    for (const email of emails) {
      if (!email.to || !email.subject || !email.html) {
        return NextResponse.json(
          { success: false, error: "Each email must have to, subject, and html fields" },
          { status: 400 },
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.to)) {
        return NextResponse.json(
          { success: false, error: `Invalid email address format: ${email.to}` },
          { status: 400 },
        )
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

    // Send batch emails
    const result = await sendBatchEmails(emails)

    return NextResponse.json({
      success: result.success,
      results: result.results,
      message: `Batch email operation completed. ${result.results.filter((r) => r.success).length}/${emails.length} emails sent successfully.`,
    })
  } catch (error) {
    console.error("Batch email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
