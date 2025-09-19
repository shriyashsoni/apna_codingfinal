import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("🔄 Auth callback received:", { code: !!code, error, errorDescription })

  if (error) {
    console.error("❌ Auth callback error:", error, errorDescription)
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url))
  }

  if (code) {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      console.log("🔄 Exchanging code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("❌ Code exchange error:", exchangeError)
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, request.url))
      }

      if (data.user) {
        console.log("✅ User authenticated:", data.user.email)

        try {
          // Check if user profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
            console.log("🔄 Creating user profile...")
            const profileData = {
              id: data.user.id,
              email: data.user.email!,
              full_name:
                data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email!.split("@")[0],
              avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
              role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
              email_verified: true,
              profile_completed: true,
              last_login: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            const { error: insertError } = await supabase.from("users").insert([profileData])

            if (insertError) {
              console.error("⚠️ Profile creation error (non-blocking):", insertError)
            } else {
              console.log("✅ User profile created successfully")
            }
          } else if (!profileError) {
            // Profile exists, update last login
            console.log("🔄 Updating last login...")
            await supabase
              .from("users")
              .update({
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.user.id)
          }

          // Send welcome email for new users (non-blocking)
          if (profileError && profileError.code === "PGRST116") {
            try {
              console.log("🔄 Sending welcome email...")
              const response = await fetch(`${requestUrl.origin}/api/emails/welcome`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: data.user.email,
                  name:
                    data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name ||
                    data.user.email!.split("@")[0],
                  userId: data.user.id,
                }),
              })

              if (response.ok) {
                console.log("✅ Welcome email sent successfully")
              }
            } catch (emailError) {
              console.error("⚠️ Welcome email error (non-blocking):", emailError)
            }
          }
        } catch (profileError) {
          console.error("⚠️ Profile management error (non-blocking):", profileError)
        }

        // Create response with proper session cookies
        const response = NextResponse.redirect(new URL("/dashboard", request.url))

        // Set session cookies for client-side access
        if (data.session) {
          // Set access token cookie
          response.cookies.set("sb-access-token", data.session.access_token, {
            path: "/",
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: data.session.expires_in || 3600,
          })

          // Set refresh token cookie
          response.cookies.set("sb-refresh-token", data.session.refresh_token, {
            path: "/",
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          })

          // Set user session info
          response.cookies.set(
            "sb-user",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              expires_at: data.session.expires_at,
            }),
            {
              path: "/",
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: data.session.expires_in || 3600,
            },
          )
        }

        console.log("✅ Redirecting to dashboard with session cookies set")
        return response
      }
    } catch (error) {
      console.error("❌ Auth callback error:", error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Authentication failed")}`, request.url))
    }
  }

  // Fallback redirect
  console.log("⚠️ No code provided, redirecting to home")
  return NextResponse.redirect(new URL("/", request.url))
}
