import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/admin", "/profile"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Admin routes that require admin role
    const adminRoutes = ["/admin"]
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      // Redirect to home page if not authenticated
      const redirectUrl = new URL("/", req.url)
      redirectUrl.searchParams.set("error", "authentication_required")
      return NextResponse.redirect(redirectUrl)
    }

    if (isAdminRoute && session) {
      // Check if user is admin
      const { data: user } = await supabase.from("users").select("role, email").eq("id", session.user.id).single()

      if (!user || (user.role !== "admin" && user.email !== "sonishriyash@gmail.com")) {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
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
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
