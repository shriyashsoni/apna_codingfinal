import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://apnacoding.com"

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
      priority: 0.8,
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
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-tools`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  // Dynamic pages
  const dynamicPages = []

  try {
    // Hackathons
    const { data: hackathons } = await supabase.from("hackathons").select("slug, updated_at").eq("status", "active")

    if (hackathons) {
      hackathons.forEach((hackathon) => {
        dynamicPages.push({
          url: `${baseUrl}/hackathons/${hackathon.slug}`,
          lastModified: new Date(hackathon.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      })
    }

    // Jobs
    const { data: jobs } = await supabase.from("jobs").select("slug, updated_at").eq("status", "active")

    if (jobs) {
      jobs.forEach((job) => {
        dynamicPages.push({
          url: `${baseUrl}/jobs/${job.slug}`,
          lastModified: new Date(job.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })
      })
    }

    // Courses
    const { data: courses } = await supabase.from("courses").select("slug, updated_at").eq("status", "published")

    if (courses) {
      courses.forEach((course) => {
        dynamicPages.push({
          url: `${baseUrl}/courses/${course.slug}`,
          lastModified: new Date(course.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })
      })
    }

    // Blog posts
    const { data: blogPosts } = await supabase.from("blog_posts").select("slug, updated_at").eq("published", true)

    if (blogPosts) {
      blogPosts.forEach((post) => {
        dynamicPages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })
      })
    }

    // Mentorship programs
    const { data: mentorshipPrograms } = await supabase
      .from("mentorship_programs")
      .select("slug, updated_at")
      .eq("active", true)

    if (mentorshipPrograms) {
      mentorshipPrograms.forEach((program) => {
        dynamicPages.push({
          url: `${baseUrl}/mentorship/${program.slug}`,
          lastModified: new Date(program.updated_at),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })
      })
    }
  } catch (error) {
    console.error("Error generating sitemap:", error)
  }

  return [...staticPages, ...dynamicPages]
}
