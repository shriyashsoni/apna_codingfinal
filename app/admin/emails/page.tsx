"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser, type User, getSession } from "@/lib/supabase"
import type { EmailNotification } from "@/lib/email"
import {
  Mail,
  Send,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  Users,
  Megaphone,
  Rocket,
  Globe,
} from "lucide-react"

interface EmailStats {
  total: number
  sent: number
  failed: number
  today: number
  success_rate: number
}

interface BulkEmailResult {
  success: boolean
  totalUsers: number
  successCount: number
  failureCount: number
  message: string
}

export default function AdminEmailsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [userCount, setUserCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const router = useRouter()

  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    html: "",
    type: "admin_notification" as EmailNotification["type"],
  })

  // Bulk email form state
  const [bulkEmailForm, setBulkEmailForm] = useState({
    type: "bulk_announcement" as "bulk_announcement" | "platform_update" | "custom",
    subject: "",
    html: "",
    title: "",
    message: "",
    updateTitle: "",
    updateDetails: "",
  })

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const getAuthHeaders = useCallback(async () => {
    try {
      const session = await getSession()
      if (session?.access_token) {
        return {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        }
      }
      return {
        "Content-Type": "application/json",
      }
    } catch (error) {
      console.error("Error getting auth headers:", error)
      return {
        "Content-Type": "application/json",
      }
    }
  }, [])

  const loadEmailData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check authentication first
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      if (currentUser.role !== "admin" && currentUser.email !== "sonishriyash@gmail.com") {
        router.push("/dashboard")
        return
      }

      setUser(currentUser)

      // Get auth headers
      const headers = await getAuthHeaders()

      // Load email notifications, stats, and user count
      try {
        const [notificationsResponse, statsResponse, userCountResponse] = await Promise.all([
          fetch("/api/emails/notifications", {
            method: "GET",
            headers,
          }),
          fetch("/api/emails/notifications?stats=true", {
            method: "GET",
            headers,
          }),
          fetch("/api/emails/user-count", {
            method: "GET",
            headers,
          }),
        ])

        // Handle notifications response
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(Array.isArray(notificationsData) ? notificationsData : [])
        } else {
          const errorData = await notificationsResponse.json().catch(() => ({ error: "Failed to parse response" }))
          console.error("Failed to load notifications:", errorData)
          setNotifications([])
          if (notificationsResponse.status === 401) {
            setError("Authentication failed. Please log in again.")
            router.push("/")
            return
          }
        }

        // Handle stats response
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          const errorData = await statsResponse.json().catch(() => ({ error: "Failed to parse response" }))
          console.error("Failed to load stats:", errorData)
          setStats({
            total: 0,
            sent: 0,
            failed: 0,
            today: 0,
            success_rate: 0,
          })
        }

        // Handle user count response
        if (userCountResponse.ok) {
          const userCountData = await userCountResponse.json()
          setUserCount(userCountData.userCount || 0)
        } else {
          console.error("Failed to load user count")
          setUserCount(0)
        }
      } catch (fetchError) {
        console.error("Error fetching email data:", fetchError)
        setError("Failed to load email data. Please check your connection and try again.")
        setNotifications([])
        setStats({
          total: 0,
          sent: 0,
          failed: 0,
          today: 0,
          success_rate: 0,
        })
        setUserCount(0)
      }
    } catch (error) {
      console.error("Error loading email data:", error)
      setError("Failed to load email management page. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [router, getAuthHeaders])

  useEffect(() => {
    loadEmailData()
  }, [loadEmailData])

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingEmail(true)
    clearMessages()

    try {
      // Validate form data
      if (!emailForm.to || !emailForm.subject || !emailForm.html) {
        setError("Please fill in all required fields")
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailForm.to)) {
        setError("Please enter a valid email address")
        return
      }

      // Get auth headers
      const headers = await getAuthHeaders()

      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers,
        body: JSON.stringify(emailForm),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage("Email sent successfully!")
        setEmailForm({
          to: "",
          subject: "",
          html: "",
          type: "admin_notification",
        })
        // Refresh the notifications list
        await loadEmailData()
      } else {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.")
          router.push("/")
          return
        }
        setError(`Failed to send email: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setError("Error sending email. Please check your connection and try again.")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendBulkEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingBulkEmail(true)
    clearMessages()

    try {
      // Validate form data based on type
      if (bulkEmailForm.type === "bulk_announcement") {
        if (!bulkEmailForm.title || !bulkEmailForm.message) {
          setError("Please fill in title and message for bulk announcement")
          return
        }
      } else if (bulkEmailForm.type === "platform_update") {
        if (!bulkEmailForm.updateTitle || !bulkEmailForm.updateDetails) {
          setError("Please fill in update title and details for platform update")
          return
        }
      } else if (bulkEmailForm.type === "custom") {
        if (!bulkEmailForm.subject || !bulkEmailForm.html) {
          setError("Please fill in subject and HTML content for custom email")
          return
        }
      }

      // Confirm bulk email send
      const confirmMessage = `Are you sure you want to send this email to all ${userCount} platform users? This action cannot be undone.`
      if (!window.confirm(confirmMessage)) {
        setSendingBulkEmail(false)
        return
      }

      // Get auth headers
      const headers = await getAuthHeaders()

      const response = await fetch("/api/emails/bulk-all", {
        method: "POST",
        headers,
        body: JSON.stringify(bulkEmailForm),
      })

      const result: BulkEmailResult = await response.json()

      if (result.success) {
        setSuccessMessage(`Bulk email sent successfully! ${result.successCount}/${result.totalUsers} emails delivered.`)
        setBulkEmailForm({
          type: "bulk_announcement",
          subject: "",
          html: "",
          title: "",
          message: "",
          updateTitle: "",
          updateDetails: "",
        })
        // Refresh the notifications list
        await loadEmailData()
      } else {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.")
          router.push("/")
          return
        }
        setError(`Failed to send bulk email: ${result.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error sending bulk email:", error)
      setError("Error sending bulk email. Please check your connection and try again.")
    } finally {
      setSendingBulkEmail(false)
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
        <div className="text-white text-xl flex items-center">
          <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
          Loading email management...
        </div>
      </div>
    )
  }

  if (!user || (user.role !== "admin" && user.email !== "sonishriyash@gmail.com")) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-4">Access denied. Admin privileges required.</div>
          <Button onClick={() => router.push("/dashboard")} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            Go to Dashboard
          </Button>
        </div>
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

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="sm"
              className="ml-auto text-red-200 hover:text-red-100"
            >
              ×
            </Button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-200">{successMessage}</span>
            <Button
              onClick={clearMessages}
              variant="ghost"
              size="sm"
              className="ml-auto text-green-200 hover:text-green-100"
            >
              ×
            </Button>
          </div>
        )}

        {/* Email Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
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

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Platform Users</p>
                  <p className="text-2xl font-bold text-purple-400">{userCount}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-900/50 p-1 rounded-lg w-fit">
          <Button
            onClick={() => setActiveTab("single")}
            className={`${
              activeTab === "single" ? "bg-yellow-400 text-black" : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Single Email
          </Button>
          <Button
            onClick={() => setActiveTab("bulk")}
            className={`${
              activeTab === "bulk" ? "bg-yellow-400 text-black" : "bg-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4 mr-2" />
            Bulk Email to All Users
          </Button>
        </div>

        {activeTab === "single" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Send Single Email Form */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="w-5 h-5 mr-2 text-yellow-400" />
                  Send Single Email
                </CardTitle>
                <CardDescription className="text-gray-400">Send individual emails to specific users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="to" className="text-white">
                      To Email *
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
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, type: e.target.value as EmailNotification["type"] })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                      Subject *
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
                      HTML Content *
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
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold disabled:opacity-50"
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
                      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
                        <div style="padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0 0 20px 0; font-size: 28px;">Welcome to Apna Coding! 🚀</h1>
                          <p style="font-size: 18px; margin: 0 0 30px 0;">Hi there,</p>
                          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Thank you for joining Apna Coding! We're excited to have you as part of our community.
                          </p>
                          <a href="https://apnacoding.tech/dashboard" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            Get Started Now 🎯
                          </a>
                        </div>
                      </div>`,
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
                      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; border-radius: 10px; overflow: hidden;">
                        <div style="padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
                          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi there,</p>
                          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            You've successfully registered for the hackathon.
                          </p>
                          <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            View Details 🏆
                          </a>
                        </div>
                      </div>`,
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
                      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%); color: white; border-radius: 10px; overflow: hidden;">
                        <div style="padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0 0 20px 0; font-size: 28px;">📚 Course Enrollment!</h1>
                          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi there,</p>
                          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            You've successfully enrolled in the course.
                          </p>
                          <a href="https://apnacoding.tech/courses" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            Start Learning 📖
                          </a>
                        </div>
                      </div>`,
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
                      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; border-radius: 10px; overflow: hidden;">
                        <div style="padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0 0 20px 0; font-size: 28px;">⏰ Reminder!</h1>
                          <p style="font-size: 18px; margin: 0 0 20px 0;">Hi there,</p>
                          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Don't forget about the upcoming hackathon.
                          </p>
                          <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            View Details ⚡
                          </a>
                        </div>
                      </div>`,
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
        ) : (
          /* Bulk Email Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bulk Email Form */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-yellow-400" />
                  Send to All Platform Users
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Send emails to all {userCount} registered users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendBulkEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="bulkType" className="text-white">
                      Email Type *
                    </Label>
                    <select
                      id="bulkType"
                      value={bulkEmailForm.type}
                      onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, type: e.target.value as any })}
                      className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="bulk_announcement">📢 Bulk Announcement</option>
                      <option value="platform_update">🚀 Platform Update</option>
                      <option value="custom">✏️ Custom Email</option>
                    </select>
                  </div>

                  {bulkEmailForm.type === "bulk_announcement" && (
                    <>
                      <div>
                        <Label htmlFor="title" className="text-white">
                          Announcement Title *
                        </Label>
                        <Input
                          id="title"
                          value={bulkEmailForm.title}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, title: e.target.value })}
                          placeholder="Important announcement title"
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-white">
                          Announcement Message *
                        </Label>
                        <Textarea
                          id="message"
                          value={bulkEmailForm.message}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, message: e.target.value })}
                          placeholder="Your announcement message..."
                          rows={6}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </>
                  )}

                  {bulkEmailForm.type === "platform_update" && (
                    <>
                      <div>
                        <Label htmlFor="updateTitle" className="text-white">
                          Update Title *
                        </Label>
                        <Input
                          id="updateTitle"
                          value={bulkEmailForm.updateTitle}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, updateTitle: e.target.value })}
                          placeholder="New feature or update title"
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="updateDetails" className="text-white">
                          Update Details *
                        </Label>
                        <Textarea
                          id="updateDetails"
                          value={bulkEmailForm.updateDetails}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, updateDetails: e.target.value })}
                          placeholder="Detailed description of the update..."
                          rows={6}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </>
                  )}

                  {bulkEmailForm.type === "custom" && (
                    <>
                      <div>
                        <Label htmlFor="bulkSubject" className="text-white">
                          Subject *
                        </Label>
                        <Input
                          id="bulkSubject"
                          value={bulkEmailForm.subject}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, subject: e.target.value })}
                          placeholder="Email subject"
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bulkHtml" className="text-white">
                          HTML Content *
                        </Label>
                        <Textarea
                          id="bulkHtml"
                          value={bulkEmailForm.html}
                          onChange={(e) => setBulkEmailForm({ ...bulkEmailForm, html: e.target.value })}
                          placeholder="HTML email content... Use {userName} for personalization"
                          rows={8}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                        <p className="text-gray-400 text-sm mt-1">
                          Tip: Use {"{userName}"} in your content to personalize emails
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-yellow-400 font-semibold">Warning</span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      This will send an email to all {userCount} registered users. This action cannot be undone. Please
                      review your content carefully before sending.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={sendingBulkEmail}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50"
                  >
                    {sendingBulkEmail ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Sending to {userCount} users...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Send to All {userCount} Users
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bulk Email Templates */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-yellow-400" />
                  Bulk Email Templates
                </CardTitle>
                <CardDescription className="text-gray-400">Quick templates for bulk communications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() =>
                    setBulkEmailForm({
                      ...bulkEmailForm,
                      type: "bulk_announcement",
                      title: "Important Platform Announcement",
                      message:
                        "We have some exciting news to share with our community! Stay tuned for more updates and continue building amazing projects with us.",
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  General Announcement
                </Button>

                <Button
                  onClick={() =>
                    setBulkEmailForm({
                      ...bulkEmailForm,
                      type: "platform_update",
                      updateTitle: "New Features Released",
                      updateDetails:
                        "We've added new features to enhance your coding experience:\n\n• Improved dashboard with better analytics\n• New course recommendations\n• Enhanced hackathon discovery\n• Better job matching algorithm\n\nExplore these features in your dashboard!",
                    })
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Platform Update
                </Button>

                <Button
                  onClick={() =>
                    setBulkEmailForm({
                      ...bulkEmailForm,
                      type: "bulk_announcement",
                      title: "New Hackathon Alert",
                      message:
                        "🏆 Exciting news! We've just added new hackathons with amazing prizes and opportunities. Don't miss out on these incredible competitions that could boost your career!\n\nCheck out the latest hackathons and register now to secure your spot.",
                    })
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  🏆 Hackathon Alert
                </Button>

                <Button
                  onClick={() =>
                    setBulkEmailForm({
                      ...bulkEmailForm,
                      type: "bulk_announcement",
                      title: "New Courses Available",
                      message:
                        "📚 We've just launched new courses covering the latest technologies and industry trends. Whether you're a beginner or looking to advance your skills, we have something for everyone!\n\nExplore our new course catalog and start learning today.",
                    })
                  }
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  📚 New Courses
                </Button>

                <Button
                  onClick={() =>
                    setBulkEmailForm({
                      ...bulkEmailForm,
                      type: "custom",
                      subject: "🎉 Thank You for Being Part of Apna Coding",
                      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
                        <div style="padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0 0 20px 0; font-size: 28px;">Thank You, {userName}! 🎉</h1>
                          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            We wanted to take a moment to thank you for being part of the Apna Coding community. Your participation and engagement make our platform better every day.
                          </p>
                          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 30px 0;">
                            <h3 style="margin: 0 0 15px 0;">🚀 Keep Growing</h3>
                            <p style="margin: 0; line-height: 1.6;">Continue exploring new opportunities, learning new skills, and connecting with fellow developers. The best is yet to come!</p>
                          </div>
                          <a href="https://apnacoding.tech/dashboard" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            Visit Your Dashboard 🎯
                          </a>
                        </div>
                      </div>`,
                    })
                  }
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  💝 Thank You Message
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Notifications List */}
        <Card className="bg-gray-900/50 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                Email Notifications
              </div>
              <Button onClick={loadEmailData} className="bg-gray-700 hover:bg-gray-600 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
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
                className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Types</option>
                <option value="welcome">Welcome</option>
                <option value="hackathon_registration">Hackathon Registration</option>
                <option value="course_enrollment">Course Enrollment</option>
                <option value="job_application">Job Application</option>
                <option value="admin_notification">Admin Notification</option>
                <option value="hackathon_reminder">Hackathon Reminder</option>
                <option value="bulk_announcement">Bulk Announcement</option>
                <option value="platform_update">Platform Update</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-400"
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
                <div className="text-center py-8 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No email notifications found</p>
                  <p className="text-sm mt-2">Try adjusting your search filters</p>
                </div>
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
