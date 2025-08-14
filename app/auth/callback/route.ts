import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.user) {
        // Create or update user profile in database
        const { error: profileError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email!,
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              "",
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        // Redirect to dashboard on successful authentication
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error("Unexpected auth error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=unexpected_error`)
    }
  }

  // Redirect to home page if no code or other issues
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
