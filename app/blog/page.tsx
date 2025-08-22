import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"
import { generateMetadata as generateSEOMetadata } from "@/components/seo/seo-head"
import { StructuredData, generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/seo/structured-data"
import BlogClientPage from "./BlogClientPage"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const metadata: Metadata = generateSEOMetadata({
  title: "Coding Tips, Tech News & Tutorials | Apna Coding Blog",
  description:
    "Stay updated with the latest tech news, coding tutorials, career advice, and programming tips on the Apna Coding Blog. Learn from industry experts.",
  keywords: [
    "coding blog",
    "tech news",
    "programming tutorials",
    "software development",
    "web development",
    "mobile development",
    "data science",
    "machine learning",
    "career advice",
    "coding tips",
    "apna coding blog",
  ],
  url: "https://apnacoding.com/blog",
  type: "website",
})

async function getBlogPosts() {
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })

    if (error) throw error
    return posts || []
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

async function getFeaturedPosts() {
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(3)

    if (error) throw error
    return posts || []
  } catch (error) {
    console.error("Error fetching featured posts:", error)
    return []
  }
}

async function getCategories() {
  try {
    const { data: categories, error } = await supabase
      .from("blog_posts")
      .select("category")
      .eq("published", true)
      .not("category", "is", null)

    if (error) throw error

    const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])]
    return uniqueCategories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function BlogPage() {
  const [posts, featuredPosts, categories] = await Promise.all([getBlogPosts(), getFeaturedPosts(), getCategories()])

  const organizationSchema = generateOrganizationSchema()
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://apnacoding.com" },
    { name: "Blog", url: "https://apnacoding.com/blog" },
  ])

  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={breadcrumbSchema} />
      <BlogClientPage posts={posts} featuredPosts={featuredPosts} categories={categories} />
    </>
  )
}
