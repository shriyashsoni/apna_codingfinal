"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Share2,
  MessageCircle,
  Star,
  ArrowLeft,
  Clock,
  Target,
  Award,
  Copy,
  CheckCircle,
  Globe,
  Building,
  Code,
  Heart,
  UserPlus,
  Send,
  ExternalLink,
  Upload,
  Github,
  Play,
  FileText,
} from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import {
  registerForEnhancedHackathon,
  checkEnhancedHackathonRegistration,
  createTeam,
  joinTeam,
  getUserTeamsForHackathon,
  getTeamDetails,
  submitProject,
  getHackathonStatistics,
  type EnhancedHackathon,
} from "@/lib/hackathon-system"
import AuthModal from "@/components/auth/auth-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  hackathon: EnhancedHackathon
}

export default function EnhancedHackathonClient({ hackathon }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [shareMessage, setShareMessage] = useState("")
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [teamDetails, setTeamDetails] = useState<any>(null)
  const [statistics, setStatistics] = useState({ totalRegistrations: 0, totalTeams: 0, totalSubmissions: 0 })

  // Team creation/joining states
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [teamFormType, setTeamFormType] = useState<"create" | "join">("create")
  const [teamName, setTeamName] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  // Submission states
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [submissionData, setSubmissionData] = useState({
    title: "",
    description: "",
    github_url: "",
    demo_url: "",
    video_url: "",
    presentation_url: "",
    additional_links: {} as { [key: string]: string },
  })

  useEffect(() => {
    checkUser()
    loadStatistics()
  }, [])

  useEffect(() => {
    if (user) {
      checkRegistration()
      loadUserTeams()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!user) return

    try {
      const { registered, data } = await checkEnhancedHackathonRegistration(hackathon.id!, user.id)
      setIsRegistered(registered)
    } catch (error) {
      console.error("Error checking registration:", error)
    }
  }

  const loadUserTeams = async () => {
    if (!user) return

    try {
      const { data } = await getUserTeamsForHackathon(user.id, hackathon.id!)
      setUserTeams(data)

      if (data.length > 0) {
        const teamId = data[0].enhanced_teams.id
        const { data: details } = await getTeamDetails(teamId)
        setTeamDetails(details)
      }
    } catch (error) {
      console.error("Error loading user teams:", error)
    }
  }

  const loadStatistics = async () => {
    try {
      const { data } = await getHackathonStatistics(hackathon.id!)
      setStatistics(data)
    } catch (error) {
      console.error("Error loading statistics:", error)
    }
  }

  const handleRegistration = async () => {
    if (!user) {
      setAuthMode("login")
      setShowAuthModal(true)
      return
    }

    if (hackathon.hackathon_type === "external" && hackathon.registration_link) {
      window.open(hackathon.registration_link, "_blank")
      return
    }

    setRegistering(true)
    try {
      const result = await registerForEnhancedHackathon(hackathon.id!, user.id)
      if (result.success) {
        setIsRegistered(true)
        alert("Successfully registered for the hackathon!")
        loadStatistics()
      } else {
        alert("Registration failed: " + result.error)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setRegistering(false)
    }
  }

  const handleTeamAction = async () => {
    if (!user) return

    try {
      if (teamFormType === "create") {
        if (!teamName.trim()) {
          alert("Please enter a team name")
          return
        }

        const result = await createTeam(hackathon.id!, user.id, teamName)
        if (result.success) {
          alert("Team created successfully!")
          setShowTeamForm(false)
          setTeamName("")
          loadUserTeams()
        } else {
          alert("Failed to create team: " + result.error)
        }
      } else {
        if (!inviteCode.trim()) {
          alert("Please enter an invite code")
          return
        }

        const result = await joinTeam(inviteCode, user.id)
        if (result.success) {
          alert("Successfully joined team!")
          setShowTeamForm(false)
          setInviteCode("")
          loadUserTeams()
        } else {
          alert("Failed to join team: " + result.error)
        }
      }
    } catch (error) {
      console.error("Team action error:", error)
      alert("An error occurred. Please try again.")
    }
  }

  const handleSubmission = async () => {
    if (!teamDetails) {
      alert("You need to be in a team to submit")
      return
    }

    if (!submissionData.title.trim() || !submissionData.description.trim()) {
      alert("Please fill in title and description")
      return
    }

    try {
      const result = await submitProject(teamDetails.id, hackathon.id!, submissionData)
      if (result.success) {
        alert("Project submitted successfully!")
        setShowSubmissionForm(false)
        loadUserTeams()
        loadStatistics()
      } else {
        alert("Submission failed: " + result.error)
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("Submission failed. Please try again.")
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${hackathon.title} - ${hackathon.organizer}`,
      text: hackathon.short_description || hackathon.description.substring(0, 100),
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareMessage("Shared successfully!")
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareMessage("Link copied to clipboard!")
      } catch (error) {
        setShareMessage("Unable to copy link")
      }
    }

    setTimeout(() => setShareMessage(""), 3000)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkUser()
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

  const getDaysUntilStart = () => {
    const now = new Date()
    const startDate = new Date(hackathon.start_date!)
    const diffTime = startDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const canSubmit = () => {
    if (!hackathon.submission_start || !hackathon.submission_end) return true
    const now = new Date()
    const submissionStart = new Date(hackathon.submission_start)
    const submissionEnd = new Date(hackathon.submission_end)
    return now >= submissionStart && now <= submissionEnd
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const daysUntilStart = getDaysUntilStart()

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/hackathons/enhanced")}
          variant="outline"
          className="mb-6 border-gray-700 text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enhanced Hackathons
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
            <img
              src={hackathon.banner_url || hackathon.image_url || "/images/hackathon-hero.png"}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                {hackathon.featured && (
                  <Badge className="bg-yellow-400 text-black font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {daysUntilStart > 0 && hackathon.status === "upcoming" && (
                  <Badge className="bg-orange-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {daysUntilStart} days left
                  </Badge>
                )}
                <Badge className="bg-purple-500 text-white capitalize">
                  {hackathon.hackathon_type === "apna_coding" ? "Apna Coding Hosted" : "External Platform"}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hackathon.title}</h1>
              <p className="text-gray-200 text-lg flex items-center gap-2">
                <Building className="w-5 h-5" />
                {hackathon.organizer}
              </p>
            </div>
          </div>
        </div>

        {/* Share Message */}
        {shareMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-center">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            {shareMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-900">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="submit">Submit</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-yellow-400" />
                      About This Hackathon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{hackathon.description}</p>
                  </CardContent>
                </Card>

                {/* Technologies */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-400" />
                      Technologies & Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {hackathon.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Event Details */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Calendar className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Start Date</p>
                          <p className="text-white font-medium">{formatDateTime(hackathon.start_date!)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-gray-400 text-sm">End Date</p>
                          <p className="text-white font-medium">{formatDateTime(hackathon.end_date!)}</p>
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
                        <Globe className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Mode</p>
                          <p className="text-white font-medium capitalize">{hackathon.mode}</p>
                        </div>
                      </div>
                    </div>

                    {hackathon.registration_deadline && (
                      <div className="flex items-center gap-3 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 font-medium">Registration Deadline</p>
                          <p className="text-white">{formatDateTime(hackathon.registration_deadline)}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Partnerships */}
                {hackathon.partnerships && hackathon.partnerships.length > 0 && (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-yellow-400" />
                        Partners & Sponsors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hackathon.partnerships.map((partner: any, index) => (
                          <div key={index} className="p-4 bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{partner.name}</h4>
                              <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                                {partner.type}
                              </Badge>
                            </div>
                            {partner.contribution && <p className="text-gray-400 text-sm">{partner.contribution}</p>}
                            {partner.website && (
                              <a
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1 mt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Visit Website
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="problems" className="space-y-6">
                {hackathon.problem_statements && hackathon.problem_statements.length > 0 ? (
                  hackathon.problem_statements.map((problem: any, index) => (
                    <Card key={index} className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{problem.title}</CardTitle>
                          <Badge
                            className={
                              problem.difficulty === "easy"
                                ? "bg-green-500 text-white"
                                : problem.difficulty === "medium"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-red-500 text-white"
                            }
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">{problem.description}</p>

                        {problem.sample_input && problem.sample_output && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-white font-medium mb-2">Sample Input</h4>
                              <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                                {problem.sample_input}
                              </pre>
                            </div>
                            <div>
                              <h4 className="text-white font-medium mb-2">Sample Output</h4>
                              <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                                {problem.sample_output}
                              </pre>
                            </div>
                          </div>
                        )}

                        {problem.constraints && problem.constraints.length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Constraints</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {problem.constraints.map((constraint: string, idx: number) => (
                                <li key={idx} className="text-gray-300 text-sm">
                                  {constraint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {problem.evaluation_criteria && problem.evaluation_criteria.length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Evaluation Criteria</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {problem.evaluation_criteria.map((criteria: string, idx: number) => (
                                <li key={idx} className="text-gray-300 text-sm">
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Problem Statements Yet</h3>
                      <p className="text-gray-400">Problem statements will be released soon.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                {!user ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Login Required</h3>
                      <p className="text-gray-400 mb-4">Please login to manage your team.</p>
                      <Button
                        onClick={() => {
                          setAuthMode("login")
                          setShowAuthModal(true)
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Login
                      </Button>
                    </CardContent>
                  </Card>
                ) : !isRegistered ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Registration Required</h3>
                      <p className="text-gray-400 mb-4">Please register for the hackathon first.</p>
                      <Button onClick={handleRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Register Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : teamDetails ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        Your Team: {teamDetails.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                        <Copy className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400">Invite Code:</span>
                        <code className="bg-gray-700 px-2 py-1 rounded text-yellow-400 font-mono">
                          {teamDetails.invite_code}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(teamDetails.invite_code)
                            alert("Invite code copied!")
                          }}
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        >
                          Copy
                        </Button>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-3">Team Members</h4>
                        <div className="space-y-2">
                          {teamDetails.members.map((member: any) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold">
                                {member.users.full_name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{member.users.full_name}</p>
                                <p className="text-gray-400 text-sm">{member.users.email}</p>
                              </div>
                              {member.role === "leader" && <Badge className="bg-yellow-400 text-black">Leader</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {teamDetails.submission && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <h4 className="text-green-400 font-medium mb-2">Project Submitted</h4>
                          <p className="text-white font-semibold">{teamDetails.submission.title}</p>
                          <p className="text-gray-300 text-sm mt-1">{teamDetails.submission.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-yellow-400" />
                        Team Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300">
                        You're not in a team yet. Create a new team or join an existing one.
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setTeamFormType("create")
                            setShowTeamForm(true)
                          }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Team
                        </Button>
                        <Button
                          onClick={() => {
                            setTeamFormType("join")
                            setShowTeamForm(true)
                          }}
                          variant="outline"
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Join Team
                        </Button>
                      </div>

                      {showTeamForm && (
                        <div className="p-4 border border-gray-700 rounded-lg space-y-4">
                          <h4 className="text-white font-medium">
                            {teamFormType === "create" ? "Create New Team" : "Join Existing Team"}
                          </h4>

                          {teamFormType === "create" ? (
                            <div>
                              <Label htmlFor="teamName" className="text-gray-300">
                                Team Name
                              </Label>
                              <Input
                                id="teamName"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter team name"
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="inviteCode" className="text-gray-300">
                                Invite Code
                              </Label>
                              <Input
                                id="inviteCode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="Enter invite code"
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button onClick={handleTeamAction} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                              {teamFormType === "create" ? "Create Team" : "Join Team"}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowTeamForm(false)
                                setTeamName("")
                                setInviteCode("")
                              }}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="submit" className="space-y-6">
                {!user ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Login Required</h3>
                      <p className="text-gray-400 mb-4">Please login to submit your project.</p>
                      <Button
                        onClick={() => {
                          setAuthMode("login")
                          setShowAuthModal(true)
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Login
                      </Button>
                    </CardContent>
                  </Card>
                ) : !teamDetails ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Team Required</h3>
                      <p className="text-gray-400 mb-4">You need to be in a team to submit a project.</p>
                      <Button
                        onClick={() => {
                          // Switch to team tab
                          const teamTab = document.querySelector('[data-state="inactive"][value="team"]') as HTMLElement
                          teamTab?.click()
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Manage Team
                      </Button>
                    </CardContent>
                  </Card>
                ) : hackathon.hackathon_type === "external" ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <ExternalLink className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">External Submission</h3>
                      <p className="text-gray-400 mb-4">
                        This hackathon is hosted on an external platform. Please submit your project there.
                      </p>
                      {hackathon.registration_link && (
                        <Button
                          onClick={() => window.open(hackathon.registration_link, "_blank")}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Go to Platform
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : !canSubmit() ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Submission Period Closed</h3>
                      <p className="text-gray-400 mb-4">The submission period for this hackathon has ended.</p>
                      {hackathon.submission_start && hackathon.submission_end && (
                        <div className="text-sm text-gray-500">
                          <p>Submission Period: {formatDateTime(hackathon.submission_start)}</p>
                          <p>to {formatDateTime(hackathon.submission_end)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : teamDetails.submission ? (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Project Submitted
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-2">{teamDetails.submission.title}</h4>
                        <p className="text-gray-300 mb-4">{teamDetails.submission.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teamDetails.submission.github_url && (
                            <a
                              href={teamDetails.submission.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
                            >
                              <Github className="w-4 h-4" />
                              GitHub Repository
                            </a>
                          )}
                          {teamDetails.submission.demo_url && (
                            <a
                              href={teamDetails.submission.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              Live Demo
                            </a>
                          )}
                          {teamDetails.submission.video_url && (
                            <a
                              href={teamDetails.submission.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              Demo Video
                            </a>
                          )}
                          {teamDetails.submission.presentation_url && (
                            <a
                              href={teamDetails.submission.presentation_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Presentation
                            </a>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mt-4">
                          Submitted on {formatDateTime(teamDetails.submission.submitted_at)}
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowSubmissionForm(true)}
                        variant="outline"
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      >
                        Update Submission
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-yellow-400" />
                        Submit Your Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300">
                        Ready to submit your project? Fill in the details below and share your work with the world!
                      </p>

                      <Button
                        onClick={() => setShowSubmissionForm(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Project
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showSubmissionForm && (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Project Submission Form</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-gray-300">
                          Project Title *
                        </Label>
                        <Input
                          id="title"
                          value={submissionData.title}
                          onChange={(e) => setSubmissionData({ ...submissionData, title: e.target.value })}
                          placeholder="Enter your project title"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-gray-300">
                          Project Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={submissionData.description}
                          onChange={(e) => setSubmissionData({ ...submissionData, description: e.target.value })}
                          placeholder="Describe your project, what it does, and how you built it"
                          rows={4}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="github_url" className="text-gray-300">
                            GitHub Repository
                          </Label>
                          <Input
                            id="github_url"
                            type="url"
                            value={submissionData.github_url}
                            onChange={(e) => setSubmissionData({ ...submissionData, github_url: e.target.value })}
                            placeholder="https://github.com/username/repo"
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="demo_url" className="text-gray-300">
                            Live Demo URL
                          </Label>
                          <Input
                            id="demo_url"
                            type="url"
                            value={submissionData.demo_url}
                            onChange={(e) => setSubmissionData({ ...submissionData, demo_url: e.target.value })}
                            placeholder="https://your-demo.com"
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="video_url" className="text-gray-300">
                            Demo Video URL
                          </Label>
                          <Input
                            id="video_url"
                            type="url"
                            value={submissionData.video_url}
                            onChange={(e) => setSubmissionData({ ...submissionData, video_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="presentation_url" className="text-gray-300">
                            Presentation URL
                          </Label>
                          <Input
                            id="presentation_url"
                            type="url"
                            value={submissionData.presentation_url}
                            onChange={(e) => setSubmissionData({ ...submissionData, presentation_url: e.target.value })}
                            placeholder="https://docs.google.com/presentation/..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSubmission} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Project
                        </Button>
                        <Button
                          onClick={() => setShowSubmissionForm(false)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Join This Hackathon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="text-green-400 font-bold text-lg">{hackathon.prize_pool}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Participants</span>
                    <span className="text-white font-medium">{statistics.totalRegistrations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Teams</span>
                    <span className="text-white font-medium">{statistics.totalTeams}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Submissions</span>
                    <span className="text-white font-medium">{statistics.totalSubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Difficulty</span>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400 capitalize">
                      {hackathon.difficulty}
                    </Badge>
                  </div>
                  {hackathon.max_team_size && (
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-400">Max Team Size</span>
                      <span className="text-white font-medium">{hackathon.max_team_size} members</span>
                    </div>
                  )}
                  {hackathon.entry_fee && hackathon.entry_fee > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="text-white font-medium">${hackathon.entry_fee}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-700">
                  {isRegistered ? (
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium">You're registered!</p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleRegistration}
                      disabled={!user || registering}
                      className={`w-full ${
                        !user
                          ? "bg-gray-600 hover:bg-gray-600 text-gray-300 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500 text-black"
                      }`}
                    >
                      {!user ? (
                        "Login Required"
                      ) : registering ? (
                        "Registering..."
                      ) : hackathon.hackathon_type === "external" ? (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Register on Platform
                        </>
                      ) : (
                        "Register Now"
                      )}
                    </Button>
                  )}

                  {hackathon.whatsapp_link && (
                    <Button
                      onClick={() => window.open(hackathon.whatsapp_link, "_blank")}
                      disabled={!user}
                      variant="outline"
                      className={`w-full ${
                        !user
                          ? "border-gray-600 text-gray-400 cursor-not-allowed"
                          : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join WhatsApp
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Event Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Registered</span>
                  </div>
                  <span className="text-white font-medium">{statistics.totalRegistrations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Prize Pool</span>
                  </div>
                  <span className="text-green-400 font-medium">{hackathon.prize_pool}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Status</span>
                  </div>
                  <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                </div>
                {daysUntilStart > 0 && hackathon.status === "upcoming" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400">Starts In</span>
                    </div>
                    <span className="text-orange-400 font-medium">{daysUntilStart} days</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share URL */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-yellow-400" />
                  Share This Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={typeof window !== "undefined" ? window.location.href : ""}
                    readOnly
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300"
                  />
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href)
                        setShareMessage("Link copied!")
                        setTimeout(() => setShareMessage(""), 2000)
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </div>
  )
}
