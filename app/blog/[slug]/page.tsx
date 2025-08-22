import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BlogPostClient from "./BlogPostClient"
import SEOHead from "@/components/seo/seo-head"
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/structured-data"

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string
  featured_image: string
  category: string
  tags: string[]
  published_at: string
  updated_at: string
  reading_time: number
  view_count: number
  seo_title: string
  seo_description: string
  seo_keywords: string[]
  og_title: string
  og_description: string
  og_image: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: "Article Not Found | Apna Coding",
      description: "The article you are looking for could not be found.",
    }
  }

  return {
    title: post.seo_title || `${post.title} | Apna Coding`,
    description: post.seo_description || post.excerpt,
    keywords: post.seo_keywords || post.tags,
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      url: `https://apnacoding.tech/blog/${post.slug}`,
      siteName: "Apna Coding",
      images: [
        {
          url: post.og_image || post.featured_image || "https://apnacoding.tech/images/blog-default.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image || "https://apnacoding.tech/images/blog-default.jpg"],
      creator: "@shriyashsoni",
      site: "@apnacoding",
    },
    alternates: {
      canonical: `https://apnacoding.tech/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("blog_posts")
    .update({ view_count: post.view_count + 1 })
    .eq("id", post.id)

  const breadcrumbItems = [
    { name: "Home", url: "https://apnacoding.tech" },
    { name: "Blog", url: "https://apnacoding.tech/blog" },
    { name: post.title, url: `https://apnacoding.tech/blog/${post.slug}` },
  ]

  return (
    <>
      <SEOHead
        title={post.seo_title || `${post.title} | Apna Coding`}
        description={post.seo_description || post.excerpt}
        keywords={post.seo_keywords || post.tags}
        canonicalUrl={`https://apnacoding.tech/blog/${post.slug}`}
        ogTitle={post.og_title || post.title}
        ogDescription={post.og_description || post.excerpt}
        ogImage={post.og_image || post.featured_image}
        ogType="article"
      />
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        author={post.author_name}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        image={post.featured_image}
        publisher={{
          name: "Apna Coding",
          logo: "https://apnacoding.tech/logo.png",
        }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <BlogPostClient post={post} />
    </>
  )
}
