import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  console.log("🔄 Auth callback received:", {
    code: !!code,
    next,
    url: requestUrl.toString(),
  })

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("🔄 Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Code exchange error:", error)
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
      }

      if (!data.user || !data.session) {
        console.error("❌ No user or session data after exchange")
        return NextResponse.redirect(new URL("/?error=no_session", requestUrl.origin))
      }

      console.log("✅ Session created for user:", data.user.email)

      // Ensure user profile exists in database
      try {
        const { data: existingProfile } = await supabase.from("users").select("id").eq("id", data.user.id).single()

        if (!existingProfile) {
          console.log("🔄 Creating user profile...")
          const profileData = {
            id: data.user.id,
            email: data.user.email!,
            full_name:
              data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email!.split("@")[0],
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
            email_verified: true,
            profile_completed: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: profileError } = await supabase.from("users").insert([profileData])

          if (profileError) {
            console.error("❌ Profile creation error:", profileError)
          } else {
            console.log("✅ User profile created")
          }
        } else {
          console.log("✅ User profile already exists")
          // Update last login
          await supabase
            .from("users")
            .update({
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", data.user.id)
        }
      } catch (profileError) {
        console.error("❌ Profile check/creation error:", profileError)
      }

      console.log("✅ Redirecting to:", next)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error("❌ Unexpected callback error:", error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin))
    }
  }

  console.log("❌ No code provided, redirecting to home")
  return NextResponse.redirect(new URL("/?error=no_code", requestUrl.origin))
}
