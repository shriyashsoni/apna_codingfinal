"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save, X, Upload, Plus, Trash2, ImageIcon } from "lucide-react"
import { getCurrentUser, isAdmin, getUserOrganizerStatus, type User } from "@/lib/supabase"
import {
  createEnhancedHackathon,
  uploadHackathonImage,
  createProblemStatement,
  createHackathonPartnership,
} from "@/lib/hackathon-system"

export default function NewEnhancedHackathon() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminAccess, setAdminAccess] = useState(false)
  const [organizerStatus, setOrganizerStatus] = useState({ is_organizer: false, organizer_types: [] })
  const [uploadingImage, setUploadingImage] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hackathon_type: "apna_coding" as "external" | "apna_coding",
    platform_url: "",
    image_url: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    location: "",
    prize_pool: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    max_team_members: 5,
    min_team_members: 1,
    allow_individual: true,
    submissions_open: false,
    organizer: "",
    technologies: "",
    featured: false,
  })

  const [problemStatements, setProblemStatements] = useState([
    {
      title: "",
      description: "",
      difficulty_level: "medium" as "easy" | "medium" | "hard",
      max_points: 100,
      resources: "",
      constraints: "",
      evaluation_criteria: "",
      sample_input: "",
      sample_output: "",
    },
  ])

  const [partnerships, setPartnerships] = useState([
    {
      partner_name: "",
      partner_logo_url: "",
      partner_website: "",
      partnership_type: "sponsor" as "sponsor" | "organizer" | "supporter" | "media",
      contribution_amount: "",
      benefits: "",
      contact_person: "",
      contact_email: "",
    },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }

      const hasAdminAccess = await isAdmin(currentUser.email)
      const orgStatus = await getUserOrganizerStatus(currentUser.id)

      if (!hasAdminAccess && !orgStatus.organizer_types.includes("hackathon_organizer")) {
        router.push("/")
        return
      }

      setUser(currentUser)
      setAdminAccess(hasAdminAccess)
      setOrganizerStatus(orgStatus)

      // Set default organizer name
      setFormData((prev) => ({
        ...prev,
        organizer: currentUser.full_name || currentUser.email || "Apna Coding Team",
      }))
    } catch (error) {
      console.error("Error checking access:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const { data, error } = await uploadHackathonImage(file, "temp")
      if (error) {
        alert("Error uploading image: " + error.message)
        return
      }

      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }))
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image")
    } finally {
      setUploadingImage(false)
    }
  }

  const addProblemStatement = () => {
    setProblemStatements([
      ...problemStatements,
      {
        title: "",
        description: "",
        difficulty_level: "medium" as "easy" | "medium" | "hard",
        max_points: 100,
        resources: "",
        constraints: "",
        evaluation_criteria: "",
        sample_input: "",
        sample_output: "",
      },
    ])
  }

  const removeProblemStatement = (index: number) => {
    setProblemStatements(problemStatements.filter((_, i) => i !== index))
  }

  const updateProblemStatement = (index: number, field: string, value: any) => {
    const updated = [...problemStatements]
    updated[index] = { ...updated[index], [field]: value }
    setProblemStatements(updated)
  }

  const addPartnership = () => {
    setPartnerships([
      ...partnerships,
      {
        partner_name: "",
        partner_logo_url: "",
        partner_website: "",
        partnership_type: "sponsor" as "sponsor" | "organizer" | "supporter" | "media",
        contribution_amount: "",
        benefits: "",
        contact_person: "",
        contact_email: "",
      },
    ])
  }

  const removePartnership = (index: number) => {
    setPartnerships(partnerships.filter((_, i) => i !== index))
  }

  const updatePartnership = (index: number, field: string, value: any) => {
    const updated = [...partnerships]
    updated[index] = { ...updated[index], [field]: value }
    setPartnerships(updated)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.start_date) newErrors.start_date = "Start date is required"
    if (!formData.end_date) newErrors.end_date = "End date is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.prize_pool.trim()) newErrors.prize_pool = "Prize pool is required"
    if (!formData.organizer.trim()) newErrors.organizer = "Organizer is required"

    if (formData.hackathon_type === "external" && !formData.platform_url.trim()) {
      newErrors.platform_url = "Platform URL is required for external hackathons"
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (startDate >= endDate) {
        newErrors.end_date = "End date must be after start date"
      }
    }

    if (formData.min_team_members > formData.max_team_members) {
      newErrors.max_team_members = "Max team members must be greater than or equal to min team members"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const technologiesArray = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0)

      const { data: hackathon, error } = await createEnhancedHackathon({
        ...formData,
        technologies: technologiesArray,
        results_published: false,
      })

      if (error || !hackathon) {
        alert("Error creating hackathon: " + (error?.message || "Unknown error"))
        return
      }

      // Create problem statements
      for (const problem of problemStatements) {
        if (problem.title.trim() && problem.description.trim()) {
          await createProblemStatement({
            hackathon_id: hackathon.id,
            title: problem.title,
            description: problem.description,
            difficulty_level: problem.difficulty_level,
            max_points: problem.max_points,
            resources: problem.resources
              .split(",")
              .map((r) => r.trim())
              .filter((r) => r),
            constraints: problem.constraints
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c),
            evaluation_criteria: problem.evaluation_criteria
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e),
            sample_input: problem.sample_input,
            sample_output: problem.sample_output,
          })
        }
      }

      // Create partnerships
      for (const partnership of partnerships) {
        if (partnership.partner_name.trim()) {
          await createHackathonPartnership({
            hackathon_id: hackathon.id,
            partner_name: partnership.partner_name,
            partner_logo_url: partnership.partner_logo_url,
            partner_website: partnership.partner_website,
            partnership_type: partnership.partnership_type,
            contribution_amount: partnership.contribution_amount,
            benefits: partnership.benefits
              .split(",")
              .map((b) => b.trim())
              .filter((b) => b),
            contact_person: partnership.contact_person,
            contact_email: partnership.contact_email,
            status: "active",
          })
        }
      }

      alert("Hackathon created successfully!")
      router.push("/admin/hackathons/enhanced")
    } catch (error) {
      console.error("Error creating hackathon:", error)
      alert("Error creating hackathon")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!adminAccess && !organizerStatus.organizer_types.includes("hackathon_organizer")) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to create hackathons.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-400" />
              Create New Hackathon
            </h1>
            <p className="text-gray-400 mt-1">Set up a new hackathon event with all features</p>
          </div>
          <Button
            onClick={() => router.push("/admin/hackathons/enhanced")}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.title ? "border-red-500" : ""}`}
                      placeholder="Enter hackathon title"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <Label htmlFor="organizer" className="text-gray-300">
                      Organizer *
                    </Label>
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => handleInputChange("organizer", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.organizer ? "border-red-500" : ""}`}
                      placeholder="Enter organizer name"
                    />
                    {errors.organizer && <p className="text-red-400 text-sm mt-1">{errors.organizer}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`bg-gray-800 border-gray-700 text-white ${errors.description ? "border-red-500" : ""}`}
                    placeholder="Describe the hackathon"
                    rows={4}
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="image" className="text-gray-300">
                    Hackathon Image
                  </Label>
                  <div className="mt-2">
                    {formData.image_url ? (
                      <div className="relative">
                        <img
                          src={formData.image_url || "/placeholder.svg"}
                          alt="Hackathon"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={() => handleInputChange("image_url", "")}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">Upload hackathon image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById("image-upload")?.click()}
                          disabled={uploadingImage}
                          className="bg-purple-400 hover:bg-purple-500 text-black"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? "Uploading..." : "Choose Image"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hackathon_type" className="text-gray-300">
                      Type *
                    </Label>
                    <select
                      id="hackathon_type"
                      value={formData.hackathon_type}
                      onChange={(e) =>
                        handleInputChange("hackathon_type", e.target.value as "external" | "apna_coding")
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="apna_coding">Apna Coding Hosted</option>
                      <option value="external">External Platform</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-gray-300">
                      Status *
                    </Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {formData.hackathon_type === "external" && (
                  <div>
                    <Label htmlFor="platform_url" className="text-gray-300">
                      Platform URL *
                    </Label>
                    <Input
                      id="platform_url"
                      type="url"
                      value={formData.platform_url}
                      onChange={(e) => handleInputChange("platform_url", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.platform_url ? "border-red-500" : ""}`}
                      placeholder="https://devpost.com/..."
                    />
                    {errors.platform_url && <p className="text-red-400 text-sm mt-1">{errors.platform_url}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date and Location */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Date and Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-gray-300">
                      Start Date *
                    </Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.start_date ? "border-red-500" : ""}`}
                    />
                    {errors.start_date && <p className="text-red-400 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="text-gray-300">
                      End Date *
                    </Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.end_date ? "border-red-500" : ""}`}
                    />
                    {errors.end_date && <p className="text-red-400 text-sm mt-1">{errors.end_date}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registration_deadline" className="text-gray-300">
                      Registration Deadline
                    </Label>
                    <Input
                      id="registration_deadline"
                      type="datetime-local"
                      value={formData.registration_deadline}
                      onChange={(e) => handleInputChange("registration_deadline", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className={`bg-gray-800 border-gray-700 text-white ${errors.location ? "border-red-500" : ""}`}
                      placeholder="Online, Delhi, Mumbai, etc."
                    />
                    {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prize and Team Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Prize and Team Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prize_pool" className="text-gray-300">
                    Prize Pool *
                  </Label>
                  <Input
                    id="prize_pool"
                    value={formData.prize_pool}
                    onChange={(e) => handleInputChange("prize_pool", e.target.value)}
                    className={`bg-gray-800 border-gray-700 text-white ${errors.prize_pool ? "border-red-500" : ""}`}
                    placeholder="$10,000, ₹50,000, etc."
                  />
                  {errors.prize_pool && <p className="text-red-400 text-sm mt-1">{errors.prize_pool}</p>}
                </div>

                {formData.hackathon_type === "apna_coding" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="min_team_members" className="text-gray-300">
                        Min Team Size
                      </Label>
                      <Input
                        id="min_team_members"
                        type="number"
                        min="1"
                        value={formData.min_team_members}
                        onChange={(e) => handleInputChange("min_team_members", Number.parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_team_members" className="text-gray-300">
                        Max Team Size
                      </Label>
                      <Input
                        id="max_team_members"
                        type="number"
                        min="1"
                        value={formData.max_team_members}
                        onChange={(e) => handleInputChange("max_team_members", Number.parseInt(e.target.value))}
                        className={`bg-gray-800 border-gray-700 text-white ${errors.max_team_members ? "border-red-500" : ""}`}
                      />
                      {errors.max_team_members && (
                        <p className="text-red-400 text-sm mt-1">{errors.max_team_members}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="allow_individual"
                        checked={formData.allow_individual}
                        onChange={(e) => handleInputChange("allow_individual", e.target.checked)}
                        className="w-4 h-4 text-purple-400 bg-gray-800 border-gray-700 rounded"
                      />
                      <Label htmlFor="allow_individual" className="text-gray-300">
                        Allow Individual
                      </Label>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="technologies" className="text-gray-300">
                    Technologies (comma-separated)
                  </Label>
                  <Input
                    id="technologies"
                    value={formData.technologies}
                    onChange={(e) => handleInputChange("technologies", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="React, Node.js, Python, MongoDB"
                  />
                </div>

                {formData.hackathon_type === "apna_coding" && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="submissions_open"
                        checked={formData.submissions_open}
                        onChange={(e) => handleInputChange("submissions_open", e.target.checked)}
                        className="w-4 h-4 text-purple-400 bg-gray-800 border-gray-700 rounded"
                      />
                      <Label htmlFor="submissions_open" className="text-gray-300">
                        Submissions Open
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange("featured", e.target.checked)}
                        className="w-4 h-4 text-purple-400 bg-gray-800 border-gray-700 rounded"
                      />
                      <Label htmlFor="featured" className="text-gray-300">
                        Featured
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problem Statements */}
            {formData.hackathon_type === "apna_coding" && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Problem Statements</CardTitle>
                    <Button
                      type="button"
                      onClick={addProblemStatement}
                      className="bg-green-400 hover:bg-green-500 text-black"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Problem
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {problemStatements.map((problem, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Problem Statement {index + 1}</h4>
                        {problemStatements.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeProblemStatement(index)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Title</Label>
                          <Input
                            value={problem.title}
                            onChange={(e) => updateProblemStatement(index, "title", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Problem title"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Difficulty</Label>
                          <select
                            value={problem.difficulty_level}
                            onChange={(e) => updateProblemStatement(index, "difficulty_level", e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                          value={problem.description}
                          onChange={(e) => updateProblemStatement(index, "description", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Problem description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Max Points</Label>
                          <Input
                            type="number"
                            value={problem.max_points}
                            onChange={(e) =>
                              updateProblemStatement(index, "max_points", Number.parseInt(e.target.value))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Resources (comma-separated)</Label>
                          <Input
                            value={problem.resources}
                            onChange={(e) => updateProblemStatement(index, "resources", e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="API docs, tutorials, etc."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Partnerships */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Partnerships & Sponsors</CardTitle>
                  <Button
                    type="button"
                    onClick={addPartnership}
                    className="bg-blue-400 hover:bg-blue-500 text-black"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partner
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {partnerships.map((partnership, index) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Partner {index + 1}</h4>
                      {partnerships.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePartnership(index)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Partner Name</Label>
                        <Input
                          value={partnership.partner_name}
                          onChange={(e) => updatePartnership(index, "partner_name", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Company/Organization name"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Partnership Type</Label>
                        <select
                          value={partnership.partnership_type}
                          onChange={(e) => updatePartnership(index, "partnership_type", e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                        >
                          <option value="sponsor">Sponsor</option>
                          <option value="organizer">Organizer</option>
                          <option value="supporter">Supporter</option>
                          <option value="media">Media Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Website</Label>
                        <Input
                          type="url"
                          value={partnership.partner_website}
                          onChange={(e) => updatePartnership(index, "partner_website", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="https://partner-website.com"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Contribution Amount</Label>
                        <Input
                          value={partnership.contribution_amount}
                          onChange={(e) => updatePartnership(index, "contribution_amount", e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="$5,000, ₹50,000, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/hackathons/enhanced")}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-purple-400 hover:bg-purple-500 text-black">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Creating..." : "Create Hackathon"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
