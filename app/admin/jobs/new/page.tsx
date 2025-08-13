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
import { createJob } from "@/lib/supabase"

export default function NewJob() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Full-time" as "Full-time" | "Part-time" | "Contract" | "Internship",
    salary: "",
    experience: "",
    company_logo: "",
    status: "active" as "active" | "inactive" | "filled",
    posted_date: new Date().toISOString().split("T")[0],
    application_deadline: "",
    apply_link: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      const jobData = {
        ...formData,
        technologies,
        requirements,
      }

      const { error } = await createJob(jobData)

      if (error) {
        console.error("Error creating job:", error)
        alert("Failed to create job: " + error.message)
        return
      }

      alert("Job created successfully!")
      router.push("/admin/jobs")
    } catch (error) {
      console.error("Error creating job:", error)
      alert("Failed to create job. Please try again.")
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
            onClick={() => router.push("/admin/jobs")}
            variant="outline"
            size="sm"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Create New Job</h1>
            <p className="text-gray-400">Add a new job opportunity to the platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Job Details</CardTitle>
              <CardDescription className="text-gray-400">
                Fill in the information for the new job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-white">
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-white">
                    Company *
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Job Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="Describe the job role and responsibilities..."
                />
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="type" className="text-white">
                    Job Type *
                  </Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-black border border-gray-700 text-white rounded-md px-3 py-2 focus:border-purple-400"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
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
                    placeholder="e.g., Mumbai, India"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white">
                    Experience *
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="e.g., 2-4 years"
                  />
                </div>
              </div>

              {/* Salary and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salary" className="text-white">
                    Salary *
                  </Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="e.g., $50,000 - $70,000"
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
                    <option value="filled">Filled</option>
                  </select>
                </div>
              </div>

              {/* Dates and Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="application_deadline" className="text-white">
                    Application Deadline
                  </Label>
                  <Input
                    id="application_deadline"
                    name="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                  />
                </div>

                <div>
                  <Label htmlFor="apply_link" className="text-white">
                    Application Link
                  </Label>
                  <Input
                    id="apply_link"
                    name="apply_link"
                    type="url"
                    value={formData.apply_link}
                    onChange={handleInputChange}
                    className="bg-black border-gray-700 text-white focus:border-purple-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Company Logo */}
              <div>
                <Label htmlFor="company_logo" className="text-white">
                  Company Logo URL
                </Label>
                <Input
                  id="company_logo"
                  name="company_logo"
                  type="url"
                  value={formData.company_logo}
                  onChange={handleInputChange}
                  className="bg-black border-gray-700 text-white focus:border-purple-400"
                  placeholder="https://..."
                />
              </div>

              {/* Technologies */}
              <div>
                <Label className="text-white">Required Technologies</Label>
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

              {/* Requirements */}
              <div>
                <Label className="text-white">Job Requirements</Label>
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
                      className="flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
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
                  {loading ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
