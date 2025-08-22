import Script from "next/script"

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  description: string
  sameAs: string[]
}

export function OrganizationSchema({ name, url, logo, description, sameAs }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-XXX-XXX-XXXX",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface EventSchemaProps {
  name: string
  description: string
  startDate: string
  endDate: string
  location: {
    name: string
    address: string
  }
  organizer: {
    name: string
    url: string
  }
  offers?: {
    price: string
    currency: string
    availability: string
  }
  image?: string
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  offers,
  image,
}: EventSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      name: location.name,
      address: location.address,
    },
    organizer: {
      "@type": "Organization",
      name: organizer.name,
      url: organizer.url,
    },
    ...(offers && {
      offers: {
        "@type": "Offer",
        price: offers.price,
        priceCurrency: offers.currency,
        availability: offers.availability,
      },
    }),
    ...(image && { image }),
  }

  return (
    <Script id="event-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  )
}

interface JobPostingSchemaProps {
  title: string
  description: string
  company: string
  location: string
  employmentType: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  datePosted: string
  validThrough?: string
  requirements?: string[]
}

export function JobPostingSchema({
  title,
  description,
  company,
  location,
  employmentType,
  salary,
  datePosted,
  validThrough,
  requirements,
}: JobPostingSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    hiringOrganization: {
      "@type": "Organization",
      name: company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
      },
    },
    employmentType,
    datePosted,
    ...(validThrough && { validThrough }),
    ...(salary && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: salary.currency,
        value: {
          "@type": "QuantitativeValue",
          minValue: salary.min,
          maxValue: salary.max,
          unitText: "YEAR",
        },
      },
    }),
    ...(requirements && {
      qualifications: requirements.join(", "),
    }),
  }

  return (
    <Script
      id="job-posting-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface CourseSchemaProps {
  name: string
  description: string
  provider: string
  instructor: string
  duration: string
  level: string
  price?: number
  currency?: string
  image?: string
  rating?: number
  reviewCount?: number
}

export function CourseSchema({
  name,
  description,
  provider,
  instructor,
  duration,
  level,
  price,
  currency,
  image,
  rating,
  reviewCount,
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    instructor: {
      "@type": "Person",
      name: instructor,
    },
    courseMode: "online",
    educationalLevel: level,
    timeRequired: duration,
    ...(price &&
      currency && {
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: currency,
        },
      }),
    ...(image && { image }),
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
        },
      }),
  }

  return (
    <Script
      id="course-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ArticleSchemaProps {
  headline: string
  description: string
  author: string
  datePublished: string
  dateModified: string
  image?: string
  publisher: {
    name: string
    logo: string
  }
}

export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  publisher,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    dateModified,
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      logo: {
        "@type": "ImageObject",
        url: publisher.logo,
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
