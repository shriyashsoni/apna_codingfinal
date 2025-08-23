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
  type EnhancedHackathon,
  type ProblemStatement,
  type HackathonTeam,
  type HackathonParticipant,
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
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinTeam, setShowJoinTeam] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [message, setMessage] = useState("")

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
        }
      }
    } catch (error) {
      console.error("Error loading hackathon data:", error)
      router.push("/hackathons/enhanced")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      setMessage("Please login to register for hackathons!")
      return
    }

    try {
      const { error } = await registerForHackathon(hackathon!.id, "team")
      if (error) {
        setMessage("Registration failed: " + error.message)
        return
      }

      setIsRegistered(true)
      setMessage("Successfully registered for the hackathon!")
      loadHackathonData()
    } catch (error) {
      console.error("Registration error:", error)
      setMessage("Registration failed. Please try again.")
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setMessage("Please enter a team name")
      return
    }

    try {
      const { data, error } = await createTeam(hackathon!.id, teamName, teamDescription)
      if (error) {
        setMessage("Failed to create team: " + error.message)
        return
      }

      setUserTeam(data)
      setShowCreateTeam(false)
      setTeamName("")
      setTeamDescription("")
      setMessage("Team created successfully!")
      loadHackathonData()
    } catch (error) {
      console.error("Error creating team:", error)
      setMessage("Failed to create team. Please try again.")
    }
  }

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      setMessage("Please enter an invite code")
      return
    }

    try {
      const { data, error } = await joinTeamByInviteCode(inviteCode)
      if (error) {
        setMessage("Failed to join team: " + error.message)
        return
      }

      setShowJoinTeam(false)
      setInviteCode("")
      setMessage("Successfully joined the team!")
      loadHackathonData()
    } catch (error) {
      console.error("Error joining team:", error)
      setMessage("Failed to join team. Please try again.")
    }
  }

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setMessage("Invite code copied to clipboard!")
    } catch (error) {
      setMessage("Failed to copy invite code")
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
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
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
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
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-400">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              {message}
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
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p className="text-white font-medium">{formatDateTime(hackathon.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">End Date</p>
                      <p className="text-white font-medium">{formatDateTime(hackathon.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <MapPin className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{hackathon.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-400" />
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
                <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="problems">Problems</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
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
                            <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
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
                      <CardTitle className="text-white">Project Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Submissions Coming Soon</h3>
                        <p className="text-gray-400">Project submissions will be available once teams are formed.</p>
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
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
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
                            className="bg-yellow-400 hover:bg-yellow-500 text-black"
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
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Participants</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_participants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Teams</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_teams}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Submissions</span>
                    </div>
                    <span className="text-white font-medium">{hackathon.total_submissions}</span>
                  </div>
                  {statistics && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400">Confirmed</span>
                        </div>
                        <span className="text-green-400 font-medium">{statistics.confirmed_participants}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
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
        </div>
      </div>
    </>
  )
}
