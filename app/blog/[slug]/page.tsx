import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import Link from "next/link"
import { generateMetadata as generateSEOMetadata } from "@/components/seo/seo-head"
import {
  StructuredData,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from "@/components/seo/structured-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, User, Eye, Heart, Share2, ArrowLeft, ArrowRight } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string) {
  try {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()

    if (error) throw error
    return post
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

async function getRelatedPosts(currentSlug: string, tags: string[], category: string) {
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .neq("slug", currentSlug)
      .or(`category.eq.${category},tags.ov.{${tags.join(",")}}`)
      .order("published_at", { ascending: false })
      .limit(3)

    if (error) throw error
    return posts || []
  } catch (error) {
    console.error("Error fetching related posts:", error)
    return []
  }
}

async function incrementViews(slug: string) {
  try {
    await supabase.rpc("increment_blog_views", { post_slug: slug })
  } catch (error) {
    console.error("Error incrementing views:", error)
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: "Post Not Found | Apna Coding",
      description: "The requested blog post could not be found.",
    }
  }

  return generateSEOMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.seo_keywords || post.tags,
    image: post.featured_image,
    url: `https://apnacoding.com/blog/${post.slug}`,
    type: "article",
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    author: post.author_name,
    section: post.category,
    tags: post.tags,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  // Increment views (fire and forget)
  incrementViews(params.slug)

  const relatedPosts = await getRelatedPosts(post.slug, post.tags || [], post.category)

  const articleSchema = generateArticleSchema(post)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://apnacoding.com" },
    { name: "Blog", url: "https://apnacoding.com/blog" },
    { name: post.title, url: `https://apnacoding.com/blog/${post.slug}` },
  ])
  const organizationSchema = generateOrganizationSchema()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={organizationSchema} />

      <div className="min-h-screen bg-white">
        {/* Back to Blog */}
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4">
          <header className="mb-8">
            {post.category && <Badge className="mb-4 bg-blue-600 text-white">{post.category}</Badge>}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>

            {/* Author and Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
              <div className="flex items-center gap-3">
                <Image
                  src={post.author_avatar || "/placeholder-user.jpg"}
                  alt={post.author_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center gap-1 text-gray-900 font-medium">
                    <User className="h-4 w-4" />
                    {post.author_name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} min read
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views} views
              </div>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                <Image
                  src={post.featured_image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Article Footer */}
          <footer className="border-t pt-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  {post.likes} Likes
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </footer>

          {/* Author Bio */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Image
                  src={post.author_avatar || "/placeholder-user.jpg"}
                  alt={post.author_name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author_name}</h3>
                  <p className="text-gray-600">
                    Author and tech enthusiast sharing insights about software development, career growth, and the
                    latest technology trends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={relatedPost.featured_image || "/placeholder.jpg"}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{relatedPost.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {relatedPost.reading_time} min
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto">
                          Read More <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  )
}
