import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community-partnerships`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
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
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ]

  try {
    // Get dynamic hackathon pages
    const { data: hackathons } = await supabase.from("hackathons").select("slug, updated_at").not("slug", "is", null)

    const hackathonPages =
      hackathons?.map((hackathon) => ({
        url: `${baseUrl}/hackathons/${hackathon.slug}`,
        lastModified: new Date(hackathon.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) || []

    // Get dynamic job pages
    const { data: jobs } = await supabase.from("jobs").select("slug, updated_at").not("slug", "is", null)

    const jobPages =
      jobs?.map((job) => ({
        url: `${baseUrl}/jobs/${job.slug}`,
        lastModified: new Date(job.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) || []

    // Get dynamic course pages
    const { data: courses } = await supabase.from("courses").select("slug, updated_at").not("slug", "is", null)

    const coursePages =
      courses?.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: new Date(course.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })) || []

    // Get dynamic blog pages
    const { data: blogPosts } = await supabase.from("blog_posts").select("slug, updated_at").eq("published", true)

    const blogPages =
      blogPosts?.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })) || []

    // Get dynamic mentorship pages
    const { data: mentorshipPrograms } = await supabase
      .from("mentorship_programs")
      .select("slug, updated_at")
      .eq("status", "active")

    const mentorshipPages =
      mentorshipPrograms?.map((program) => ({
        url: `${baseUrl}/mentorship/${program.slug}`,
        lastModified: new Date(program.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })) || []

    return [...staticPages, ...hackathonPages, ...jobPages, ...coursePages, ...blogPages, ...mentorshipPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticPages
  }
}
