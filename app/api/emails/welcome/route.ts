import { type NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, userId } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields: email, name" }, { status: 400 })
    }

    const result = await sendWelcomeEmail(email, name, userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to send welcome email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Welcome email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
