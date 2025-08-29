import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// Create client component client (for use in client components)
export function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create server component client (for use in server components)
export function createServerComponentClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "user" | "admin"
  github_url?: string
  linkedin_url?: string
  bio?: string
  skills?: string[]
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  image_url?: string
  event_date: string
  end_date?: string
  location: string
  event_type: "workshop" | "webinar" | "conference" | "meetup" | "bootcamp" | "seminar"
  technologies: string[]
  organizer: string
  max_participants: number
  current_participants: number
  registration_fee: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  registration_open: boolean
  registration_link?: string
  event_mode: "online" | "offline" | "hybrid"
  tags: string[]
  requirements?: string[]
  agenda?: string
  speaker_info?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Hackathon {
  id: string
  title: string
  description: string
  image_url?: string
  start_date: string
  end_date: string
  registration_deadline?: string
  location: string
  prize_pool: string
  participants_count: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  registration_open: boolean
  technologies: string[]
  registration_link?: string
  whatsapp_link?: string
  organizer?: string
  partnerships?: string[]
  featured: boolean
  mode: "online" | "offline" | "hybrid"
  difficulty: "beginner" | "intermediate" | "advanced"
  max_team_size?: number
  created_by?: string
  created_at: string
  updated_at: string
  slug?: string
}

export interface Job {
  id: string
  title: string
  company: string
  description: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  salary: string
  experience: string
  technologies: string[]
  company_logo?: string
  status: "active" | "inactive" | "filled"
  posted_date: string
  application_deadline?: string
  apply_link?: string
  requirements?: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string
  member_count: number
  type: "discord" | "telegram" | "whatsapp"
  invite_link: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface HackathonRegistration {
  id: string
  hackathon_id: string
  user_id: string
  registered_at: string
  status: "registered" | "cancelled" | "attended"
  team_name?: string
  team_members?: any[]
  additional_info?: any
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: "registered" | "cancelled" | "attended"
  additional_info?: any
  created_at: string
  updated_at: string
}

export interface Partnership {
  id: string
  title: string
  description: string
  image_url?: string
  partner_logo?: string
  partner_name: string
  partner_website?: string
  partnership_type: "general" | "educational" | "corporate" | "startup" | "nonprofit"
  status: "active" | "inactive" | "draft"
  featured: boolean
  benefits: string[]
  contact_email?: string
  contact_person?: string
  start_date?: string
  end_date?: string
  partnership_date?: string
  partnership_photo?: string
  social_links: { [key: string]: string }
  tags: string[]
  priority: number
  created_by?: string
  created_at: string
  updated_at: string
}

// Auth functions with Google OAuth and Email Integration
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    // Create user profile in database
    if (data.user && !error) {
      await createUserProfile(data.user.id, {
        email: data.user.email!,
        full_name: fullName,
        role: data.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
      })

      // Send welcome email
      try {
        const { sendWelcomeEmail } = await import("./email")
        await sendWelcomeEmail(data.user.email!, fullName, data.user.id)
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
        // Don't fail the signup if email fails
      }
    }

    return { data, error }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { data: null, error }
  }
}

// Primary signIn function - EXPORTED
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { data: null, error }
  }
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })
    return { data, error }
  } catch (error) {
    console.error("Error in signInWithGoogle:", error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error in signOut:", error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error:", error)
      return null
    }

    if (!user) {
      return null
    }

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError)
      return null
    }

    // If no profile exists, create one
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        role: user.email === "sonishriyash@gmail.com" ? "admin" : "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdProfile, error: createError } = await supabase
        .from("users")
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        console.error("Profile creation error:", createError)
        return null
      }

      // Send welcome email for new Google users
      try {
        const { sendWelcomeEmail } = await import("./email")
        await sendWelcomeEmail(user.email!, newProfile.full_name, user.id)
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError)
      }

      return createdProfile
    }

    return profile
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const getSession = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Create user profile in database
export const createUserProfile = async (
  userId: string,
  userData: {
    email: string
    full_name: string
    role?: "user" | "admin"
    avatar_url?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          ...userData,
          role: userData.email === "sonishriyash@gmail.com" ? "admin" : userData.role || "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { data: null, error }
  }
}

// Get user profile from database
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, return null without error
      return { data: null, error: null }
    }

    return { data, error }
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return { data: null, error }
  }
}

// Update user profile with better error handling
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    // First, check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (fetchError && fetchError.code === "PGRST116") {
      // User doesn't exist, create new profile
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        throw new Error("User not authenticated to create profile.")
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: authData.user.email,
          full_name: updates.full_name || "",
          bio: updates.bio || null,
          github_url: updates.github_url || null,
          linkedin_url: updates.linkedin_url || null,
          skills: updates.skills || null,
          role: authData.user.email === "sonishriyash@gmail.com" ? "admin" : "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      return { data, error }
    } else if (fetchError) {
      return { data: null, error: fetchError }
    }

    // User exists, update profile
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    return { data, error }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    return { data: null, error }
  }
}

// Admin check function with enhanced logic for sonishriyash@gmail.com
export const isAdmin = async (email?: string) => {
  try {
    if (!email) {
      const user = await getCurrentUser()
      if (!user?.email) return false
      email = user.email
    }

    // Check if the email is the main admin
    if (email === "sonishriyash@gmail.com") {
      return true
    }

    // Check database for additional admins
    const { data, error } = await supabase.from("users").select("role").eq("email", email).single()

    if (error) return false
    return data?.role === "admin"
  } catch (error) {
    console.error("Error in isAdmin:", error)
    return false
  }
}

export async function checkUserAuth() {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error) {
    console.error("Error checking user auth:", error)
    return null
  }
}

// Get user organizer status
export const getUserOrganizerStatus = async (userId: string) => {
  try {
    const { data: roles, error } = await supabase
      .from("organizer_roles")
      .select("role_name")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching organizer status:", error)
      return { is_organizer: false, organizer_types: [] }
    }

    const organizer_types = roles?.map((role) => role.role_name) || []

    return {
      is_organizer: organizer_types.length > 0,
      organizer_types,
    }
  } catch (error) {
    console.error("Error in getUserOrganizerStatus:", error)
    return { is_organizer: false, organizer_types: [] }
  }
}

// Database functions for Events
export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "upcoming")
      .order("event_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in getEvents:", error)
    return { data: null, error }
  }
}

// Get ALL events (including past, ongoing, cancelled) - FIXED
export const getAllEvents = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false }) // Show newest first
    return { data, error }
  } catch (error) {
    console.error("Error in getAllEvents:", error)
    return { data: null, error }
  }
}

export const createEvent = async (event: Omit<Event, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...event,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in createEvent:", error)
    return { data: null, error }
  }
}

export const updateEvent = async (id: string, updates: Partial<Event>) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in updateEvent:", error)
    return { data: null, error }
  }
}

export const deleteEvent = async (id: string) => {
  try {
    const { data, error } = await supabase.from("events").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error in deleteEvent:", error)
    return { data: null, error }
  }
}

export const getEventById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getEventById:", error)
    return { data: null, error }
  }
}

// Enhanced function to get event by partial ID (from slug) - COMPLETELY FIXED
export const getEventBySlugId = async (slugId: string) => {
  try {
    console.log("🔍 Looking for event with slug ID:", slugId)

    // 1. First try exact ID match
    const { data: exactMatch, error: exactError } = await supabase.from("events").select("*").eq("id", slugId).single()

    if (exactMatch && !exactError) {
      console.log("✅ Found event by exact ID:", exactMatch.title)
      return { data: exactMatch, error: null }
    }

    // 2. Try to find by partial UUID match (first 8 characters)
    if (slugId.length >= 8) {
      const { data: partialMatches, error: partialError } = await supabase
        .from("events")
        .select("*")
        .ilike("id", `${slugId}%`)

      if (!partialError && partialMatches && partialMatches.length > 0) {
        console.log("✅ Found event by partial ID match:", partialMatches[0].title)
        return { data: partialMatches[0], error: null }
      }
    }

    // 3. Try to extract UUID-like pattern from slug and search
    const uuidPattern = /[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/i
    const uuidMatch = slugId.match(uuidPattern)

    if (uuidMatch) {
      const uuid = uuidMatch[0]
      console.log("🔍 Trying UUID pattern:", uuid)

      const { data: uuidData, error: uuidError } = await supabase.from("events").select("*").eq("id", uuid).single()

      if (uuidData && !uuidError) {
        console.log("✅ Found event by UUID pattern:", uuidData.title)
        return { data: uuidData, error: null }
      }
    }

    // 4. Get all events and try to match by generated slug
    const { data: allEvents, error: allError } = await supabase.from("events").select("*")

    if (!allError && allEvents) {
      for (const event of allEvents) {
        const generatedSlug = generateSlug(event.title, event.id)
        if (generatedSlug === slugId) {
          console.log("✅ Found event by generated slug match:", event.title)
          return { data: event, error: null }
        }

        // Also try matching with just the ID part
        const idPart = event.id.substring(0, 8)
        if (slugId.endsWith(idPart) || slugId.includes(idPart)) {
          console.log("✅ Found event by ID part match:", event.title)
          return { data: event, error: null }
        }
      }
    }

    // 5. Final fallback - search by title similarity
    const titleSearch = slugId
      .replace(/-/g, " ")
      .replace(/[0-9a-f]{8,}/gi, "")
      .trim()

    if (titleSearch.length > 3) {
      const { data: titleEvents, error: titleError } = await supabase
        .from("events")
        .select("*")
        .ilike("title", `%${titleSearch}%`)
        .limit(1)

      if (!titleError && titleEvents && titleEvents.length > 0) {
        console.log("✅ Found event by title search:", titleEvents[0].title)
        return { data: titleEvents[0], error: null }
      }
    }

    console.log("❌ No event found for slug:", slugId)
    return { data: null, error: { message: "Event not found", code: "PGRST116" } }
  } catch (error) {
    console.error("❌ Error in getEventBySlugId:", error)
    return { data: null, error }
  }
}

// Utility function to generate SEO-friendly slug from title
export const generateSlug = (title: string, id: string) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  // Use first 8 characters of ID for uniqueness
  return `${slug}-${id.substring(0, 8)}`
}

// Function to extract ID from slug - COMPLETELY IMPROVED
export const extractIdFromSlug = (slug: string) => {
  console.log("🔍 Extracting ID from slug:", slug)

  // 1. First check if the slug itself is a UUID
  const uuidPattern = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i
  if (uuidPattern.test(slug)) {
    console.log("✅ Slug is a complete UUID:", slug)
    return slug
  }

  // 2. Look for UUID pattern anywhere in the slug
  const uuidInSlugPattern = /[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/i
  const uuidMatch = slug.match(uuidInSlugPattern)
  if (uuidMatch) {
    console.log("✅ Found UUID in slug:", uuidMatch[0])
    return uuidMatch[0]
  }

  // 3. Split by hyphens and look for UUID-like parts
  const parts = slug.split("-")

  // Look for parts that look like UUID segments (8+ hex characters)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    if (part && part.length >= 8 && /^[a-f0-9]{8,}$/i.test(part)) {
      console.log("✅ Found UUID-like part:", part)
      return part
    }
  }

  // 4. Look for any hex string of 8+ characters
  const hexPattern = /[a-f0-9]{8,}/i
  const hexMatch = slug.match(hexPattern)
  if (hexMatch) {
    console.log("✅ Found hex pattern:", hexMatch[0])
    return hexMatch[0]
  }

  // 5. If nothing found, return the original slug
  console.log("⚠️ Using original slug as fallback:", slug)
  return slug
}

// Rest of the functions remain the same...
export const getHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathons:", error)
    return { data: null, error }
  }
}

export const getAllHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllHackathons:", error)
    return { data: null, error }
  }
}

export const createHackathon = async (hackathon: Omit<Hackathon, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
      .from("hackathons")
      .insert([
        {
          ...hackathon,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in createHackathon:", error)
    return { data: null, error }
  }
}

export const updateHackathon = async (id: string, updates: Partial<Hackathon>) => {
  try {
    const { data, error } = await supabase
      .from("hackathons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in updateHackathon:", error)
    return { data: null, error }
  }
}

export const deleteHackathon = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error in deleteHackathon:", error)
    return { data: null, error }
  }
}

export const getHackathonById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathonById:", error)
    return { data: null, error }
  }
}

// Get hackathon by slug
export const getHackathonBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("slug", slug).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getHackathonBySlug:", error)
    return { data: null, error }
  }
}

// Database functions for Jobs
export const getJobs = async () => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("posted_date", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getJobs:", error)
    return { data: null, error }
  }
}

export const getAllJobs = async () => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllJobs:", error)
    return { data: null, error }
  }
}

export const createJob = async (job: Omit<Job, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          ...job,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in createJob:", error)
    return { data: null, error }
  }
}

export const updateJob = async (id: string, updates: Partial<Job>) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in updateJob:", error)
    return { data: null, error }
  }
}

export const deleteJob = async (id: string) => {
  try {
    const { data, error } = await supabase.from("jobs").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error in deleteJob:", error)
    return { data: null, error }
  }
}

export const getJobById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getJobById:", error)
    return { data: null, error }
  }
}

// Database functions for Partnerships
export const getPartnerships = async () => {
  try {
    const { data, error } = await supabase
      .from("community_partnerships")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getPartnerships:", error)
    return { data: null, error }
  }
}

export const getAllPartnerships = async () => {
  try {
    const { data, error } = await supabase
      .from("community_partnerships")
      .select("*")
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllPartnerships:", error)
    return { data: null, error }
  }
}

export const createPartnership = async (partnership: Omit<Partnership, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
      .from("community_partnerships")
      .insert([
        {
          ...partnership,
          created_by: currentUser?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in createPartnership:", error)
    return { data: null, error }
  }
}

export const updatePartnership = async (id: string, updates: Partial<Partnership>) => {
  try {
    const { data, error } = await supabase
      .from("community_partnerships")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in updatePartnership:", error)
    return { data: null, error }
  }
}

export const deletePartnership = async (id: string) => {
  try {
    const { data, error } = await supabase.from("community_partnerships").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error in deletePartnership:", error)
    return { data: null, error }
  }
}

export const getPartnershipById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("community_partnerships").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error in getPartnershipById:", error)
    return { data: null, error }
  }
}

// User Management Functions
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return { data: null, error }
  }
}

export const updateUserRole = async (userId: string, role: "user" | "admin") => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error in updateUserRole:", error)
    return { data: null, error }
  }
}

export const deleteUser = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("users").delete().eq("id", userId)
    return { data, error }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return { data: null, error }
  }
}

// Communities
export const getCommunities = async () => {
  try {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("status", "active")
      .order("member_count", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in getCommunities:", error)
    return { data: null, error }
  }
}

// Event registration functions with automatic email integration
export const registerForEvent = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          registered_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error registering for event:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_event_participants", {
      event_id: eventId,
    })

    if (updateError) {
      console.error("Error updating participant count:", updateError)
    }

    // Send registration confirmation email automatically
    try {
      const [userResult, eventResult] = await Promise.all([
        supabase.from("users").select("email, full_name").eq("id", userId).single(),
        supabase.from("events").select("title, event_date, location").eq("id", eventId).single(),
      ])

      if (userResult.data && eventResult.data) {
        const { sendEventRegistrationEmail } = await import("./email")
        await sendEventRegistrationEmail(
          userResult.data.email,
          userResult.data.full_name || "User",
          eventResult.data.title,
          new Date(eventResult.data.event_date).toLocaleDateString(),
          eventResult.data.location,
          userId,
        )
        console.log("Event registration email sent successfully")
      }
    } catch (emailError) {
      console.error("Error sending registration email:", emailError)
      // Don't fail the registration if email fails
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in registerForEvent:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const checkEventRegistration = async (eventId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in checkEventRegistration:", error)
    return false
  }
}

// Hackathon registration functions with automatic email integration
export const registerForHackathon = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_registrations")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: userId,
          registered_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error registering for hackathon:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_hackathon_participants", {
      hackathon_id: hackathonId,
    })

    if (updateError) {
      console.error("Error updating participant count:", updateError)
    }

    // Send registration confirmation email automatically
    try {
      const [userResult, hackathonResult] = await Promise.all([
        supabase.from("users").select("email, full_name").eq("id", userId).single(),
        supabase.from("hackathons").select("title, start_date").eq("id", hackathonId).single(),
      ])

      if (userResult.data && hackathonResult.data) {
        const { sendHackathonRegistrationEmail } = await import("./email")
        await sendHackathonRegistrationEmail(
          userResult.data.email,
          userResult.data.full_name || "User",
          hackathonResult.data.title,
          new Date(hackathonResult.data.start_date).toLocaleDateString(),
          userId,
        )
        console.log("Hackathon registration email sent successfully")
      }
    } catch (emailError) {
      console.error("Error sending registration email:", emailError)
      // Don't fail the registration if email fails
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in registerForHackathon:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const checkHackathonRegistration = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_registrations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in checkHackathonRegistration:", error)
    return false
  }
}

// Analytics functions for admin dashboard
export const getAnalytics = async () => {
  try {
    const [usersResult, hackathonsResult, jobsResult, eventsResult, registrationsResult] = await Promise.all([
      supabase.from("users").select("id, created_at, role, email"),
      supabase.from("hackathons").select("id, status, participants_count, created_at, technologies"),
      supabase.from("jobs").select("id, status, posted_date, created_at, technologies"),
      supabase.from("events").select("id, status, current_participants, created_at, technologies"),
      supabase.from("hackathon_registrations").select("id, created_at, hackathon_id, user_id"),
    ])

    return {
      users: usersResult.data || [],
      hackathons: hackathonsResult.data || [],
      jobs: jobsResult.data || [],
      events: eventsResult.data || [],
      registrations: registrationsResult.data || [],
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      users: [],
      hackathons: [],
      jobs: [],
      events: [],
      registrations: [],
    }
  }
}

// Get detailed analytics with growth calculations
export const getDetailedAnalytics = async () => {
  try {
    const data = await getAnalytics()

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Calculate totals
    const totalUsers = data.users.length
    const activeHackathons = data.hackathons.filter((h) => h.status === "upcoming" || h.status === "ongoing").length
    const jobListings = data.jobs.filter((j) => j.status === "active").length
    const events = data.events.filter((e) => e.status === "upcoming" || e.status === "ongoing").length

    // Calculate growth
    const recentUsers = data.users.filter((u) => new Date(u.created_at) > lastMonth).length
    const userGrowth = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0

    const recentHackathons = data.hackathons.filter((h) => new Date(h.created_at) > lastMonth).length
    const hackathonGrowth = activeHackathons > 0 ? (recentHackathons / activeHackathons) * 100 : 0

    const recentJobs = data.jobs.filter((j) => new Date(j.created_at) > lastMonth).length
    const jobGrowth = jobListings > 0 ? (recentJobs / jobListings) * 100 : 0

    const recentEvents = data.events.filter((e) => new Date(e.created_at) > lastMonth).length
    const eventGrowth = events > 0 ? (recentEvents / events) * 100 : 0

    // Technology analysis
    const techCount: { [key: string]: number } = {}

    data.events.forEach((event) => {
      if (event.technologies) {
        event.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    data.hackathons.forEach((hackathon) => {
      if (hackathon.technologies) {
        hackathon.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    data.jobs.forEach((job) => {
      if (job.technologies) {
        job.technologies.forEach((tech: string) => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })

    const topTechnologies = Object.entries(techCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Users by role
    const roleCount: { [key: string]: number } = {}
    data.users.forEach((user) => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1
    })
    const usersByRole = Object.entries(roleCount).map(([role, count]) => ({ role, count }))

    return {
      totals: {
        totalUsers,
        activeHackathons,
        jobListings,
        events,
      },
      growth: {
        userGrowth: Math.round(userGrowth * 10) / 10,
        hackathonGrowth: Math.round(hackathonGrowth * 10) / 10,
        jobGrowth: Math.round(jobGrowth * 10) / 10,
        eventGrowth: Math.round(eventGrowth * 10) / 10,
      },
      topTechnologies,
      usersByRole,
      rawData: data,
    }
  } catch (error) {
    console.error("Error fetching detailed analytics:", error)
    return {
      totals: { totalUsers: 0, activeHackathons: 0, jobListings: 0, events: 0 },
      growth: { userGrowth: 0, hackathonGrowth: 0, jobGrowth: 0, eventGrowth: 0 },
      topTechnologies: [],
      usersByRole: [],
      rawData: { users: [], hackathons: [], jobs: [], events: [], registrations: [] },
    }
  }
}

// Search functions
export const searchEvents = async (query: string, eventType?: string) => {
  try {
    let queryBuilder = supabase.from("events").select("*").eq("status", "upcoming")

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,technologies.cs.{${query}}`)
    }

    if (eventType && eventType !== "All") {
      queryBuilder = queryBuilder.eq("event_type", eventType)
    }

    const { data, error } = await queryBuilder.order("event_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in searchEvents:", error)
    return { data: null, error }
  }
}

export const searchHackathons = async (query: string, status?: string) => {
  try {
    let queryBuilder = supabase.from("hackathons").select("*")

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,technologies.cs.{${query}}`,
      )
    }

    if (status && status !== "all") {
      queryBuilder = queryBuilder.eq("status", status)
    }

    const { data, error } = await queryBuilder.order("start_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("Error in searchHackathons:", error)
    return { data: null, error }
  }
}

export const searchJobs = async (query: string, type?: string, experience?: string) => {
  try {
    let queryBuilder = supabase.from("jobs").select("*").eq("status", "active")

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%,technologies.cs.{${query}}`,
      )
    }

    if (type && type !== "All") {
      queryBuilder = queryBuilder.eq("type", type)
    }

    if (experience && experience !== "All") {
      queryBuilder = queryBuilder.eq("experience", experience)
    }

    const { data, error } = await queryBuilder.order("posted_date", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in searchJobs:", error)
    return { data: null, error }
  }
}

export const searchPartnerships = async (query: string, type?: string) => {
  try {
    let queryBuilder = supabase.from("community_partnerships").select("*").eq("status", "active")

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,partner_name.ilike.%${query}%,tags.cs.{${query}}`,
      )
    }

    if (type && type !== "all") {
      queryBuilder = queryBuilder.eq("partnership_type", type)
    }

    const { data, error } = await queryBuilder.order("priority", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("Error in searchPartnerships:", error)
    return { data: null, error }
  }
}
