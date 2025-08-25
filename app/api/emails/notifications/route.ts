import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"
import { getEmailNotifications, getEmailStats } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
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

    // Check if requesting stats
    const { searchParams } = new URL(request.url)
    const isStatsRequest = searchParams.get("stats") === "true"

    if (isStatsRequest) {
      const stats = await getEmailStats()
      return NextResponse.json(stats)
    } else {
      const notifications = await getEmailNotifications(50)
      return NextResponse.json(notifications)
    }
  } catch (error) {
    console.error("Email notifications API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
