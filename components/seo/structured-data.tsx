import Script from "next/script"

interface StructuredDataProps {
  type: "Organization" | "Event" | "JobPosting" | "Course" | "Article" | "Person"
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type,
    }

    switch (type) {
      case "Organization":
        return {
          ...baseData,
          name: "Apna Coding",
          url: "https://apnacoding.tech",
          logo: "https://apnacoding.tech/logo.png",
          description: "Global tech community for developers, hackathons, courses, and job opportunities",
          foundingDate: "2023",
          founder: {
            "@type": "Person",
            name: "Shriyash Soni",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8989976990",
            contactType: "Customer Service",
            email: "apnacoding.tech@gmail.com",
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Jabalpur",
            addressRegion: "MP",
            postalCode: "482001",
            addressCountry: "IN",
          },
          sameAs: [
            "https://discord.gg/krffBfBF",
            "https://github.com/APNA-CODING-BY-APNA-COUNSELLOR",
            "https://chat.whatsapp.com/HqVg4ctR6QKJnfvemsEQ8H",
          ],
        }

      case "Event":
        return {
          ...baseData,
          name: data.title,
          description: data.description,
          startDate: data.start_date,
          endDate: data.end_date,
          location: {
            "@type": "Place",
            name: data.location,
            address: data.location,
          },
          organizer: {
            "@type": "Organization",
            name: data.organizer || "Apna Coding",
            url: "https://apnacoding.tech",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: data.registration_link || `https://apnacoding.tech/hackathons/${data.slug}`,
          },
          image: data.image_url || "https://apnacoding.tech/images/hackathon-hero.png",
          url: `https://apnacoding.tech/hackathons/${data.slug}`,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode:
            data.mode === "online"
              ? "https://schema.org/OnlineEventAttendanceMode"
              : data.mode === "offline"
                ? "https://schema.org/OfflineEventAttendanceMode"
                : "https://schema.org/MixedEventAttendanceMode",
        }

      case "JobPosting":
        return {
          ...baseData,
          title: data.title,
          description: data.description,
          hiringOrganization: {
            "@type": "Organization",
            name: data.company,
            logo: data.company_logo,
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: data.location,
            },
          },
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              value: data.salary,
            },
          },
          employmentType: data.type?.toUpperCase(),
          datePosted: data.posted_date,
          validThrough: data.application_deadline,
          url: `https://apnacoding.tech/jobs/${data.slug}`,
          applicationContact: {
            "@type": "ContactPoint",
            email: "jobs@apnacoding.tech",
          },
        }

      case "Course":
        return {
          ...baseData,
          name: data.title,
          description: data.description,
          provider: {
            "@type": "Organization",
            name: "Apna Coding",
            url: "https://apnacoding.tech",
          },
          instructor: {
            "@type": "Person",
            name: data.instructor,
          },
          courseCode: data.id,
          educationalLevel: data.level,
          timeRequired: data.duration,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: data.rating,
            ratingCount: data.students_count,
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          url: `https://apnacoding.tech/courses/${data.slug}`,
          image: data.image_url,
        }

      case "Article":
        return {
          ...baseData,
          headline: data.title,
          description: data.excerpt,
          author: {
            "@type": "Person",
            name: data.author_name || "Apna Coding Team",
          },
          publisher: {
            "@type": "Organization",
            name: "Apna Coding",
            logo: {
              "@type": "ImageObject",
              url: "https://apnacoding.tech/logo.png",
            },
          },
          datePublished: data.published_at,
          dateModified: data.updated_at,
          image: data.featured_image,
          url: `https://apnacoding.tech/blog/${data.slug}`,
          wordCount: data.content?.length || 1000,
          keywords: data.tags?.join(", "),
        }

      default:
        return { ...baseData, ...data }
    }
  }

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateStructuredData()),
      }}
    />
  )
}
