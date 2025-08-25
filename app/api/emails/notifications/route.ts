import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { getEmailNotifications, getEmailStats } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
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

    // If still no user, try client-side supabase
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

    // Check if requesting stats
    const { searchParams } = new URL(request.url)
    const isStats = searchParams.get("stats") === "true"

    if (isStats) {
      const stats = await getEmailStats()
      return NextResponse.json(stats)
    } else {
      const notifications = await getEmailNotifications()
      return NextResponse.json(notifications)
    }
  } catch (error) {
    console.error("Email notifications API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
