import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  console.log("🔄 Auth callback received:", { code: !!code, next })

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

      if (data.user) {
        console.log("✅ Session created for user:", data.user.email)

        // Ensure user profile exists in database
        try {
          const { data: existingProfile } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", data.user.id)
            .single()

          if (!existingProfile) {
            console.log("🔄 Creating user profile...")
            const { error: profileError } = await supabase.from("users").insert({
              auth_user_id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
              avatar_url: data.user.user_metadata?.avatar_url,
              role: "user",
            })

            if (profileError) {
              console.error("❌ Profile creation error:", profileError)
            } else {
              console.log("✅ User profile created")
            }
          } else {
            console.log("✅ User profile already exists")
          }
        } catch (profileError) {
          console.error("❌ Profile check/creation error:", profileError)
        }

        // Set session cookies manually to ensure they persist
        const maxAge = 60 * 60 * 24 * 7 // 7 days
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))

        // Set auth cookies
        if (data.session) {
          response.cookies.set("sb-access-token", data.session.access_token, {
            maxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          })

          response.cookies.set("sb-refresh-token", data.session.refresh_token, {
            maxAge,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          })
        }

        console.log("✅ Redirecting to:", next)
        return response
      }
    } catch (error) {
      console.error("❌ Unexpected callback error:", error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin))
    }
  }

  console.log("❌ No code provided, redirecting to home")
  return NextResponse.redirect(new URL("/?error=no_code", requestUrl.origin))
}
