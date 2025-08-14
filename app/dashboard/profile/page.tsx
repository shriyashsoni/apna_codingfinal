"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Github, Linkedin, Plus, X, Save, ArrowLeft } from "lucide-react"
import { getCurrentUser, updateUserProfile, type User as UserType } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    skills: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          full_name: currentUser.full_name || "",
          bio: currentUser.bio || "",
          location: currentUser.location || "",
          github_url: currentUser.github_url || "",
          linkedin_url: currentUser.linkedin_url || "",
          skills: currentUser.skills || [],
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setMessage({ type: "error", text: "Failed to load profile" })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { data, error } = await updateUserProfile(user.id, formData)

      if (error) {
        setMessage({ type: "error", text: "Failed to update profile" })
        return
      }

      if (data && data.length > 0) {
        setUser(data[0])
        setMessage({ type: "success", text: "Profile updated successfully!" })
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "An error occurred while updating profile" })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        bio: user.bio || "",
        location: user.location || "",
        github_url: user.github_url || "",
        linkedin_url: user.linkedin_url || "",
        skills: user.skills || [],
      })
    }
    setIsEditing(false)
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">Unable to load your profile information.</p>
          <Link href="/dashboard">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-black hover:bg-yellow-400">
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleCancel} variant="ghost" className="text-gray-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-yellow-500 text-black hover:bg-yellow-400">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
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
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-yellow-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.full_name}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-12 h-12 text-black" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-white">{user.full_name}</CardTitle>
                <CardDescription className="text-gray-400">{user.email}</CardDescription>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-2">
                  {user.role === "admin" ? "Administrator" : "Member"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.location && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.github_url && (
                  <div className="flex items-center space-x-2">
                    <Github className="w-4 h-4" />
                    <a
                      href={user.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
                {user.linkedin_url && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4" />
                    <a
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-900 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-800 border-gray-700 text-white opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., New Delhi, India"
                    className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-gray-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-gray-900 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription className="text-gray-400">Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="github_url" className="text-gray-300">
                    GitHub URL
                  </Label>
                  <Input
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange("github_url", e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://github.com/yourusername"
                    className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url" className="text-gray-300">
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-gray-900 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Skills</CardTitle>
                <CardDescription className="text-gray-400">Add your technical skills and expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    >
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      className="bg-gray-800 border-gray-700 text-white"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-gray-900 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Your account details and membership information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Member Since</Label>
                    <p className="text-white">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Account Type</Label>
                    <p className="text-white capitalize">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
