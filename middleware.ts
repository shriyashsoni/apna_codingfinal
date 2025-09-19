import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  console.log("🔍 Middleware check:", {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userEmail: session?.user?.email,
    error: error?.message,
  })

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Admin routes that require admin role
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!session) {
      console.log("❌ No session, redirecting to login")
      const redirectUrl = new URL("/", req.url)
      redirectUrl.searchParams.set("auth", "login")
      redirectUrl.searchParams.set("message", "Please sign in to access this page")
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin access for admin routes
    if (isAdminRoute) {
      try {
        const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (!userProfile || (userProfile.role !== "admin" && session.user.email !== "sonishriyash@gmail.com")) {
          console.log("❌ Not admin, redirecting to dashboard")
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } catch (error) {
        console.error("❌ Error checking admin status:", error)
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && req.nextUrl.pathname === "/" && req.nextUrl.searchParams.has("auth")) {
    console.log("✅ User already authenticated, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
