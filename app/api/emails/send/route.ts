import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
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

    // Create Supabase client with service role for server-side operations
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    let user = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser(token)
        if (!authError && authUser) {
          user = authUser
        }
      } catch (tokenError) {
        console.error("Token verification error:", tokenError)
      }
    }

    // If no user from token, try to get from cookies (for browser requests)
    if (!user) {
      try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("sb-access-token")?.value
        const refreshToken = cookieStore.get("sb-refresh-token")?.value

        if (accessToken) {
          const {
            data: { user: cookieUser },
            error: cookieError,
          } = await supabase.auth.getUser(accessToken)
          if (!cookieError && cookieUser) {
            user = cookieUser
          }
        }
      } catch (cookieError) {
        console.error("Cookie auth error:", cookieError)
      }
    }

    // If still no user, check session from client-side supabase
    if (!user) {
      try {
        const clientSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const {
          data: { session },
          error: sessionError,
        } = await clientSupabase.auth.getSession()
        if (!sessionError && session?.user) {
          user = session.user
        }
      } catch (sessionError) {
        console.error("Session error:", sessionError)
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized - Please log in" }, { status: 401 })
    }

    // Check if user is admin
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", user.id)
        .single()

      // If profile doesn't exist, check if user email is admin email
      if (profileError || !profile) {
        if (user.email === "sonishriyash@gmail.com") {
          // Create admin profile if it doesn't exist
          await supabase.from("users").upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Admin",
            role: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } else {
          return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
        }
      } else if (profile.role !== "admin" && profile.email !== "sonishriyash@gmail.com") {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
      }
    } catch (profileError) {
      console.error("Profile check error:", profileError)
      // If there's an error checking profile, allow if user email is admin email
      if (user.email !== "sonishriyash@gmail.com") {
        return NextResponse.json({ success: false, error: "Failed to verify admin access" }, { status: 500 })
      }
    }

    // Send email
    const result = await sendEmail(to, subject, html, type, userId || user.id)

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
