"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save, Calendar, MapPin, Trophy, ImageIcon } from "lucide-react"
import { createEnhancedHackathon } from "@/lib/hackathon-system"

interface ProblemStatement {
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  resources: string[]
  constraints: string[]
  evaluation_criteria: string[]
  sample_input?: string
  sample_output?: string
}

interface Partnership {
  name: string
  type: "sponsor" | "organizer" | "supporter" | "media"
  logo_url?: string
  website?: string
  contact_email?: string
  contribution?: string
}

export default function NewEnhancedHackathonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    location: "",
    mode: "hybrid" as "online" | "offline" | "hybrid",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    prize_pool: "",
    max_team_size: "",
    min_team_size: "",
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    organizer: "",
    registration_link: "",
    whatsapp_link: "",
    image_url: "",
    banner_url: "",
    featured: false,
    hackathon_type: "apna_coding" as "external" | "apna_coding",
    submission_start: "",
    submission_end: "",
    team_formation_deadline: "",
    max_participants: "",
    entry_fee: "",
    certificate_provided: true,
    live_streaming: false,
    recording_available: false,
  })

  const [technologies, setTechnologies] = useState<string[]>([])
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([])
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [newTech, setNewTech] = useState("")

  // Problem Statement Management
  const addProblemStatement = () => {
    setProblemStatements([
      ...problemStatements,
      {
        title: "",
        description: "",
        difficulty: "medium",
        resources: [],
        constraints: [],
        evaluation_criteria: [],
        sample_input: "",
        sample_output: "",
      },
    ])
  }

  const updateProblemStatement = (index: number, field: keyof ProblemStatement, value: any) => {
    const updated = [...problemStatements]
    updated[index] = { ...updated[index], [field]: value }
    setProblemStatements(updated)
  }

  const removeProblemStatement = (index: number) => {
    setProblemStatements(problemStatements.filter((_, i) => i !== index))
  }

  // Partnership Management
  const addPartnership = () => {
    setPartnerships([
      ...partnerships,
      {
        name: "",
        type: "sponsor",
        logo_url: "",
        website: "",
        contact_email: "",
        contribution: "",
      },
    ])
  }

  const updatePartnership = (index: number, field: keyof Partnership, value: any) => {
    const updated = [...partnerships]
    updated[index] = { ...updated[index], [field]: value }
    setPartnerships(updated)
  }

  const removePartnership = (index: number) => {
    setPartnerships(partnerships.filter((_, i) => i !== index))
  }

  // Technology Management
  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()])
      setNewTech("")
    }
  }

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "banner_url") => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    try {
      // In a real implementation, you would upload to your storage service
      // For now, we'll use a placeholder URL
      const imageUrl = URL.createObjectURL(file)
      setFormData((prev) => ({ ...prev, [field]: imageUrl }))
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  // Date Validation
  const validateDates = () => {
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    const regDeadline = formData.registration_deadline ? new Date(formData.registration_deadline) : null
    const submissionStart = formData.submission_start ? new Date(formData.submission_start) : null
    const submissionEnd = formData.submission_end ? new Date(formData.submission_end) : null

    if (endDate <= startDate) {
      alert("End date must be after start date")
      return false
    }

    if (regDeadline && regDeadline >= startDate) {
      alert("Registration deadline must be before start date")
      return false
    }

    if (submissionStart && submissionEnd && submissionEnd <= submissionStart) {
      alert("Submission end date must be after submission start date")
      return false
    }

    return true
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateDates()) return

    setLoading(true)

    try {
      // Format dates properly, handling empty strings
      const formatDate = (dateString: string) => {
        if (!dateString || dateString.trim() === "") return null
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date.toISOString()
      }

      const hackathonData = {
        ...formData,
        start_date: formatDate(formData.start_date),
        end_date: formatDate(formData.end_date),
        registration_deadline: formatDate(formData.registration_deadline),
        submission_start: formatDate(formData.submission_start),
        submission_end: formatDate(formData.submission_end),
        team_formation_deadline: formatDate(formData.team_formation_deadline),
        max_team_size: formData.max_team_size ? Number.parseInt(formData.max_team_size) : null,
        min_team_size: formData.min_team_size ? Number.parseInt(formData.min_team_size) : null,
        max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
        entry_fee: formData.entry_fee ? Number.parseFloat(formData.entry_fee) : 0,
        technologies,
        problem_statements: problemStatements,
        partnerships,
        participants_count: 0,
      }

      // Validate required dates
      if (!hackathonData.start_date || !hackathonData.end_date) {
        alert("Start date and end date are required")
        return
      }

      const result = await createEnhancedHackathon(hackathonData)

      if (result.success) {
        alert("Enhanced hackathon created successfully!")
        router.push("/admin/hackathons/enhanced")
      } else {
        alert("Error creating hackathon: " + result.error)
      }
    } catch (error) {
      console.error("Error creating hackathon:", error)
      alert("Error creating hackathon: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/admin/hackathons/enhanced")}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Enhanced Hackathons
          </Button>
          <h1 className="text-3xl font-bold text-white">Create Enhanced Hackathon</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter hackathon title"
                  />
                </div>
                <div>
                  <Label htmlFor="organizer" className="text-gray-300">
                    Organizer *
                  </Label>
                  <Input
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter organizer name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter detailed hackathon description"
                />
              </div>

              <div>
                <Label htmlFor="short_description" className="text-gray-300">
                  Short Description (for link previews) *
                </Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  maxLength={200}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief description for social media previews (max 200 characters)"
                />
                <p className="text-sm text-gray-400 mt-1">{formData.short_description.length}/200 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hackathon_type" className="text-gray-300">
                    Hackathon Type *
                  </Label>
                  <select
                    id="hackathon_type"
                    name="hackathon_type"
                    value={formData.hackathon_type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                  >
                    <option value="apna_coding">Apna Coding Hosted</option>
                    <option value="external">External Platform</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-gray-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="difficulty" className="text-gray-300">
                    Difficulty
                  </Label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded"
                />
                <Label htmlFor="featured" className="text-gray-300">
                  Featured Hackathon
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                Images & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image_upload" className="text-gray-300">
                    Main Image (for previews)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "image_url")}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="banner_upload" className="text-gray-300">
                    Banner Image
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="banner_upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "banner_url")}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {formData.banner_url && (
                      <img
                        src={formData.banner_url || "/placeholder.svg"}
                        alt="Banner Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-gray-300">
                    Start Date & Time *
                  </Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-gray-300">
                    End Date & Time *
                  </Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_deadline" className="text-gray-300">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registration_deadline"
                    name="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="team_formation_deadline" className="text-gray-300">
                    Team Formation Deadline
                  </Label>
                  <Input
                    id="team_formation_deadline"
                    name="team_formation_deadline"
                    type="datetime-local"
                    value={formData.team_formation_deadline}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location" className="text-gray-300">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <Label htmlFor="mode" className="text-gray-300">
                    Mode
                  </Label>
                  <select
                    id="mode"
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="entry_fee" className="text-gray-300">
                    Entry Fee ($)
                  </Label>
                  <Input
                    id="entry_fee"
                    name="entry_fee"
                    type="number"
                    step="0.01"
                    value={formData.entry_fee}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team & Participation */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Team & Participation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="min_team_size" className="text-gray-300">
                    Min Team Size
                  </Label>
                  <Input
                    id="min_team_size"
                    name="min_team_size"
                    type="number"
                    value={formData.min_team_size}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="max_team_size" className="text-gray-300">
                    Max Team Size
                  </Label>
                  <Input
                    id="max_team_size"
                    name="max_team_size"
                    type="number"
                    value={formData.max_team_size}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="4"
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants" className="text-gray-300">
                    Max Participants
                  </Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="prize_pool" className="text-gray-300">
                    Prize Pool *
                  </Label>
                  <Input
                    id="prize_pool"
                    name="prize_pool"
                    value={formData.prize_pool}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="$10,000"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="certificate_provided"
                    name="certificate_provided"
                    checked={formData.certificate_provided}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded"
                  />
                  <Label htmlFor="certificate_provided" className="text-gray-300">
                    Certificate Provided
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="live_streaming"
                    name="live_streaming"
                    checked={formData.live_streaming}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded"
                  />
                  <Label htmlFor="live_streaming" className="text-gray-300">
                    Live Streaming
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recording_available"
                    name="recording_available"
                    checked={formData.recording_available}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded"
                  />
                  <Label htmlFor="recording_available" className="text-gray-300">
                    Recording Available
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add technology"
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem Statements */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Problem Statements
                <Button
                  type="button"
                  onClick={addProblemStatement}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Problem
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {problemStatements.map((problem, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Problem {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeProblemStatement(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Title *</Label>
                      <Input
                        value={problem.title}
                        onChange={(e) => updateProblemStatement(index, "title", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Problem title"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Difficulty</Label>
                      <select
                        value={problem.difficulty}
                        onChange={(e) => updateProblemStatement(index, "difficulty", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Description *</Label>
                    <Textarea
                      value={problem.description}
                      onChange={(e) => updateProblemStatement(index, "description", e.target.value)}
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Detailed problem description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Sample Input</Label>
                      <Textarea
                        value={problem.sample_input || ""}
                        onChange={(e) => updateProblemStatement(index, "sample_input", e.target.value)}
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Sample input data"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Sample Output</Label>
                      <Textarea
                        value={problem.sample_output || ""}
                        onChange={(e) => updateProblemStatement(index, "sample_output", e.target.value)}
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Expected output"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Partnerships */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Partnerships & Sponsors
                <Button type="button" onClick={addPartnership} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {partnerships.map((partnership, index) => (
                <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Partner {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removePartnership(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Partner Name *</Label>
                      <Input
                        value={partnership.name}
                        onChange={(e) => updatePartnership(index, "name", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Partner name"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Type</Label>
                      <select
                        value={partnership.type}
                        onChange={(e) => updatePartnership(index, "type", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
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
                        value={partnership.website || ""}
                        onChange={(e) => updatePartnership(index, "website", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://partner-website.com"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Contact Email</Label>
                      <Input
                        value={partnership.contact_email || ""}
                        onChange={(e) => updatePartnership(index, "contact_email", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="contact@partner.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Contribution</Label>
                    <Textarea
                      value={partnership.contribution || ""}
                      onChange={(e) => updatePartnership(index, "contribution", e.target.value)}
                      rows={2}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="What does this partner contribute?"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Links & Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.hackathon_type === "external" && (
                <div>
                  <Label htmlFor="registration_link" className="text-gray-300">
                    External Registration Link
                  </Label>
                  <Input
                    id="registration_link"
                    name="registration_link"
                    type="url"
                    value={formData.registration_link}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://external-platform.com/register"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="whatsapp_link" className="text-gray-300">
                  WhatsApp Group Link
                </Label>
                <Input
                  id="whatsapp_link"
                  name="whatsapp_link"
                  type="url"
                  value={formData.whatsapp_link}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission Period (for Apna Coding hosted) */}
          {formData.hackathon_type === "apna_coding" && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Submission Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="submission_start" className="text-gray-300">
                      Submission Start
                    </Label>
                    <Input
                      id="submission_start"
                      name="submission_start"
                      type="datetime-local"
                      value={formData.submission_start}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="submission_end" className="text-gray-300">
                      Submission End
                    </Label>
                    <Input
                      id="submission_end"
                      name="submission_end"
                      type="datetime-local"
                      value={formData.submission_end}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/hackathons/enhanced")}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || imageUploading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Enhanced Hackathon
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
