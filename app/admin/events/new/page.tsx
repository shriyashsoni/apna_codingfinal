"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { createEvent } from "@/lib/supabase"

export default function NewEvent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    event_date: "",
    end_date: "",
    location: "",
    event_type: "workshop" as "workshop" | "webinar" | "conference" | "meetup" | "bootcamp" | "seminar",
    organizer: "",
    max_participants: 50,
    registration_fee: 0,
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    registration_open: true,
    registration_link: "",
    event_mode: "online" as "online" | "offline" | "hybrid",
    agenda: "",
    speaker_info: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number.parseFloat(value) || 0
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        ...formData,
        technologies,
        tags,
        requirements,
        current_participants: 0,
      }

      const { error } = await createEvent(eventData)

      if (error) {
        console.error("Error creating event:", error)
        alert("Failed to create event: " + error.message)
        return
      }

      alert("Event created successfully!")
      router.push("/admin/events")
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => router.push("/admin/events")}
            variant="outline"
            size="sm"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Create New Event</h1>
            <p className="text-gray-400">Add a new tech event or workshop</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Event Details</CardTitle>
              <CardDescription className="text-gray-400">Fill in the information for the new event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-white">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <Label htmlFor="organizer" className="text-white">
                    Organizer *
                  </Label>
                  <Input
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="Organizer name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="Describe the event..."
                />
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="event_type" className="text-white">
                    Event Type *
                  </Label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="conference">Conference</option>
                    <option value="meetup">Meetup</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="event_mode" className="text-white">
                    Event Mode *
                  </Label>
                  <select
                    id="event_mode"
                    name="event_mode"
                    value={formData.event_mode}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-white">
                    Status *
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Date and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_date" className="text-white">
                    Event Date & Time *
                  </Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-white">
                    End Date & Time
                  </Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-white">
                  Location *
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="Event location or online platform"
                />
              </div>

              {/* Participants and Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="max_participants" className="text-white">
                    Max Participants *
                  </Label>
                  <Input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label htmlFor="registration_fee" className="text-white">
                    Registration Fee ($)
                  </Label>
                  <Input
                    id="registration_fee"
                    name="registration_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="0 for free events"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="image_url" className="text-white">
                    Image URL
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="registration_link" className="text-white">
                    Registration Link
                  </Label>
                  <Input
                    id="registration_link"
                    name="registration_link"
                    type="url"
                    value={formData.registration_link}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Agenda */}
              <div>
                <Label htmlFor="agenda" className="text-white">
                  Agenda
                </Label>
                <Textarea
                  id="agenda"
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  rows={4}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="Event agenda and schedule..."
                />
              </div>

              {/* Speaker Info */}
              <div>
                <Label htmlFor="speaker_info" className="text-white">
                  Speaker Information
                </Label>
                <Textarea
                  id="speaker_info"
                  name="speaker_info"
                  value={formData.speaker_info}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="Information about speakers..."
                />
              </div>

              {/* Technologies */}
              <div>
                <Label className="text-white">Technologies</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                  />
                  <Button
                    type="button"
                    onClick={addTechnology}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-purple-400 text-black px-2 py-1 rounded text-sm"
                    >
                      {tech}
                      <button type="button" onClick={() => removeTechnology(tech)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-white">Tags</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-white">Requirements</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add requirement"
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black bg-transparent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-sm"
                    >
                      {req}
                      <button type="button" onClick={() => removeRequirement(req)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading} className="bg-purple-400 hover:bg-purple-500 text-black px-8">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
