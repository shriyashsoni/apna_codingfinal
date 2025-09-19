import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Create a singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "user" | "admin" | "organizer"
  bio?: string
  github_url?: string
  linkedin_url?: string
  skills?: string[]
  email_verified?: boolean
  profile_completed?: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  image_url?: string
  banner_url?: string
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
  prerequisites?: string[]
  learning_outcomes?: string[]
  agenda?: string
  speaker_info?: string
  certificate_provided?: boolean
  recording_available?: boolean
  live_streaming?: boolean
  social_links?: { [key: string]: string }
  featured?: boolean
  slug?: string
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

// Enhanced signup function
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    console.log("🔄 Attempting to sign up user:", email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("❌ Auth signup error:", error)
      return { data: null, error }
    }

    console.log("✅ Signup successful for:", email)
    return { data, error: null }
  } catch (error) {
    console.error("❌ Error in signUp:", error)
    return { data: null, error: { message: "An unexpected error occurred during signup" } }
  }
}

// Enhanced signIn function
export const signIn = async (email: string, password: string) => {
  try {
    console.log("🔄 Attempting to sign in user:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Auth signin error:", error)
      return { data: null, error }
    }

    console.log("✅ Sign in successful for:", email)

    // Update last login time
    if (data.user) {
      try {
        await supabase.rpc("update_user_last_login", { user_id: data.user.id })
      } catch (updateError) {
        console.error("⚠️ Error updating last login (non-blocking):", updateError)
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error("❌ Error in signIn:", error)
    return { data: null, error: { message: "An unexpected error occurred during signin" } }
  }
}

// Google OAuth sign in
export const signInWithGoogle = async () => {
  try {
    console.log("🔄 Initiating Google OAuth")
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

    if (error) {
      console.error("❌ Google OAuth error:", error)
    } else {
      console.log("✅ Google OAuth initiated successfully")
    }

    return { data, error }
  } catch (error) {
    console.error("❌ Error in signInWithGoogle:", error)
    return { data: null, error: { message: "Failed to sign in with Google" } }
  }
}

// Sign out function
export const signOut = async () => {
  try {
    console.log("🔄 Signing out user")
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    console.log("✅ Sign out successful")
  } catch (error) {
    console.error("❌ Error in signOut:", error)
    throw error
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("❌ Auth error:", error)
      return null
    }

    if (!user) {
      return null
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("❌ Profile fetch error:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("❌ Error getting current user:", error)
    return null
  }
}

// Get session
export const getSession = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("❌ Error getting session:", error)
    return null
  }
}

// Create user profile
export const createUserProfile = async (
  userId: string,
  userData: {
    email: string
    full_name: string
    role?: "user" | "admin" | "organizer"
    avatar_url?: string
  },
) => {
  try {
    const profileData = {
      id: userId,
      email: userData.email,
      full_name: userData.full_name || userData.email.split("@")[0],
      role: userData.email === "sonishriyash@gmail.com" ? "admin" : userData.role || "user",
      avatar_url: userData.avatar_url || null,
      email_verified: true,
      profile_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("users").insert([profileData]).select().single()

    if (error) {
      console.error("Database error creating profile:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { data: null, error }
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
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
    console.error("❌ Error in updateUserProfile:", error)
    return { data: null, error }
  }
}

// Admin check function
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
    console.error("❌ Error in isAdmin:", error)
    return false
  }
}

// Event registration functions
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
      console.error("❌ Error registering for event:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_event_participants", {
      event_id: eventId,
    })

    if (updateError) {
      console.error("⚠️ Error updating participant count:", updateError)
    }

    return { success: true, data }
  } catch (error) {
    console.error("❌ Error in registerForEvent:", error)
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
      console.error("❌ Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("❌ Error in checkEventRegistration:", error)
    return false
  }
}

// Hackathon registration functions
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
      console.error("❌ Error registering for hackathon:", error)
      return { success: false, error: error.message }
    }

    // Update participant count
    const { error: updateError } = await supabase.rpc("increment_hackathon_participants", {
      hackathon_id: hackathonId,
    })

    if (updateError) {
      console.error("⚠️ Error updating participant count:", updateError)
    }

    return { success: true, data }
  } catch (error) {
    console.error("❌ Error in registerForHackathon:", error)
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
      console.error("❌ Error checking registration:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("❌ Error in checkHackathonRegistration:", error)
    return false
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
    console.error("❌ Error in getEvents:", error)
    return { data: null, error }
  }
}

export const getAllEvents = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getAllEvents:", error)
    return { data: null, error }
  }
}

export const getEventById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getEventById:", error)
    return { data: null, error }
  }
}

// Database functions for Hackathons
export const getHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getHackathons:", error)
    return { data: null, error }
  }
}

export const getAllHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getAllHackathons:", error)
    return { data: null, error }
  }
}

export const getHackathonById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getHackathonById:", error)
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
    console.error("❌ Error in getJobs:", error)
    return { data: null, error }
  }
}

export const getAllJobs = async () => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getAllJobs:", error)
    return { data: null, error }
  }
}

export const getJobById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getJobById:", error)
    return { data: null, error }
  }
}

// User Management Functions
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error)
    return { data: null, error }
  }
}

export const updateUserRole = async (userId: string, role: "user" | "admin" | "organizer") => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
    return { data, error }
  } catch (error) {
    console.error("❌ Error in updateUserRole:", error)
    return { data: null, error }
  }
}

export const deleteUser = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("users").delete().eq("id", userId)
    return { data, error }
  } catch (error) {
    console.error("❌ Error in deleteUser:", error)
    return { data: null, error }
  }
}
