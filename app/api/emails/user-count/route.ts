import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"

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

    // Get user count
    const { count, error } = await supabase.from("users").select("id", { count: "exact" }).not("email", "is", null)

    if (error) {
      console.error("Error getting user count:", error)
      return NextResponse.json({ success: false, error: "Failed to get user count" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userCount: count || 0,
    })
  } catch (error) {
    console.error("User count API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
