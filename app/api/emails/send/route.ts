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

    const { to, subject, html, type, userId } = body

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
      // Try multiple authentication methods
      const authHeader = request.headers.get("authorization")

      if (authHeader?.startsWith("Bearer ")) {
        // Use bearer token
        const token = authHeader.substring(7)
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser(token)

        if (authError || !authUser) {
          return NextResponse.json({ success: false, error: "Invalid authentication token" }, { status: 401 })
        }
        user = authUser
      } else {
        // Fallback to session-based auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return NextResponse.json({ success: false, error: "Unauthorized - Please log in" }, { status: 401 })
        }
        user = authUser
      }
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

      // Handle case where profile doesn't exist yet
      if (profileError && profileError.code === "PGRST116") {
        // Create profile for main admin
        if (user.email === "sonishriyash@gmail.com") {
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Admin",
                role: "admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single()

          if (createError) {
            console.error("Error creating admin profile:", createError)
            return NextResponse.json({ success: false, error: "Failed to create admin profile" }, { status: 500 })
          }
        } else {
          return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
        }
      } else if (profileError) {
        console.error("Profile fetch error:", profileError)
        return NextResponse.json({ success: false, error: "Failed to verify user permissions" }, { status: 500 })
      } else if (!profile || (profile.role !== "admin" && profile.email !== "sonishriyash@gmail.com")) {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
      }
    } catch (profileError) {
      console.error("Profile check error:", profileError)
      return NextResponse.json({ success: false, error: "Failed to verify admin access" }, { status: 500 })
    }

    // Send email
    const result = await sendEmail(to, subject, html, type || "admin_notification", userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        emailId: result.emailId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Email send API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
