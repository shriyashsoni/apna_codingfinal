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
import { ArrowLeft, Plus, X, Save, Calendar, MapPin, Trophy } from "lucide-react"
import { createHackathon } from "@/lib/supabase"

export default function NewHackathonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    mode: "hybrid",
    status: "upcoming",
    prize_pool: "",
    max_team_size: "",
    difficulty: "intermediate",
    organizer: "",
    registration_link: "",
    whatsapp_link: "",
    image_url: "",
    featured: false,
    registration_deadline: "",
  })
  const [technologies, setTechnologies] = useState<string[]>([])
  const [partnerships, setPartnerships] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [newPartnership, setNewPartnership] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()])
      setNewTech("")
    }
  }

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const addPartnership = () => {
    if (newPartnership.trim() && !partnerships.includes(newPartnership.trim())) {
      setPartnerships([...partnerships, newPartnership.trim()])
      setNewPartnership("")
    }
  }

  const removePartnership = (partnership: string) => {
    setPartnerships(partnerships.filter((p) => p !== partnership))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const hackathonData = {
        ...formData,
        max_team_size: formData.max_team_size ? Number.parseInt(formData.max_team_size) : null,
        technologies,
        partnerships,
        participants_count: 0,
      }

      const { data, error } = await createHackathon(hackathonData)

      if (error) {
        alert("Error creating hackathon: " + error.message)
        return
      }

      alert("Hackathon created successfully!")

      // Redirect to the new hackathon's detail page
      if (data?.slug) {
        router.push(`/hackathons/${data.slug}`)
      } else {
        router.push("/admin/hackathons")
      }
    } catch (error) {
      console.error("Error creating hackathon:", error)
      alert("Error creating hackathon. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/admin/hackathons")}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </Button>
          <h1 className="text-3xl font-bold text-white">Create New Hackathon</h1>
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
                  placeholder="Enter hackathon description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Prize & Team Details */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Prize & Team Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., $10,000"
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
                    placeholder="e.g., 4"
                  />
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

          {/* Partnerships */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Partnerships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPartnership}
                  onChange={(e) => setNewPartnership(e.target.value)}
                  placeholder="Add partnership"
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPartnership())}
                />
                <Button type="button" onClick={addPartnership} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {partnerships.map((partnership, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                    {partnership}
                    <button
                      type="button"
                      onClick={() => removePartnership(partnership)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Links & Media */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Links & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="registration_link" className="text-gray-300">
                  Registration Link
                </Label>
                <Input
                  id="registration_link"
                  name="registration_link"
                  type="url"
                  value={formData.registration_link}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="https://..."
                />
              </div>
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
              <div>
                <Label htmlFor="image_url" className="text-gray-300">
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/hackathons")}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Hackathon
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
