import { Resend } from "resend"

const resend = new Resend("re_BeEhCc1J_7xErHGLk3bqotzaoSSXJgEQU")

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
    | "hackathon_registration"
    | "course_enrollment"
    | "job_application"
    | "admin_notification"
    | "password_reset"
    | "hackathon_reminder"
    | "course_reminder"
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
              <li>Explore our latest hackathons and competitions</li>
              <li>Browse premium courses and tutorials</li>
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

  hackathonRegistration: (userName: string, hackathonTitle: string, hackathonDate: string): EmailTemplate => ({
    subject: `🏆 Registration Confirmed: ${hackathonTitle}`,
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
            <p style="margin: 0 0 10px 0;"><strong>Event:</strong> ${hackathonTitle}</p>
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

  courseEnrollment: (userName: string, courseTitle: string, instructor: string): EmailTemplate => ({
    subject: `📚 Course Enrollment Confirmed: ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px;">📚 Course Enrollment Confirmed!</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Great choice! You've successfully enrolled in <strong>${courseTitle}</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">📖 Course Details</h3>
            <p style="margin: 0 0 10px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 0;"><strong>Instructor:</strong> ${instructor}</p>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">🎯 What's Included</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Comprehensive video lectures</li>
              <li>Hands-on coding exercises</li>
              <li>Real-world projects</li>
              <li>Certificate of completion</li>
              <li>Lifetime access to course materials</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/courses" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            Start Learning Now 🚀
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            Happy Learning!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),

  jobApplication: (userName: string, jobTitle: string, company: string): EmailTemplate => ({
    subject: `💼 Job Application Received: ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #2c3e50;">💼 Application Received!</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">📋 Application Details</h3>
            <p style="margin: 0 0 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin: 0;"><strong>Company:</strong> ${company}</p>
          </div>
          <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">⏰ What Happens Next?</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Our team will review your application</li>
              <li>You'll hear back within 3-5 business days</li>
              <li>If selected, we'll schedule an interview</li>
              <li>Keep an eye on your email for updates</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/jobs" style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View More Jobs 💼
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            Best of luck!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),

  adminNotification: (adminName: string, notificationType: string, details: string): EmailTemplate => ({
    subject: `🔔 Admin Alert: ${notificationType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px;">
          <h1 style="margin: 0 0 20px 0; font-size: 24px;">🔔 Admin Notification</h1>
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hi ${adminName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            You have a new admin notification: <strong>${notificationType}</strong>
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0;">📋 Details</h3>
            <p style="margin: 0; line-height: 1.6;">${details}</p>
          </div>
          <a href="https://apnacoding.tech/admin" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Admin Dashboard 🛠️
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            Team Apna Coding System
          </p>
        </div>
      </div>
    `,
  }),

  hackathonReminder: (userName: string, hackathonTitle: string, daysLeft: number): EmailTemplate => ({
    subject: `⏰ Reminder: ${hackathonTitle} starts in ${daysLeft} days!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #2c3e50;">⏰ Hackathon Reminder!</h1>
          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi ${userName},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Just a friendly reminder that <strong>${hackathonTitle}</strong> starts in <strong>${daysLeft} days</strong>!
          </p>
          <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">🚀 Final Preparations</h3>
            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
              <li>Finalize your team formation</li>
              <li>Set up your development environment</li>
              <li>Review the problem statements</li>
              <li>Join the WhatsApp group for updates</li>
            </ul>
          </div>
          <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Hackathon Details 🏆
          </a>
          <p style="font-size: 14px; margin: 30px 0 0 0; opacity: 0.8;">
            See you at the hackathon!<br>
            Team Apna Coding
          </p>
        </div>
      </div>
    `,
  }),
}

// Send single email
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  type: EmailNotification["type"] = "admin_notification",
  userId?: string,
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Apna Coding <onboarding@resend.dev>",
      to,
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

    console.log("Email sent successfully:", data)
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

// Send batch emails
export async function sendBatchEmails(
  emails: Array<{
    to: string
    subject: string
    html: string
    type?: EmailNotification["type"]
    userId?: string
  }>,
): Promise<{ success: boolean; results: Array<{ success: boolean; error?: string }> }> {
  try {
    const batchData = emails.map((email) => ({
      from: "Apna Coding <onboarding@resend.dev>",
      to: email.to,
      subject: email.subject,
      html: email.html,
    }))

    const { data, error } = await resend.batch.send(batchData)

    if (error) {
      console.error("Batch email error:", error)
      return { success: false, results: [{ success: false, error: error.message }] }
    }

    // Log all emails to database
    const results = await Promise.all(
      emails.map(async (email, index) => {
        try {
          await logEmailNotification({
            user_id: email.userId,
            email: email.to,
            subject: email.subject,
            content: email.html,
            type: email.type || "admin_notification",
            status: "sent",
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
          return { success: true }
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
        }
      }),
    )

    console.log("Batch emails sent successfully:", data)
    return { success: true, results }
  } catch (err) {
    console.error("Batch email sending error:", err)
    return {
      success: false,
      results: [{ success: false, error: err instanceof Error ? err.message : "Unknown error" }],
    }
  }
}

// Helper function to send welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string, userId?: string) {
  const template = emailTemplates.welcome(userName)
  return await sendEmail(userEmail, template.subject, template.html, "welcome", userId)
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

// Helper function to send course enrollment email
export async function sendCourseEnrollmentEmail(
  userEmail: string,
  userName: string,
  courseTitle: string,
  instructor: string,
  userId?: string,
) {
  const template = emailTemplates.courseEnrollment(userName, courseTitle, instructor)
  return await sendEmail(userEmail, template.subject, template.html, "course_enrollment", userId)
}

// Helper function to send job application email
export async function sendJobApplicationEmail(
  userEmail: string,
  userName: string,
  jobTitle: string,
  company: string,
  userId?: string,
) {
  const template = emailTemplates.jobApplication(userName, jobTitle, company)
  return await sendEmail(userEmail, template.subject, template.html, "job_application", userId)
}

// Helper function to send admin notification
export async function sendAdminNotification(
  adminEmail: string,
  adminName: string,
  notificationType: string,
  details: string,
) {
  const template = emailTemplates.adminNotification(adminName, notificationType, details)
  return await sendEmail(adminEmail, template.subject, template.html, "admin_notification")
}

// Helper function to send hackathon reminder
export async function sendHackathonReminder(
  userEmail: string,
  userName: string,
  hackathonTitle: string,
  daysLeft: number,
  userId?: string,
) {
  const template = emailTemplates.hackathonReminder(userName, hackathonTitle, daysLeft)
  return await sendEmail(userEmail, template.subject, template.html, "hackathon_reminder", userId)
}

// Database logging function (will be implemented with Supabase)
async function logEmailNotification(notification: Omit<EmailNotification, "id">) {
  try {
    // Import supabase here to avoid circular dependencies
    const { supabase } = await import("./supabase")

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
    const { supabase } = await import("./supabase")

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

// Get email statistics
export async function getEmailStats() {
  try {
    const { supabase } = await import("./supabase")

    const [totalResult, sentResult, failedResult, todayResult] = await Promise.all([
      supabase.from("email_notifications").select("id", { count: "exact" }),
      supabase.from("email_notifications").select("id", { count: "exact" }).eq("status", "sent"),
      supabase.from("email_notifications").select("id", { count: "exact" }).eq("status", "failed"),
      supabase
        .from("email_notifications")
        .select("id", { count: "exact" })
        .gte("created_at", new Date().toISOString().split("T")[0]),
    ])

    return {
      total: totalResult.count || 0,
      sent: sentResult.count || 0,
      failed: failedResult.count || 0,
      today: todayResult.count || 0,
      success_rate: totalResult.count ? Math.round(((sentResult.count || 0) / totalResult.count) * 100) : 0,
    }
  } catch (err) {
    console.error("Error in getEmailStats:", err)
    return {
      total: 0,
      sent: 0,
      failed: 0,
      today: 0,
      success_rate: 0,
    }
  }
}
