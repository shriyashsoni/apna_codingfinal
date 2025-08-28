import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { extractIdFromSlug } from "@/lib/supabase"
import { getCourseById } from "@/lib/supabase"
import CourseDetailClient from "./CourseDetailClient"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const courseId = extractIdFromSlug(params.slug)
  const { data: course } = await getCourseById(courseId)

  if (!course) {
    return {
      title: "Course Not Found - Apna Coding",
      description: "The course you're looking for doesn't exist.",
    }
  }

  const baseUrl = "https://apnacoding.tech"
  const courseUrl = `${baseUrl}/courses/${params.slug}`
  const imageUrl = course.image_url || `${baseUrl}/images/courses-hero.png`

  return {
    title: `${course.title} - ${course.instructor} | Apna Coding`,
    description: course.description.substring(0, 160),
    keywords: [
      course.title,
      course.instructor,
      course.category,
      "online course",
      "programming course",
      "coding tutorial",
      ...course.technologies,
      course.level,
    ],
    authors: [{ name: "Apna Coding" }, { name: course.instructor }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: courseUrl,
    },
    openGraph: {
      title: `${course.title} - ${course.instructor}`,
      description: course.description.substring(0, 200),
      url: courseUrl,
      siteName: "Apna Coding",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${course.title} - ${course.instructor}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} - ${course.instructor}`,
      description: course.description.substring(0, 200),
      site: "@apnacoding",
      creator: "@shriyashsoni",
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const courseId = extractIdFromSlug(params.slug)
  const { data: course, error } = await getCourseById(courseId)

  if (error || !course) {
    notFound()
  }

  return <CourseDetailClient course={course} />
}
