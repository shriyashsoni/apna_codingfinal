import { supabase } from "./supabase"

// Enhanced types for the hackathon system
export interface EnhancedHackathon {
  id: string
  title: string
  description: string
  hackathon_type: "external" | "apna_coding"
  platform_url?: string
  start_date: string
  end_date: string
  registration_deadline?: string
  location: string
  prize_pool: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  max_team_members: number
  min_team_members: number
  allow_individual: boolean
  submissions_open: boolean
  results_published: boolean
  total_participants: number
  total_teams: number
  total_submissions: number
  technologies: string[]
  organizer: string
  created_by?: string
  created_at: string
  updated_at: string
  featured?: boolean
  image_url?: string
  slug?: string
}

export interface ProblemStatement {
  id: string
  hackathon_id: string
  title: string
  description: string
  difficulty_level: "easy" | "medium" | "hard"
  max_points: number
  resources: string[]
  constraints: string[]
  evaluation_criteria: string[]
  sample_input?: string
  sample_output?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface HackathonPartnership {
  id: string
  hackathon_id: string
  partner_name: string
  partner_logo_url?: string
  partner_website?: string
  partnership_type: "sponsor" | "organizer" | "supporter" | "media"
  contribution_amount?: string
  benefits: string[]
  contact_person?: string
  contact_email?: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface HackathonTeam {
  id: string
  hackathon_id: string
  team_name: string
  team_leader_id: string
  invite_code: string
  description?: string
  current_members: number
  max_members: number
  is_full: boolean
  status: "active" | "inactive" | "disqualified"
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "leader" | "member"
  joined_at: string
  status: "pending" | "active" | "left" | "removed"
  invited_by?: string
  created_at: string
  users?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

export interface HackathonParticipant {
  id: string
  hackathon_id: string
  user_id: string
  team_id?: string
  participation_type: "individual" | "team"
  registration_status: "registered" | "confirmed" | "cancelled" | "disqualified"
  additional_info: any
  registered_at: string
  confirmed_at?: string
  created_at: string
  updated_at: string
  users?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  hackathon_teams?: {
    id: string
    team_name: string
  }
}

export interface HackathonSubmission {
  id: string
  hackathon_id: string
  team_id: string
  problem_statement_id?: string
  submitted_by: string
  project_title: string
  project_description: string
  github_repository_url?: string
  live_demo_url?: string
  presentation_url?: string
  video_demo_url?: string
  documentation_url?: string
  technologies_used: string[]
  challenges_faced?: string
  future_improvements?: string
  submission_status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  score: number
  feedback?: string
  reviewed_by?: string
  reviewed_at?: string
  submitted_at?: string
  created_at: string
  updated_at: string
}

// Enhanced hackathon functions
export const createEnhancedHackathon = async (
  hackathon: Omit<
    EnhancedHackathon,
    "id" | "created_at" | "updated_at" | "total_participants" | "total_teams" | "total_submissions"
  >,
) => {
  try {
    const currentUser = await supabase.auth.getUser()

    // Generate slug from title
    const slug = hackathon.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Prepare the data with proper date handling
    const hackathonData = {
      ...hackathon,
      slug,
      created_by: currentUser.data.user?.id,
      total_participants: 0,
      total_teams: 0,
      total_submissions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Ensure dates are properly formatted
    if (hackathonData.start_date) {
      hackathonData.start_date = new Date(hackathonData.start_date).toISOString()
    }
    if (hackathonData.end_date) {
      hackathonData.end_date = new Date(hackathonData.end_date).toISOString()
    }
    if (hackathonData.registration_deadline) {
      hackathonData.registration_deadline = new Date(hackathonData.registration_deadline).toISOString()
    }

    const { data, error } = await supabase.from("hackathons").insert([hackathonData]).select().single()

    return { data, error }
  } catch (error) {
    console.error("Error creating hackathon:", error)
    return {
      data: null,
      error: { message: "Failed to create hackathon: " + (error instanceof Error ? error.message : "Unknown error") },
    }
  }
}

export const getEnhancedHackathons = async () => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return { data: [], error: { message: "Failed to fetch hackathons" } }
  }
}

export const getEnhancedHackathonById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return { data: null, error: { message: "Failed to fetch hackathon" } }
  }
}

export const updateEnhancedHackathon = async (id: string, updates: Partial<EnhancedHackathon>) => {
  try {
    const { data, error } = await supabase
      .from("hackathons")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    return { data, error }
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return { data: null, error: { message: "Failed to update hackathon" } }
  }
}

export const deleteEnhancedHackathon = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathons").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error deleting hackathon:", error)
    return { data: null, error: { message: "Failed to delete hackathon" } }
  }
}

// Problem Statement Functions
export const createProblemStatement = async (
  problemStatement: Omit<ProblemStatement, "id" | "created_at" | "updated_at">,
) => {
  try {
    const currentUser = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .insert([
        {
          ...problemStatement,
          created_by: currentUser.data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error creating problem statement:", error)
    return { data: null, error: { message: "Failed to create problem statement" } }
  }
}

export const getProblemStatements = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: true })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching problem statements:", error)
    return { data: [], error: { message: "Failed to fetch problem statements" } }
  }
}

export const updateProblemStatement = async (id: string, updates: Partial<ProblemStatement>) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_problem_statements")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error updating problem statement:", error)
    return { data: null, error: { message: "Failed to update problem statement" } }
  }
}

export const deleteProblemStatement = async (id: string) => {
  try {
    const { data, error } = await supabase.from("hackathon_problem_statements").delete().eq("id", id)
    return { data, error }
  } catch (error) {
    console.error("Error deleting problem statement:", error)
    return { data: null, error: { message: "Failed to delete problem statement" } }
  }
}

// Partnership Functions
export const createHackathonPartnership = async (
  partnership: Omit<HackathonPartnership, "id" | "created_at" | "updated_at">,
) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_partnerships")
      .insert([
        {
          ...partnership,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
    return { data, error }
  } catch (error) {
    console.error("Error creating partnership:", error)
    return { data: null, error: { message: "Failed to create partnership" } }
  }
}

export const getHackathonPartnerships = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_partnerships")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching partnerships:", error)
    return { data: [], error: { message: "Failed to fetch partnerships" } }
  }
}

// Team Management Functions
export const createTeam = async (hackathonId: string, teamName: string, description?: string) => {
  try {
    const currentUser = await supabase.auth.getUser()
    if (!currentUser.data.user) {
      return { data: null, error: { message: "Not authenticated" } }
    }

    // Generate a simple invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .insert([
        {
          hackathon_id: hackathonId,
          team_name: teamName,
          team_leader_id: currentUser.data.user.id,
          invite_code: inviteCode,
          description,
          current_members: 1,
          max_members: 5,
          is_full: false,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (teamError) {
      return { data: null, error: teamError }
    }

    // Add team leader as first member
    const { error: memberError } = await supabase.from("team_members").insert([
      {
        team_id: team.id,
        user_id: currentUser.data.user.id,
        role: "leader",
        status: "active",
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ])

    if (memberError) {
      // Rollback team creation
      await supabase.from("hackathon_teams").delete().eq("id", team.id)
      return { data: null, error: memberError }
    }

    return { data: team, error: null }
  } catch (error) {
    console.error("Error creating team:", error)
    return { data: null, error: { message: "Failed to create team" } }
  }
}

export const joinTeamByInviteCode = async (inviteCode: string) => {
  try {
    const currentUser = await supabase.auth.getUser()
    if (!currentUser.data.user) {
      return { data: null, error: { message: "Not authenticated" } }
    }

    // Get team by invite code
    const { data: team, error: teamError } = await supabase
      .from("hackathon_teams")
      .select("*")
      .eq("invite_code", inviteCode)
      .eq("status", "active")
      .single()

    if (teamError || !team) {
      return { data: null, error: { message: "Invalid invite code or team not found" } }
    }

    if (team.is_full) {
      return { data: null, error: { message: "Team is full" } }
    }

    // Check if user is already in this team
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", team.id)
      .eq("user_id", currentUser.data.user.id)
      .single()

    if (existingMember) {
      return { data: null, error: { message: "You are already a member of this team" } }
    }

    // Add user to team
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .insert([
        {
          team_id: team.id,
          user_id: currentUser.data.user.id,
          role: "member",
          status: "active",
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    return { data: member, error: memberError }
  } catch (error) {
    console.error("Error joining team:", error)
    return { data: null, error: { message: "Failed to join team" } }
  }
}

export const getTeamsByHackathon = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_teams")
      .select(`
        *,
        team_members (
          id,
          user_id,
          role,
          status,
          joined_at,
          users (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq("hackathon_id", hackathonId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching teams:", error)
    return { data: [], error: { message: "Failed to fetch teams" } }
  }
}

export const getUserTeamForHackathon = async (hackathonId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select(`
        *,
        hackathon_teams!inner (
          *
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("hackathon_teams.hackathon_id", hackathonId)
      .single()
    return { data, error }
  } catch (error) {
    console.error("Error fetching user team:", error)
    return { data: null, error: { message: "Failed to fetch user team" } }
  }
}

// Participation Functions - Fixed for direct registration on Apna Coding
export const registerForHackathon = async (hackathonId: string, participationType: "individual" | "team" = "team") => {
  try {
    const currentUser = await supabase.auth.getUser()
    if (!currentUser.data.user) {
      return { data: null, error: { message: "Not authenticated" } }
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from("hackathon_participants")
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", currentUser.data.user.id)
      .single()

    if (existing) {
      return { data: null, error: { message: "Already registered for this hackathon" } }
    }

    const { data, error } = await supabase
      .from("hackathon_participants")
      .insert([
        {
          hackathon_id: hackathonId,
          user_id: currentUser.data.user.id,
          participation_type: participationType,
          registration_status: "registered",
          additional_info: {},
          registered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Error registering for hackathon:", error)
    return { data: null, error: { message: "Failed to register for hackathon" } }
  }
}

export const getHackathonParticipants = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_participants")
      .select(`
        *,
        users (
          id,
          full_name,
          email,
          avatar_url
        ),
        hackathon_teams (
          id,
          team_name
        )
      `)
      .eq("hackathon_id", hackathonId)
      .order("registered_at", { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching participants:", error)
    return { data: [], error: { message: "Failed to fetch participants" } }
  }
}

// Statistics Functions
export const getHackathonStatistics = async (hackathonId: string) => {
  try {
    const [hackathonResult, participantsResult, teamsResult, submissionsResult] = await Promise.all([
      supabase
        .from("hackathons")
        .select("total_participants, total_teams, total_submissions")
        .eq("id", hackathonId)
        .single(),
      supabase.from("hackathon_participants").select("id, registration_status").eq("hackathon_id", hackathonId),
      supabase.from("hackathon_teams").select("id, status, current_members").eq("hackathon_id", hackathonId),
      supabase.from("hackathon_submissions").select("id, submission_status, score").eq("hackathon_id", hackathonId),
    ])

    const participants = participantsResult.data || []
    const teams = teamsResult.data || []
    const submissions = submissionsResult.data || []

    return {
      total_participants: hackathonResult.data?.total_participants || 0,
      total_teams: hackathonResult.data?.total_teams || 0,
      total_submissions: hackathonResult.data?.total_submissions || 0,
      registered_participants: participants.filter((p) => p.registration_status === "registered").length,
      confirmed_participants: participants.filter((p) => p.registration_status === "confirmed").length,
      active_teams: teams.filter((t) => t.status === "active").length,
      submitted_projects: submissions.filter((s) => s.submission_status === "submitted").length,
      reviewed_projects: submissions.filter(
        (s) => s.submission_status === "approved" || s.submission_status === "rejected",
      ).length,
      average_score:
        submissions.length > 0 ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length : 0,
    }
  } catch (error) {
    console.error("Error fetching hackathon statistics:", error)
    return {
      total_participants: 0,
      total_teams: 0,
      total_submissions: 0,
      registered_participants: 0,
      confirmed_participants: 0,
      active_teams: 0,
      submitted_projects: 0,
      reviewed_projects: 0,
      average_score: 0,
    }
  }
}

// Submission Functions
export const createSubmission = async (submission: Omit<HackathonSubmission, "id" | "created_at" | "updated_at">) => {
  try {
    const currentUser = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .insert([
        {
          ...submission,
          submitted_by: currentUser.data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()
    return { data, error }
  } catch (error) {
    console.error("Error creating submission:", error)
    return { data: null, error: { message: "Failed to create submission" } }
  }
}

export const getTeamSubmissions = async (teamId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .select(`
        *,
        hackathon_problem_statements (
          title,
          difficulty_level,
          max_points
        ),
        users!hackathon_submissions_submitted_by_fkey (
          full_name,
          email
        )
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching team submissions:", error)
    return { data: [], error: { message: "Failed to fetch team submissions" } }
  }
}

export const getHackathonSubmissions = async (hackathonId: string) => {
  try {
    const { data, error } = await supabase
      .from("hackathon_submissions")
      .select(`
        *,
        hackathon_teams (
          team_name,
          team_leader_id
        ),
        hackathon_problem_statements (
          title,
          difficulty_level,
          max_points
        ),
        users!hackathon_submissions_submitted_by_fkey (
          full_name,
          email
        )
      `)
      .eq("hackathon_id", hackathonId)
      .order("submitted_at", { ascending: false })
    return { data: data || [], error }
  } catch (error) {
    console.error("Error fetching hackathon submissions:", error)
    return { data: [], error: { message: "Failed to fetch hackathon submissions" } }
  }
}

// File upload function for hackathon images
export const uploadHackathonImage = async (file: File, hackathonId: string) => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `hackathon-${hackathonId}-${Date.now()}.${fileExt}`
    const filePath = `hackathons/${fileName}`

    const { data, error } = await supabase.storage.from("hackathon-images").upload(filePath, file)

    if (error) {
      return { data: null, error }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("hackathon-images").getPublicUrl(filePath)

    return { data: { publicUrl }, error: null }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { data: null, error: { message: "Failed to upload image" } }
  }
}
