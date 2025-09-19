import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_BeEhCc1J_7xErHGLk3bqotzaoSSXJgEQU")

export interface EmailTemplate {
  subject: string
  html: string
}

export interface EmailNotification {
  id?: string
  user_id?: string
  email: string
  subject: string
  content: string
  type:
    | "welcome"
    | "event_registration"
    | "hackathon_registration"
    | "course_enrollment"
    | "job_application"
    | "admin_notification"
    | "password_reset"
    | "hackathon_reminder"
    | "course_reminder"
    | "bulk_announcement"
    | "platform_update"
  status: "pending" | "sent" | "failed"
  sent_at?: string
  error_message?: string
  created_at: string
}

// Email Templates
export const emailTemplates = {
  welcome: (userName: string): EmailTemplate => ({
    subject: "🎉 Welcome to Apna Coding - Your Coding Journey Starts Here!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px;">Welcome to Apna Coding! 🚀</h1>
          <p style="font-size: 18px; margin: 0 0 30px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Thank you for joining Apna Coding! We're excited to have you as part of our community of passionate developers and learners.
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">🎯 What's Next?</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Explore our latest events and workshops</li>
              <li>Join exciting hackathons and competitions</li>
              <li>Check out job opportunities from top companies</li>
              <li>Connect with fellow developers in our community</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/dashboard" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            Get Started Now 🎯
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            Happy Coding!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),

  eventRegistration: (
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
  ): EmailTemplate => ({
    subject: `🎉 Event Registration Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Congratulations! You've successfully registered for <strong>${eventTitle}</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">📅 Event Details</h3>
            <p style="margin: 0 0 10px 0;"><strong>Event:</strong> ${eventTitle}</p>
            <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="margin: 0;"><strong>Location:</strong> ${eventLocation}</p>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">🚀 Next Steps</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Add the event to your calendar</li>
              <li>Prepare any required materials</li>
              <li>Join our community for updates</li>
              <li>Arrive 15 minutes early</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/events" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Event Details 🎉
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            See you at the event!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),

  hackathonRegistration: (userName: string, hackathonTitle: string, hackathonDate: string): EmailTemplate => ({
    subject: `🏆 Hackathon Registration Confirmed: ${hackathonTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Congratulations! You've successfully registered for <strong>${hackathonTitle}</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">📅 Event Details</h3>
            <p style="margin: 0 0 10px 0;"><strong>Hackathon:</strong> ${hackathonTitle}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${hackathonDate}</p>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">🚀 Next Steps</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Join our WhatsApp group for updates</li>
              <li>Start forming your team</li>
              <li>Prepare your development environment</li>
              <li>Review the problem statements</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Hackathon Details 🏆
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            Good luck and happy coding!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),
}

// Send single email with enhanced error handling
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  type: EmailNotification["type"] = "admin_notification",
  userId?: string,
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    // Validate inputs
    if (!to || !subject || !html) {
      return { success: false, error: "Missing required fields: to, subject, html" }
    }

    console.log(`Sending ${type} email to ${to}...`)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Apna Coding <noreply@apnacoding.tech>",
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("Email error:", error)

      // Log failed email to database
      await logEmailNotification({
        user_id: userId,
        email: to,
        subject,
        content: html,
        type,
        status: "failed",
        error_message: error.message || "Unknown error",
        created_at: new Date().toISOString(),
      })

      return { success: false, error: error.message }
    }

    // Log successful email to database
    const emailLog = await logEmailNotification({
      user_id: userId,
      email: to,
      subject,
      content: html,
      type,
      status: "sent",
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    console.log(`Email sent successfully to ${to}:`, data)
    return { success: true, emailId: data?.id }
  } catch (err) {
    console.error("Email sending error:", err)

    // Log failed email to database
    await logEmailNotification({
      user_id: userId,
      email: to,
      subject,
      content: html,
      type,
      status: "failed",
      error_message: err instanceof Error ? err.message : "Unknown error",
      created_at: new Date().toISOString(),
    })

    return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

// Helper function to send welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string, userId?: string) {
  const template = emailTemplates.welcome(userName)
  return await sendEmail(userEmail, template.subject, template.html, "welcome", userId)
}

// Helper function to send event registration email
export async function sendEventRegistrationEmail(
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  userId?: string,
) {
  const template = emailTemplates.eventRegistration(userName, eventTitle, eventDate, eventLocation)
  return await sendEmail(userEmail, template.subject, template.html, "event_registration", userId)
}

// Helper function to send hackathon registration email
export async function sendHackathonRegistrationEmail(
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  hackathonDate: string,
  userId?: string,
) {
  const template = emailTemplates.hackathonRegistration(userName, hackathonTitle, hackathonDate)
  return await sendEmail(userEmail, template.subject, template.html, "hackathon_registration", userId)
}

// Database logging function
async function logEmailNotification(notification: Omit<EmailNotification, "id">) {
  try {
    // Import supabase here to avoid circular dependencies
    const { createClientComponentClient } = await import("./supabase-client")
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("email_notifications").insert([notification]).select().single()

    if (error) {
      console.error("Error logging email notification:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("Error in logEmailNotification:", err)
    return null
  }
}

// Get email notifications for admin dashboard
export async function getEmailNotifications(limit = 50) {
  try {
    const { createClientComponentClient } = await import("./supabase-client")
    const supabase = createClientComponentClient()

    const { data, error } = await supabase
      .from("email_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching email notifications:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Error in getEmailNotifications:", err)
    return []
  }
}
