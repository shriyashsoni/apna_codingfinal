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

// Problem Statement Functions
export const createProblemStatement = async (
  problemStatement: Omit<ProblemStatement, "id" | "created_at" | "updated_at">,
) => {
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
}

export const getProblemStatements = async (hackathonId: string) => {
  const { data, error } = await supabase
    .from("hackathon_problem_statements")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: true })
  return { data, error }
}

export const updateProblemStatement = async (id: string, updates: Partial<ProblemStatement>) => {
  const { data, error } = await supabase
    .from("hackathon_problem_statements")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
  return { data, error }
}

export const deleteProblemStatement = async (id: string) => {
  const { data, error } = await supabase.from("hackathon_problem_statements").delete().eq("id", id)
  return { data, error }
}

// Team Management Functions
export const createTeam = async (hackathonId: string, teamName: string, description?: string) => {
  const currentUser = await supabase.auth.getUser()
  if (!currentUser.data.user) {
    return { data: null, error: { message: "Not authenticated" } }
  }

  // Generate invite code
  const { data: inviteCode } = await supabase.rpc("generate_team_invite_code")

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
}

export const joinTeamByInviteCode = async (inviteCode: string) => {
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

  // Check if user is already in another team for this hackathon
  const { data: otherTeamMember } = await supabase
    .from("team_members")
    .select("team_id, hackathon_teams!inner(hackathon_id)")
    .eq("user_id", currentUser.data.user.id)
    .eq("status", "active")
    .eq("hackathon_teams.hackathon_id", team.hackathon_id)
    .single()

  if (otherTeamMember) {
    return { data: null, error: { message: "You are already in another team for this hackathon" } }
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
}

export const getTeamsByHackathon = async (hackathonId: string) => {
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
  return { data, error }
}

export const getUserTeamForHackathon = async (hackathonId: string, userId: string) => {
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
}

export const leaveTeam = async (teamId: string) => {
  const currentUser = await supabase.auth.getUser()
  if (!currentUser.data.user) {
    return { data: null, error: { message: "Not authenticated" } }
  }

  const { data, error } = await supabase
    .from("team_members")
    .update({ status: "left" })
    .eq("team_id", teamId)
    .eq("user_id", currentUser.data.user.id)
    .select()
  return { data, error }
}

// Participation Functions
export const registerForHackathon = async (
  hackathonId: string,
  participationType: "individual" | "team" = "individual",
) => {
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
        registered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  return { data, error }
}

export const getHackathonParticipants = async (hackathonId: string) => {
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
  return { data, error }
}

// Submission Functions
export const createSubmission = async (submission: Omit<HackathonSubmission, "id" | "created_at" | "updated_at">) => {
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
}

export const updateSubmission = async (id: string, updates: Partial<HackathonSubmission>) => {
  const { data, error } = await supabase
    .from("hackathon_submissions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  return { data, error }
}

export const getTeamSubmissions = async (teamId: string) => {
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
  return { data, error }
}

export const getHackathonSubmissions = async (hackathonId: string) => {
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
  return { data, error }
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
      average_score: submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length : 0,
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

// Enhanced hackathon functions
export const createEnhancedHackathon = async (
  hackathon: Omit<
    EnhancedHackathon,
    "id" | "created_at" | "updated_at" | "total_participants" | "total_teams" | "total_submissions"
  >,
) => {
  const currentUser = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("hackathons")
    .insert([
      {
        ...hackathon,
        created_by: currentUser.data.user?.id,
        total_participants: 0,
        total_teams: 0,
        total_submissions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()
  return { data, error }
}

export const getEnhancedHackathons = async () => {
  const { data, error } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true })
  return { data, error }
}

export const getEnhancedHackathonById = async (id: string) => {
  const { data, error } = await supabase.from("hackathons").select("*").eq("id", id).single()
  return { data, error }
}
