"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser, type User } from "@/lib/supabase"
import type { EmailNotification } from "@/lib/email"
import { Mail, Send, TrendingUp, AlertCircle, CheckCircle, Clock, Search } from "lucide-react"

interface EmailStats {
  total: number
  sent: number
  failed: number
  today: number
  success_rate: number
}

export default function AdminEmailsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const router = useRouter()

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    html: "",
    type: "admin_notification" as EmailNotification["type"],
  })

  useEffect(() => {
    loadEmailData()
  }, [])

  const loadEmailData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      if (currentUser.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setUser(currentUser)

      // Load email notifications and stats
      const [notificationsData, statsData] = await Promise.all([
        fetch("/api/emails/notifications").then((res) => res.json()),
        fetch("/api/emails/notifications?stats=true").then((res) => res.json()),
      ])

      setNotifications(notificationsData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading email data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingEmail(true)

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailForm),
      })

      const result = await response.json()

      if (result.success) {
        alert("Email sent successfully!")
        setEmailForm({
          to: "",
          subject: "",
          html: "",
          type: "admin_notification",
        })
        loadEmailData() // Refresh the notifications list
      } else {
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Error sending email")
    } finally {
      setSendingEmail(false)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus = filterStatus === "all" || notification.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading email management...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Access denied. Admin privileges required.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📧 Email <span className="text-yellow-400">Management</span> 📬
          </h1>
          <p className="text-gray-300 text-lg">Manage email notifications and campaigns</p>
        </div>

        {/* Email Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Emails</p>
                  <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sent Successfully</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.sent || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{stats?.failed || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-blue-400">{stats?.today || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.success_rate || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Email Form */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-yellow-400" />
                Send Email
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send individual emails to users or administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="to" className="text-white">
                    To Email
                  </Label>
                  <Input
                    id="to"
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-white">
                    Email Type
                  </Label>
                  <select
                    id="type"
                    value={emailForm.type}
                    onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value as EmailNotification["type"] })}
                    className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md"
                  >
                    <option value="admin_notification">Admin Notification</option>
                    <option value="welcome">Welcome Email</option>
                    <option value="hackathon_registration">Hackathon Registration</option>
                    <option value="course_enrollment">Course Enrollment</option>
                    <option value="job_application">Job Application</option>
                    <option value="hackathon_reminder">Hackathon Reminder</option>
                    <option value="course_reminder">Course Reminder</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    placeholder="Email subject"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="html" className="text-white">
                    HTML Content
                  </Label>
                  <Textarea
                    id="html"
                    value={emailForm.html}
                    onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
                    placeholder="HTML email content..."
                    rows={8}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sendingEmail}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                >
                  {sendingEmail ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Templates */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                Quick Templates
              </CardTitle>
              <CardDescription className="text-gray-400">Use pre-built email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    subject: "🎉 Welcome to Apna Coding!",
                    html: `<h1>Welcome!</h1><p>Thank you for joining Apna Coding. We're excited to have you!</p>`,
                    type: "welcome",
                  })
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Welcome Email Template
              </Button>

              <Button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    subject: "🏆 Hackathon Registration Confirmed",
                    html: `<h1>Registration Confirmed!</h1><p>You've successfully registered for the hackathon.</p>`,
                    type: "hackathon_registration",
                  })
                }
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Hackathon Registration Template
              </Button>

              <Button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    subject: "📚 Course Enrollment Confirmed",
                    html: `<h1>Course Enrollment!</h1><p>You've successfully enrolled in the course.</p>`,
                    type: "course_enrollment",
                  })
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Course Enrollment Template
              </Button>

              <Button
                onClick={() =>
                  setEmailForm({
                    ...emailForm,
                    subject: "⏰ Hackathon Reminder",
                    html: `<h1>Reminder!</h1><p>Don't forget about the upcoming hackathon.</p>`,
                    type: "hackathon_reminder",
                  })
                }
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Reminder Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Email Notifications List */}
        <Card className="bg-gray-900/50 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                Email Notifications
              </div>
              <Button onClick={loadEmailData} className="bg-gray-700 hover:bg-gray-600 text-white">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-400">
              View all sent email notifications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md"
              >
                <option value="all">All Types</option>
                <option value="welcome">Welcome</option>
                <option value="hackathon_registration">Hackathon Registration</option>
                <option value="course_enrollment">Course Enrollment</option>
                <option value="job_application">Job Application</option>
                <option value="admin_notification">Admin Notification</option>
                <option value="hackathon_reminder">Hackathon Reminder</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Notifications List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No email notifications found</div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div key={notification.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={`${
                              notification.status === "sent"
                                ? "bg-green-500 text-white"
                                : notification.status === "failed"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-black"
                            }`}
                          >
                            {notification.status}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {notification.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{notification.subject}</h4>
                        <p className="text-gray-400 text-sm mb-2">To: {notification.email}</p>
                        <p className="text-gray-500 text-xs">
                          {notification.sent_at
                            ? `Sent: ${new Date(notification.sent_at).toLocaleString()}`
                            : `Created: ${new Date(notification.created_at).toLocaleString()}`}
                        </p>
                        {notification.error_message && (
                          <p className="text-red-400 text-xs mt-1">Error: {notification.error_message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
