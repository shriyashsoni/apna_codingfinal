"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, User, Clock, ArrowLeft, Share2, Heart, Eye, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@supabase/supabase-js"
import StructuredData from "@/components/seo/structured-data"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  author_name: string
  featured_image: string
  tags: string[]
  categories: string[]
  published_at: string
  updated_at: string
  reading_time: number
  views_count: number
  likes_count: number
  featured: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (params.slug) {
      loadBlogPost(params.slug as string)
    }
  }, [params.slug])

  const loadBlogPost = async (slug: string) => {
    try {
      // Get the blog post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single()

      if (postError || !postData) {
        console.error("Error loading blog post:", postError)
        router.push("/blog")
        return
      }

      setPost(postData)

      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ views_count: (postData.views_count || 0) + 1 })
        .eq("id", postData.id)

      // Get related posts
      const { data: relatedData } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, published_at, reading_time, author_name")
        .eq("published", true)
        .neq("id", postData.id)
        .or(`categories.cs.{${postData.categories.join(",")}},tags.cs.{${postData.tags.join(",")}}`)
        .limit(3)

      setRelatedPosts(relatedData || [])
    } catch (error) {
      console.error("Error loading blog post:", error)
      router.push("/blog")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!post) return

    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleLike = async () => {
    if (!post) return

    setLiked(!liked)

    // Update like count in database
    const newLikeCount = liked ? post.likes_count - 1 : post.likes_count + 1
    await supabase.from("blog_posts").update({ likes_count: newLikeCount }).eq("id", post.id)

    setPost({ ...post, likes_count: newLikeCount })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/blog")} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <StructuredData type="Article" data={post} />

      <div className="min-h-screen bg-black text-white pt-20">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            onClick={() => router.push("/blog")}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Featured Image */}
            {post.featured_image && (
              <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                <Image src={post.featured_image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {post.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-400 text-black font-semibold">Featured Article</Badge>
                  </div>
                )}
              </div>
            )}

            {/* Article Meta */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views_count} views</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

              <p className="text-xl text-gray-300 mb-6 leading-relaxed">{post.excerpt}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-yellow-400 text-yellow-400">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`border-gray-600 ${liked ? "text-red-400 border-red-400" : "text-gray-300"} hover:bg-gray-700`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {post.likes_count} Likes
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg prose-invert max-w-none mb-12"
          >
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
            />
          </motion.div>

          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-gray-900 border-gray-800 mb-12">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{post.author_name}</h3>
                    <p className="text-gray-300">
                      Content creator and tech enthusiast at Apna Coding. Passionate about sharing knowledge and helping
                      developers grow their careers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 px-4 bg-gray-900/30">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all duration-300 group h-full">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={relatedPost.featured_image || "/images/blog/default.jpg"}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(relatedPost.published_at)}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{relatedPost.reading_time} min read</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors mb-3">
                          <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">{relatedPost.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">{relatedPost.author_name}</span>
                          <Link href={`/blog/${relatedPost.slug}`}>
                            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
                              Read More
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Enjoyed this article? <span className="text-yellow-400">Get more like this!</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Subscribe to our newsletter for weekly tech insights, coding tutorials, and career advice.
              </p>
              <Link href="/blog">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3">
                  Explore More Articles
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
