import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase"
import { sendBatchEmails } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const body = await request.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Invalid emails array" }, { status: 400 })
    }

    // Validate each email object
    for (const email of emails) {
      if (!email.to || !email.subject || !email.html) {
        return NextResponse.json({ error: "Each email must have to, subject, and html fields" }, { status: 400 })
      }
    }

    const result = await sendBatchEmails(emails)

    return NextResponse.json({
      success: result.success,
      results: result.results,
      message: `Batch email operation completed. ${result.results.filter((r) => r.success).length}/${emails.length} emails sent successfully.`,
    })
  } catch (error) {
    console.error("Batch email API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
