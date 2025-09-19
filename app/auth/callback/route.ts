import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
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
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

        // Successful authentication - redirect to dashboard
        console.log("✅ Redirecting to dashboard...")
        return NextResponse.redirect(new URL("/dashboard", request.url))
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
