import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, html, type = "admin_notification", userId } = body

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 })
    }

    const result = await sendEmail(to, subject, html, type, userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        emailId: result.emailId,
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
