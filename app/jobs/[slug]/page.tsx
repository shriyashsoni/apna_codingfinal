import { extractIdFromSlug, getJobById } from "@/lib/supabase"
import JobDetailClient from "./JobDetailPageClient"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const jobId = extractIdFromSlug(params.slug)
  const { data: job } = await getJobById(jobId)

  if (!job) {
    return {
      title: "Job Not Found - Apna Coding",
      description: "The job you're looking for doesn't exist.",
    }
  }

  const baseUrl = "https://apnacoding.tech"
  const jobUrl = `${baseUrl}/jobs/${params.slug}`
  const imageUrl =
    job.company_logo || `${baseUrl}/placeholder.svg?height=630&width=1200&text=${encodeURIComponent(job.company)}`

  return {
    title: `${job.title} at ${job.company} | Apna Coding Jobs`,
    description: job.description.substring(0, 160),
    keywords: [
      job.title,
      job.company,
      job.location,
      job.type,
      "job opportunity",
      "career",
      "hiring",
      ...job.technologies,
      job.experience,
    ],
    authors: [{ name: "Apna Coding" }],
    creator: "Apna Coding",
    publisher: "Apna Coding",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: jobUrl,
    },
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description: job.description.substring(0, 200),
      url: jobUrl,
      siteName: "Apna Coding",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company}`,
      description: job.description.substring(0, 200),
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

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const jobId = extractIdFromSlug(params.slug)
  const { data: job, error } = await getJobById(jobId)

  if (error || !job) {
    notFound()
  }

  return <JobDetailClient job={job} />
}
