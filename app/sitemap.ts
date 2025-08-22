import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://apnacoding.tech"

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/hackathons`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mentorship`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]

  try {
    // Fetch dynamic content
    const [hackathonsResult, jobsResult, coursesResult, blogResult, mentorshipResult] = await Promise.all([
      supabase.from("hackathons").select("slug, updated_at").order("updated_at", { ascending: false }),
      supabase.from("jobs").select("id, title, company, updated_at").order("updated_at", { ascending: false }),
      supabase.from("courses").select("id, title, updated_at").order("updated_at", { ascending: false }),
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false }),
      supabase
        .from("mentorship_programs")
        .select("slug, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false }),
    ])

    // Generate hackathon pages
    const hackathonPages = (hackathonsResult.data || []).map((hackathon) => ({
      url: `${baseUrl}/hackathons/${hackathon.slug}`,
      lastModified: new Date(hackathon.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Generate job pages
    const jobPages = (jobsResult.data || []).map((job) => {
      const slug = `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${job.id.substring(0, 8)}`
      return {
        url: `${baseUrl}/jobs/${slug}`,
        lastModified: new Date(job.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }
    })

    // Generate course pages
    const coursePages = (coursesResult.data || []).map((course) => {
      const slug = `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${course.id.substring(0, 8)}`
      return {
        url: `${baseUrl}/courses/${slug}`,
        lastModified: new Date(course.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }
    })

    // Generate blog pages
    const blogPages = (blogResult.data || []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    // Generate mentorship pages
    const mentorshipPages = (mentorshipResult.data || []).map((program) => ({
      url: `${baseUrl}/mentorship/${program.slug}`,
      lastModified: new Date(program.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

    return [...staticPages, ...hackathonPages, ...jobPages, ...coursePages, ...blogPages, ...mentorshipPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticPages
  }
}
