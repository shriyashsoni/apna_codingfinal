"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Building,
  ArrowLeft,
  Briefcase,
  Calendar,
  Target,
  Lock,
} from "lucide-react"
import { getCurrentUser, type Job } from "@/lib/supabase"
import AuthModal from "@/components/auth/auth-modal"

export default function JobDetailPageClient({ job }: { job: Job }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await getCurrentUser()
      if (data) {
        setUser(data)
      }
    }
    fetchUser()
  }, [])

  const handleApply = async () => {
    if (!user) {
      setOpen(true)
      return
    }

    router.push("/apply")
  }

  return (
    <div className="container py-12">
      <AuthModal open={open} setOpen={setOpen} />
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
          <div className="flex items-center gap-2">
            {job.type && <Badge>{job.type}</Badge>}
            {job.experience && <Badge>{job.experience}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>{job.company}</span>
            <ExternalLink
              className="ml-2 h-4 w-4 cursor-pointer text-blue-500"
              onClick={() => window.open(job.company_url, "_blank")}
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Posted {job.created_at}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{job.employment_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{job.application_deadline}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{job.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>{job.remote ? "Remote" : "Onsite"}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">About the job</h3>
            <p>{job.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Responsibilities</h3>
            <ul className="list-disc pl-5">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Requirements</h3>
            <ul className="list-disc pl-5">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Benefits</h3>
            <ul className="list-disc pl-5">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {job.technologies.map((technology, index) => (
                <Badge key={index}>{technology}</Badge>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={handleApply}>
            Apply Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
