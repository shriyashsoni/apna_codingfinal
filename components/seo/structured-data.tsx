"use client"

import { useEffect } from "react"

interface StructuredDataProps {
  data: any
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [data])

  return null
}

// Helper functions to generate structured data
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Apna Coding",
  url: "https://apnacoding.com",
  logo: "https://apnacoding.com/logo.png",
  description: "Global tech community for developers, hackathons, courses, and job opportunities",
  sameAs: [
    "https://twitter.com/apnacoding",
    "https://linkedin.com/company/apnacoding",
    "https://github.com/apnacoding",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-555-123-4567",
    contactType: "customer service",
    email: "hello@apnacoding.com",
  },
})

export const generateEventSchema = (hackathon: any) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: hackathon.title,
  description: hackathon.description,
  startDate: hackathon.start_date,
  endDate: hackathon.end_date,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode:
    hackathon.mode === "online"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
  location:
    hackathon.mode === "online"
      ? {
          "@type": "VirtualLocation",
          url: hackathon.registration_url,
        }
      : {
          "@type": "Place",
          name: hackathon.location,
          address: hackathon.location,
        },
  organizer: {
    "@type": "Organization",
    name: "Apna Coding",
    url: "https://apnacoding.com",
  },
  offers: {
    "@type": "Offer",
    price: hackathon.entry_fee || "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `https://apnacoding.com/hackathons/${hackathon.slug}`,
  },
  image: hackathon.banner_image,
  url: `https://apnacoding.com/hackathons/${hackathon.slug}`,
})

export const generateJobPostingSchema = (job: any) => ({
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: job.title,
  description: job.description,
  datePosted: job.created_at,
  validThrough: job.application_deadline,
  employmentType: job.type?.toUpperCase(),
  hiringOrganization: {
    "@type": "Organization",
    name: job.company,
    logo: job.company_logo,
  },
  jobLocation:
    job.location_type === "remote"
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Remote",
          },
        }
      : {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
          },
        },
  baseSalary:
    job.salary_min && job.salary_max
      ? {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salary_min,
            maxValue: job.salary_max,
            unitText: "YEAR",
          },
        }
      : undefined,
  url: `https://apnacoding.com/jobs/${job.slug}`,
})

export const generateCourseSchema = (course: any) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.title,
  description: course.description,
  provider: {
    "@type": "Organization",
    name: "Apna Coding",
    url: "https://apnacoding.com",
  },
  courseCode: course.slug,
  educationalLevel: course.level,
  teaches: course.skills,
  timeRequired: course.duration,
  offers: {
    "@type": "Offer",
    price: course.price || "0",
    priceCurrency: "USD",
    category: "Educational",
  },
  image: course.thumbnail,
  url: `https://apnacoding.com/courses/${course.slug}`,
})

export const generateArticleSchema = (article: any) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.excerpt,
  image: article.featured_image,
  author: {
    "@type": "Person",
    name: article.author_name,
    image: article.author_avatar,
  },
  publisher: {
    "@type": "Organization",
    name: "Apna Coding",
    logo: {
      "@type": "ImageObject",
      url: "https://apnacoding.com/logo.png",
    },
  },
  datePublished: article.published_at,
  dateModified: article.updated_at,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://apnacoding.com/blog/${article.slug}`,
  },
  keywords: article.tags?.join(", "),
  articleSection: article.category,
  wordCount: Math.ceil(article.content?.length / 5) || 0,
  url: `https://apnacoding.com/blog/${article.slug}`,
})

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})
