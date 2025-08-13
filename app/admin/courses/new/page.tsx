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
import { createCourse } from "@/lib/supabase"

export default function NewCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [newTag, setNewTag] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    price: 0,
    duration: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    instructor: "",
    students_count: 0,
    rating: 0,
    status: "active" as "active" | "inactive" | "draft",
    redirect_url: "",
    category: "",
    original_price: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const courseData = {
        ...formData,
        technologies,
        tags,
      }

      const { error } = await createCourse(courseData)

      if (error) {
        console.error("Error creating course:", error)
        alert("Failed to create course: " + error.message)
        return
      }

      alert("Course created successfully!")
      router.push("/admin/courses")
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course. Please try again.")
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
            onClick={() => router.push("/admin/courses")}
            variant="outline"
            size="sm"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Create New Course</h1>
            <p className="text-gray-400">Add a new course to the platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Course Details</CardTitle>
              <CardDescription className="text-gray-400">Fill in the information for the new course</CardDescription>
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
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <Label htmlFor="instructor" className="text-white">
                    Instructor *
                  </Label>
                  <Input
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="Instructor name"
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
                  placeholder="Describe the course..."
                />
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="level" className="text-white">
                    Level *
                  </Label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-white">
                    Duration *
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="e.g., 8 weeks"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">
                    Category *
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="e.g., Web Development"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price" className="text-white">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="original_price" className="text-white">
                    Original Price
                  </Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="e.g., $199"
                  />
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
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
                  <Label htmlFor="redirect_url" className="text-white">
                    Course URL *
                  </Label>
                  <Input
                    id="redirect_url"
                    name="redirect_url"
                    type="url"
                    value={formData.redirect_url}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="https://..."
                  />
                </div>
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

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading} className="bg-purple-400 hover:bg-purple-500 text-black px-8">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
