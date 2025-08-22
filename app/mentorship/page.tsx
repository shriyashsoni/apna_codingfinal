import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { generateMetadata as generateSEOMetadata } from "@/components/seo/seo-head"
import { StructuredData, generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/seo/structured-data"
import MentorshipPageClient from "./MentorshipPageClient"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const metadata: Metadata = generateSEOMetadata({
  title: "Tech Mentorship Programs | Learn from Industry Experts",
  description:
    "Get personalized mentorship from top tech industry leaders. Join Apna Coding's mentorship programs to advance your skills, land your dream job, and accelerate your career growth.",
  keywords: [
    "tech mentorship",
    "coding mentors",
    "software engineering mentorship",
    "career coaching",
    "programming mentors",
    "tech career guidance",
    "industry experts",
    "skill development",
    "career transition",
    "apna coding mentorship",
  ],
  url: "https://apnacoding.com/mentorship",
  type: "website",
})

async function getMentorshipPrograms() {
  try {
    const { data: programs, error } = await supabase
      .from("mentorship_programs")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return programs || []
  } catch (error) {
    console.error("Error fetching mentorship programs:", error)
    return []
  }
}

async function getFeaturedPrograms() {
  try {
    const { data: programs, error } = await supabase
      .from("mentorship_programs")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(3)

    if (error) throw error
    return programs || []
  } catch (error) {
    console.error("Error fetching featured programs:", error)
    return []
  }
}

async function getSkills() {
  try {
    const { data: programs, error } = await supabase.from("mentorship_programs").select("skills").eq("active", true)

    if (error) throw error

    const allSkills = programs?.flatMap((p) => p.skills || []) || []
    const uniqueSkills = [...new Set(allSkills)]
    return uniqueSkills
  } catch (error) {
    console.error("Error fetching skills:", error)
    return []
  }
}

export default async function MentorshipPage() {
  const [programs, featuredPrograms, skills] = await Promise.all([
    getMentorshipPrograms(),
    getFeaturedPrograms(),
    getSkills(),
  ])

  const organizationSchema = generateOrganizationSchema()
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://apnacoding.com" },
    { name: "Mentorship", url: "https://apnacoding.com/mentorship" },
  ])

  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={breadcrumbSchema} />
      <MentorshipPageClient programs={programs} featuredPrograms={featuredPrograms} skills={skills} />
    </>
  )
}
