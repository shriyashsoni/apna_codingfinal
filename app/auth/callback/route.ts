import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Ignore cookie errors in Route Handler
            }
          },
        },
      },
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }

    if (data.user) {
      // Ensure user profile exists in database
      try {
        const { data: existingProfile } = await supabase.from("users").select("id").eq("id", data.user.id).single()

        if (!existingProfile) {
          // Create user profile
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name:
              data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email!.split("@")[0],
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError && profileError.code !== "23505") {
            console.error("Profile creation error:", profileError)
          }
        }
      } catch (profileError) {
        console.error("Profile check/creation error:", profileError)
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/?error=no_code", requestUrl.origin))
}
