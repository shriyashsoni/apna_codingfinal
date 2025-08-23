"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  UserPlus,
  Code,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Award,
  Building,
  Github,
  Globe,
  FileText,
  Video,
  Upload,
} from "lucide-react"
import { getCurrentUser, type User } from "@/lib/supabase"
import {
  getEnhancedHackathonById,
  getProblemStatements,
  getTeamsByHackathon,
  getUserTeamForHackathon,
  createTeam,
  joinTeamByInviteCode,
  registerForHackathon,
  getHackathonParticipants,
  getHackathonStatistics,
  createSubmission,
  getTeamSubmissions,
  type EnhancedHackathon,
  type ProblemStatement,
  type HackathonTeam,
  type HackathonParticipant,
  type HackathonSubmission,
} from "@/lib/hackathon-system"
import SEOHead from "@/components/seo/seo-head"

export default function EnhancedHackathonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [hackathon, setHackathon] = useState<EnhancedHackathon | null>(null)
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([])
  const [teams, setTeams] = useState<HackathonTeam[]>([])
  const [userTeam, setUserTeam] = useState<any>(null)
  const [participants, setParticipants] = useState<HackathonParticipant[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [submissions, setSubmissions] = useState<HackathonSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinTeam, setShowJoinTeam] = useState(false)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // Submission form state
  const [submissionData, setSubmissionData] = useState({
    project_title: "",
    project_description: "",
    github_repository_url: "",
    live_demo_url: "",
    presentation_url: "",
    video_demo_url: "",
    documentation_url: "",
    technologies_used: [] as string[],
    challenges_faced: "",
    future_improvements: "",
  })

  useEffect(() => {
    checkUser()
    loadHackathonData()
  }, [params.id])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    }
  }

  const loadHackathonData = async () => {
    try {
      const hackathonId = params.id as string

      const [hackathonResult, problemsResult, teamsResult, participantsResult, statsResult] = await Promise.all([
        getEnhancedHackathonById(hackathonId),
        getProblemStatements(hackathonId),
        getTeamsByHackathon(hackathonId),
        getHackathonParticipants(hackathonId),
        getHackathonStatistics(hackathonId),
      ])

      if (hackathonResult.error || !hackathonResult.data) {
        console.error("Error loading hackathon:", hackathonResult.error)
        router.push("/hackathons/enhanced")
        return
      }

      setHackathon(hackathonResult.data)
      setProblemStatements(problemsResult.data || [])
      setTeams(teamsResult.data || [])
      setParticipants(participantsResult.data || [])
      setStatistics(statsResult)

      // Check if user is registered and get their team
      if (user) {
        const userParticipation = participantsResult.data?.find((p) => p.user_id === user.id)
        setIsRegistered(!!userParticipation)

        if (userParticipation) {
          const userTeamResult = await getUserTeamForHackathon(hackathonId, user.id)
          setUserTeam(userTeamResult.data)

          // Load team submissions if user has a team
          if (userTeamResult.data) {
            const submissionsResult = await getTeamSubmissions(userTeamResult.data.team_id)
            setSubmissions(submissionsResult.data || [])
          }
        }
      }
    } catch (error) {
      console.error("Error loading hackathon data:", error)
      router.push("/hackathons/enhanced")
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleRegister = async () => {
    if (!user) {
      showMessage("Please login to register for hackathons!", "error")
      return
    }

    try {
      const { error } = await registerForHackathon(hackathon!.id, "team")
      if (error) {
        showMessage("Registration failed: " + error.message, "error")
        return
      }

      setIsRegistered(true)
      showMessage("Successfully registered for the hackathon!")
      loadHackathonData()
    } catch (error) {
      console.error("Registration error:", error)
      showMessage("Registration failed. Please try again.", "error")
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      showMessage("Please enter a team name", "error")
      return
    }

    try {
      const { data, error } = await createTeam(hackathon!.id, teamName, teamDescription)
      if (error) {
        showMessage("Failed to create team: " + error.message, "error")
        return
      }

      setUserTeam(data)
      setShowCreateTeam(false)
      setTeamName("")
      setTeamDescription("")
      showMessage("Team created successfully!")
      loadHackathonData()
    } catch (error) {
      console.error("Error creating team:", error)
      showMessage("Failed to create team. Please try again.", "error")
    }
  }

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      showMessage("Please enter an invite code", "error")
      return
    }

    try {
      const { data, error } = await joinTeamByInviteCode(inviteCode)
      if (error) {
        showMessage("Failed to join team: " + error.message, "error")
        return
      }

      setShowJoinTeam(false)
      setInviteCode("")
      showMessage("Successfully joined the team!")
      loadHackathonData()
    } catch (error) {
      console.error("Error joining team:", error)
      showMessage("Failed to join team. Please try again.", "error")
    }
  }

  const handleSubmitProject = async () => {
    if (!submissionData.project_title.trim() || !submissionData.project_description.trim()) {
      showMessage("Please fill in the required fields", "error")
      return
    }

    if (!userTeam) {
      showMessage("You must be in a team to submit a project", "error")
      return
    }

    try {
      const { data, error } = await createSubmission({
        hackathon_id: hackathon!.id,
        team_id: userTeam.team_id,
        submitted_by: user!.id,
        submission_status: "submitted",
        score: 0,
        ...submissionData,
        submitted_at: new Date().toISOString(),
      })

      if (error) {
        showMessage("Failed to submit project: " + error.message, "error")
        return
      }

      setShowSubmissionForm(false)
      setSubmissionData({
        project_title: "",
        project_description: "",
        github_repository_url: "",
        live_demo_url: "",
        presentation_url: "",
        video_demo_url: "",
        documentation_url: "",
        technologies_used: [],
        challenges_faced: "",
        future_improvements: "",
      })
      showMessage("Project submitted successfully!")
      loadHackathonData()
    } catch (error) {
      console.error("Error submitting project:", error)
      showMessage("Failed to submit project. Please try again.", "error")
    }
  }

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      showMessage("Invite code copied to clipboard!")
    } catch (error) {
      showMessage("Failed to copy invite code", "error")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500 text-white"
      case "ongoing":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-gray-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hackathon Not Found</h1>
          <p className="text-gray-400 mb-6">The hackathon you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push("/hackathons/enhanced")}
            className="bg-purple-400 hover:bg-purple-500 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </Button>
        </div>
      </div>
    )
  }

  // If it's an external hackathon, redirect to the platform URL
  if (hackathon.hackathon_type === "external" && hackathon.platform_url) {
    window.open(hackathon.platform_url, "_blank")
    router.push("/hackathons/enhanced")
    return null
  }

  return (
    <>
      <SEOHead
        title={`${hackathon.title} | Apna Coding Hackathon`}
        description={hackathon.description}
        keywords={`${hackathon.title}, hackathon, coding competition, ${hackathon.technologies.join(", ")}, Apna Coding`}
        canonicalUrl={`/hackathons/enhanced/${hackathon.id}`}
      />

      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            onClick={() => router.push("/hackathons/enhanced")}
            variant="outline"
            className="mb-6 border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </Button>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                messageType === "success"
                  ? "bg-green-900/20 border-green-500/30 text-green-400"
                  : "bg-red-900/20 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center">
                {messageType === "success" ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                {message}
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="relative mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      <Building className="w-4 h-4 mr-1" />
                      Apna Coding Hosted
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">{hackathon.title}</CardTitle>
                <p className="text-gray-300 text-lg leading-relaxed">{hackathon.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p className="text-white font-medium">{formatDateTime(hackathon.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">End Date</p>
                      <p className="text-white font-medium">{formatDateTime(hackathon.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{hackathon.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Prize Pool</p>
                      <p className="text-green-400 font-bold">{hackathon.prize_pool}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-900 border-gray-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="problems">Problems</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Hackathon Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.technologies.map((tech, index) => (
                            <Badge key={index} variant="outline" className="border-purple-400 text-purple-400">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Team Requirements</h4>
                          <p className="text-gray-300">
                            Team Size: {hackathon.min_team_members}-{hackathon.max_team_members} members
                          </p>
                          {hackathon.allow_individual && (
                            <p className="text-gray-300">Individual participation allowed</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Organizer</h4>
                          <p className="text-gray-300">{hackathon.organizer}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Submission Status</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${hackathon.submissions_open ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span className="text-gray-300">
                              Submissions {hackathon.submissions_open ? "Open" : "Closed"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${hackathon.results_published ? "bg-green-500" : "bg-yellow-500"}`}
                            />
                            <span className="text-gray-300">
                              Results {hackathon.results_published ? "Published" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="problems" className="mt-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Problem Statements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {problemStatements.length > 0 ? (
                        <div className="space-y-4">
                          {problemStatements.map((problem) => (
                            <div key={problem.id} className="p-4 bg-gray-800 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white font-medium">{problem.title}</h4>
                                <Badge
                                  variant="outline"
                                  className={
                                    problem.difficulty_level === "easy"
                                      ? "border-green-400 text-green-400"
                                      : problem.difficulty_level === "medium"
                                        ? "border-yellow-400 text-yellow-400"
                                        : "border-red-400 text-red-400"
                                  }
                                >
                                  {problem.difficulty_level}
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{problem.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Max Points: {problem.max_points}</span>
                                <span>Resources: {problem.resources.length}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Problem Statements Yet</h3>
                          <p className="text-gray-400">Problem statements will be published soon.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="teams" className="mt-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Participating Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teams.length > 0 ? (
                        <div className="space-y-4">
                          {teams.map((team) => (
                            <div key={team.id} className="p-4 bg-gray-800 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-white font-medium">{team.team_name}</h4>
                                  {team.description && <p className="text-gray-400 text-sm mt-1">{team.description}</p>}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    team.is_full ? "border-red-400 text-red-400" : "border-green-400 text-green-400"
                                  }
                                >
                                  {team.current_members}/{team.max_members}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Created: {formatDate(team.created_at)}</span>
                                <span>Status: {team.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Teams Yet</h3>
                          <p className="text-gray-400">Be the first to create a team!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="submissions" className="mt-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Project Submissions</CardTitle>
                        {userTeam && hackathon.submissions_open && (
                          <Button
                            onClick={() => setShowSubmissionForm(true)}
                            className="bg-purple-400 hover:bg-purple-500 text-black"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Project
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {submissions.length > 0 ? (
                        <div className="space-y-4">
                          {submissions.map((submission) => (
                            <div key={submission.id} className="p-4 bg-gray-800 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-white font-medium">{submission.project_title}</h4>
                                  <p className="text-gray-400 text-sm mt-1">{submission.project_description}</p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    submission.submission_status === "submitted"
                                      ? "border-green-400 text-green-400"
                                      : submission.submission_status === "under_review"
                                        ? "border-yellow-400 text-yellow-400"
                                        : "border-gray-400 text-gray-400"
                                  }
                                >
                                  {submission.submission_status.replace("_", " ")}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                {submission.technologies_used.map((tech, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-purple-400 text-purple-400 text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                {submission.github_repository_url && (
                                  <a
                                    href={submission.github_repository_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                  >
                                    <Github className="w-4 h-4" />
                                    GitHub
                                  </a>
                                )}
                                {submission.live_demo_url && (
                                  <a
                                    href={submission.live_demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300"
                                  >
                                    <Globe className="w-4 h-4" />
                                    Live Demo
                                  </a>
                                )}
                                {submission.presentation_url && (
                                  <a
                                    href={submission.presentation_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Presentation
                                  </a>
                                )}
                                {submission.video_demo_url && (
                                  <a
                                    href={submission.video_demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                                  >
                                    <Video className="w-4 h-4" />
                                    Video Demo
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700">
                                <span>
                                  Submitted: {formatDateTime(submission.submitted_at || submission.created_at)}
                                </span>
                                {submission.score > 0 && (
                                  <span className="text-purple-400 font-medium">Score: {submission.score}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Submissions Yet</h3>
                          <p className="text-gray-400 mb-4">
                            {userTeam
                              ? "Your team hasn't submitted any projects yet."
                              : "Join a team to start submitting projects."}
                          </p>
                          {userTeam && hackathon.submissions_open && (
                            <Button
                              onClick={() => setShowSubmissionForm(true)}
                              className="bg-purple-400 hover:bg-purple-500 text-black"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Your First Project
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Leaderboard Coming Soon</h3>
                        <p className="text-gray-400">Rankings will be available once submissions are reviewed.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Registration/Team Management */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Participation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user ? (
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-300 mb-4">Please login to participate</p>
                      <Button
                        onClick={() => router.push("/?auth=login")}
                        className="bg-purple-400 hover:bg-purple-500 text-black"
                      >
                        Login to Participate
                      </Button>
                    </div>
                  ) : !isRegistered ? (
                    <div className="text-center">
                      <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-300 mb-4">Register to participate in this hackathon</p>
                      <Button onClick={handleRegister} className="bg-green-400 hover:bg-green-500 text-black w-full">
                        Register Now
                      </Button>
                    </div>
                  ) : userTeam ? (
                    <div>
                      <div className="text-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">You're in a team!</p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <h4 className="text-white font-medium">{userTeam.hackathon_teams.team_name}</h4>
                        <p className="text-gray-400 text-sm">
                          {userTeam.hackathon_teams.current_members}/{userTeam.hackathon_teams.max_members} members
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={userTeam.hackathon_teams.invite_code}
                            readOnly
                            className="bg-gray-700 border-gray-600 text-white text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => copyInviteCode(userTeam.hackathon_teams.invite_code)}
                            className="bg-purple-400 hover:bg-purple-500 text-black"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-center">Choose your participation method</p>
                      <Button
                        onClick={() => setShowCreateTeam(true)}
                        className="bg-purple-400 hover:bg-purple-500 text-black w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Team
                      </Button>
                      <Button
                        onClick={() => setShowJoinTeam(true)}
                        variant="outline"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Join Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Participants</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_participants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Teams</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_teams}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Submissions</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_submissions}</span>
                  </div>
                  {statistics && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400">Confirmed</span>
                        </div>
                        <span className="text-green-400 font-medium">{statistics.confirmed_participants}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400">Avg Score</span>
                        </div>
                        <span className="text-purple-400 font-medium">{statistics.average_score.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Create Team Modal */}
          {showCreateTeam && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="bg-gray-900 border-gray-800 w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-white">Create Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="team-name" className="text-gray-300">
                      Team Name
                    </Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-description" className="text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="team-description"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Describe your team"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCreateTeam(false)}
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam} className="flex-1 bg-purple-400 hover:bg-purple-500 text-black">
                      Create Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Join Team Modal */}
          {showJoinTeam && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="bg-gray-900 border-gray-800 w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="text-white">Join Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="invite-code" className="text-gray-300">
                      Invite Code
                    </Label>
                    <Input
                      id="invite-code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter team invite code"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowJoinTeam(false)}
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleJoinTeam} className="flex-1 bg-purple-400 hover:bg-purple-500 text-black">
                      Join Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submit Project Modal */}
          {showSubmissionForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-white">Submit Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="project-title" className="text-gray-300">
                        Project Title *
                      </Label>
                      <Input
                        id="project-title"
                        value={submissionData.project_title}
                        onChange={(e) => setSubmissionData({ ...submissionData, project_title: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter project title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="technologies" className="text-gray-300">
                        Technologies Used
                      </Label>
                      <Input
                        id="technologies"
                        value={submissionData.technologies_used.join(", ")}
                        onChange={(e) =>
                          setSubmissionData({
                            ...submissionData,
                            technologies_used: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter((t) => t),
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="project-description" className="text-gray-300">
                      Project Description *
                    </Label>
                    <Textarea
                      id="project-description"
                      value={submissionData.project_description}
                      onChange={(e) => setSubmissionData({ ...submissionData, project_description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Describe your project"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="github-url" className="text-gray-300">
                        GitHub Repository URL
                      </Label>
                      <Input
                        id="github-url"
                        type="url"
                        value={submissionData.github_repository_url}
                        onChange={(e) =>
                          setSubmissionData({ ...submissionData, github_repository_url: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="demo-url" className="text-gray-300">
                        Live Demo URL
                      </Label>
                      <Input
                        id="demo-url"
                        type="url"
                        value={submissionData.live_demo_url}
                        onChange={(e) => setSubmissionData({ ...submissionData, live_demo_url: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://your-demo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="presentation-url" className="text-gray-300">
                        Presentation URL
                      </Label>
                      <Input
                        id="presentation-url"
                        type="url"
                        value={submissionData.presentation_url}
                        onChange={(e) => setSubmissionData({ ...submissionData, presentation_url: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://slides.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-url" className="text-gray-300">
                        Video Demo URL
                      </Label>
                      <Input
                        id="video-url"
                        type="url"
                        value={submissionData.video_demo_url}
                        onChange={(e) => setSubmissionData({ ...submissionData, video_demo_url: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="challenges" className="text-gray-300">
                      Challenges Faced
                    </Label>
                    <Textarea
                      id="challenges"
                      value={submissionData.challenges_faced}
                      onChange={(e) => setSubmissionData({ ...submissionData, challenges_faced: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="What challenges did you face while building this project?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="improvements" className="text-gray-300">
                      Future Improvements
                    </Label>
                    <Textarea
                      id="improvements"
                      value={submissionData.future_improvements}
                      onChange={(e) => setSubmissionData({ ...submissionData, future_improvements: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="What would you improve or add in the future?"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowSubmissionForm(false)}
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitProject}
                      className="flex-1 bg-purple-400 hover:bg-purple-500 text-black"
                    >
                      Submit Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
