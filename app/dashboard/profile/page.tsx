"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Github, Linkedin, Save, Loader2, CheckCircle, AlertCircle, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getUserProfile, updateUserProfile, getUserOrganizerStatus } from "@/lib/supabase"
import { getOrganizerRoles } from "@/lib/permissions"
import type { User as UserType } from "@/lib/supabase"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [organizerStatus, setOrganizerStatus] = useState<{ is_organizer: boolean; organizer_types: string[] }>({
    is_organizer: false,
    organizer_types: [],
  })
  const [organizerRoles, setOrganizerRoles] = useState<any[]>([])
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    skills: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        window.location.href = "/"
        return
      }

      setUser(currentUser)
      const { data: profileData, error } = await getUserProfile(currentUser.id)

      if (error) {
        console.error("Error loading profile:", error)
        setMessage({ type: "error", text: "Failed to load profile data" })
      } else if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          bio: profileData.bio || "",
          github_url: profileData.github_url || "",
          linkedin_url: profileData.linkedin_url || "",
          skills: profileData.skills || [],
        })
      } else {
        // Profile is null but no error, means it doesn't exist yet.
        // Form will be empty, ready for creation on first save.
        setFormData({
          full_name: currentUser.user_metadata?.full_name || currentUser.full_name || "",
          bio: "",
          github_url: "",
          linkedin_url: "",
          skills: [],
        })
      }

      // Load organizer status
      const orgStatus = await getUserOrganizerStatus(currentUser.id)
      setOrganizerStatus(orgStatus)

      // Load organizer roles for detailed display
      const { data: roles } = await getOrganizerRoles(currentUser.id)
      setOrganizerRoles(roles || [])
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { data, error } = await updateUserProfile(user.id, {
        full_name: formData.full_name,
        bio: formData.bio,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        skills: formData.skills,
      })

      if (error) {
        console.error("Update error:", error)
        setMessage({ type: "error", text: "Failed to update profile: " + error.message })
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        // Reload profile data to get the latest
        await loadUserData()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setSaving(false)
    }
  }

  const calculateProfileCompletion = () => {
    const fields = [
      formData.full_name,
      formData.bio,
      formData.github_url,
      formData.linkedin_url,
      formData.skills.length > 0 ? "skills" : "",
    ]
    const completedFields = fields.filter((field) => !!field).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "Hackathon Organizer"
      case "course_instructor":
        return "Course Instructor"
      case "job_poster":
        return "Job Poster"
      default:
        return roleName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "hackathon_organizer":
        return "🏆"
      case "course_instructor":
        return "📚"
      case "job_poster":
        return "💼"
      default:
        return "👑"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Profile <span className="text-purple-400">Settings</span>
              </h1>
              <p className="text-gray-300">Manage your account information and preferences</p>
            </div>

            {/* User Status & Organizer Badge */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {formData.full_name || user?.email?.split("@")[0]}
                        {user?.role === "admin" && (
                          <Badge className="bg-yellow-400 text-black">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {organizerStatus.is_organizer && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Organizer
                          </Badge>
                        )}
                      </h3>
                      <p className="text-gray-400">{user?.email}</p>
                      {organizerStatus.is_organizer && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {organizerRoles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="outline"
                              className="border-purple-400 text-purple-400 text-xs"
                            >
                              {getRoleIcon(role.role_name)} {getRoleDisplayName(role.role_name)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">{profileCompletion}%</div>
                    <div className="text-sm text-gray-400">Complete</div>
                  </div>
                </div>

                {/* Organizer Privileges Display */}
                {organizerStatus.is_organizer && (
                  <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4 mt-4">
                    <h4 className="text-purple-400 font-semibold mb-2 flex items-center">
                      <Crown className="w-4 h-4 mr-2" />🎉 Organizer Privileges
                    </h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      {organizerRoles.map((role) => (
                        <div key={role.id} className="flex items-center gap-2">
                          <span>{getRoleIcon(role.role_name)}</span>
                          <span>
                            You can manage{" "}
                            {role.role_name === "hackathon_organizer"
                              ? "Hackathons"
                              : role.role_name === "course_instructor"
                                ? "Courses"
                                : "Job Listings"}
                          </span>
                        </div>
                      ))}
                      <p className="text-xs text-purple-300 mt-2">✨ These privileges were granted by an Admin</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
                  <span className="text-purple-400 font-bold">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Complete your profile to get better job recommendations and networking opportunities
                </p>
              </CardContent>
            </Card>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                  message.type === "success"
                    ? "bg-green-900/50 border border-green-700 text-green-400"
                    : "bg-red-900/50 border border-red-700 text-red-400"
                }`}
              >
                {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </motion.div>
            )}

            {/* Profile Form */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Full Name *</label>
                      <Input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="bg-black border-gray-700 text-white focus:border-purple-400"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Bio</label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="bg-black border-gray-700 text-white focus:border-purple-400"
                      placeholder="Tell us about yourself, your interests, and goals..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">GitHub URL</label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="url"
                          name="github_url"
                          value={formData.github_url}
                          onChange={handleInputChange}
                          className="pl-10 bg-black border-gray-700 text-white focus:border-purple-400"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="url"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleInputChange}
                          className="pl-10 bg-black border-gray-700 text-white focus:border-purple-400"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Skills</label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="bg-black border-gray-700 text-white focus:border-purple-400"
                        placeholder="Add a skill (e.g., React, Python, Node.js)"
                      />
                      <Button type="button" onClick={addSkill} className="bg-purple-400 hover:bg-purple-500 text-black">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                    {formData.skills.length === 0 && (
                      <p className="text-gray-400 text-sm mt-2">Add skills to showcase your expertise</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-400 hover:bg-purple-500 text-black font-semibold px-8 py-3"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
