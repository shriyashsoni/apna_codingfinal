import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback - Code:", !!code, "Error:", error)

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`,
    )
  }

  if (!code) {
    console.error("No authorization code provided")
    return NextResponse.redirect(`${requestUrl.origin}/?error=no_code`)
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  try {
    // Exchange code for session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Session exchange error:", sessionError)
      return NextResponse.redirect(
        `${requestUrl.origin}/?error=session_error&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    if (!sessionData.user) {
      console.error("No user data after session exchange")
      return NextResponse.redirect(`${requestUrl.origin}/?error=no_user`)
    }

    console.log("User authenticated:", sessionData.user.email)

    // Check if user profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", sessionData.user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("Profile check error:", profileCheckError)
    }

    // Create or update user profile if needed
    if (!existingProfile) {
      console.log("Creating new user profile for:", sessionData.user.email)

      const profileData = {
        id: sessionData.user.id,
        email: sessionData.user.email!,
        full_name:
          sessionData.user.user_metadata?.full_name ||
          sessionData.user.user_metadata?.name ||
          sessionData.user.email?.split("@")[0] ||
          "User",
        avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || null,
        role: sessionData.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
        email_verified: true,
        profile_completed: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase.from("users").upsert([profileData], {
        onConflict: "id",
        ignoreDuplicates: false,
      })

      if (insertError) {
        console.error("Profile creation error:", insertError)
        // Don't fail the auth process, just log the error
      } else {
        console.log("Profile created successfully")
      }
    } else {
      // Update last login for existing users
      console.log("Updating last login for existing user:", existingProfile.email)

      const { error: updateError } = await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_verified: true,
        })
        .eq("id", sessionData.user.id)

      if (updateError) {
        console.error("Last login update error:", updateError)
      }
    }

    // Set cookies for the session
    const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

    // Set session cookies
    if (sessionData.session) {
      response.cookies.set("sb-access-token", sessionData.session.access_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionData.session.expires_in,
      })

      response.cookies.set("sb-refresh-token", sessionData.session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    console.log("Redirecting to dashboard")
    return response
  } catch (error) {
    console.error("Unexpected auth callback error:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/?error=unexpected_error&message=${encodeURIComponent(String(error))}`,
    )
  }
}
