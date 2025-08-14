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
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
      }

      if (data.user) {
        // Create user profile if it doesn't exist
        const { data: existingProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || "",
            role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
          }
        }

        // Redirect to dashboard on successful authentication
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error("Unexpected error during auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/?error=auth_error`)
    }
  }

  // Redirect to home if no code or other issues
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
