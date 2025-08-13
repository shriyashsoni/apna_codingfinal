"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your AI coding assistant. Ask me anything about programming, career advice, or learning paths!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    // React-related questions
    if (message.includes("react") || message.includes("jsx") || message.includes("hooks")) {
      if (message.includes("learn") || message.includes("start") || message.includes("begin")) {
        return `🚀 **React Learning Path (30 Days)**

**Week 1: Fundamentals**
• Day 1-3: HTML, CSS, JavaScript ES6+
• Day 4-7: React basics, JSX, components

**Week 2: Core Concepts**
• Day 8-10: Props, state, event handling
• Day 11-14: Hooks (useState, useEffect, useContext)

**Week 3: Advanced Topics**
• Day 15-18: Custom hooks, useReducer, useMemo
• Day 19-21: React Router, form handling

**Week 4: Real Projects**
• Day 22-25: Build a todo app, weather app
• Day 26-28: Portfolio website
• Day 29-30: Deploy and optimize

**Resources:**
• Official React docs
• FreeCodeCamp React course
• Build 5+ projects for practice

Ready to start your React journey? 💪`
      }

      if (message.includes("hook") || message.includes("usestate") || message.includes("useeffect")) {
        return `🎣 **React Hooks Mastery Guide**

**Essential Hooks:**
• **useState**: Manage component state
• **useEffect**: Handle side effects, API calls
• **useContext**: Share data across components
• **useReducer**: Complex state management
• **useMemo**: Performance optimization
• **useCallback**: Prevent unnecessary re-renders

**Best Practices:**
✅ Use hooks at the top level only
✅ Custom hooks for reusable logic
✅ Dependency arrays in useEffect
✅ Clean up subscriptions

**Common Patterns:**
• Data fetching with useEffect
• Form handling with useState
• Global state with useContext

Need help with a specific hook? Ask me! 🔧`
      }

      return `⚛️ **React Development Tips**

React is a powerful library for building UIs! Here are key concepts:

**Core Concepts:**
• Components (functional vs class)
• Props and state management
• Virtual DOM and reconciliation
• Lifecycle methods vs hooks

**Best Practices:**
• Keep components small and focused
• Use TypeScript for better development
• Implement proper error boundaries
• Optimize with React.memo and useMemo

**Popular Libraries:**
• Next.js for full-stack apps
• React Router for navigation
• Redux/Zustand for state management
• Styled-components for styling

What specific React topic would you like to explore? 🚀`
    }

    // Python-related questions
    if (message.includes("python") || message.includes("django") || message.includes("flask")) {
      if (message.includes("learn") || message.includes("start")) {
        return `🐍 **Python Mastery Roadmap**

**Phase 1: Fundamentals (2-3 weeks)**
• Variables, data types, control structures
• Functions, modules, file handling
• OOP concepts: classes, inheritance
• Error handling and debugging

**Phase 2: Libraries & Frameworks (3-4 weeks)**
• **Web Development**: Django/Flask
• **Data Science**: Pandas, NumPy, Matplotlib
• **Machine Learning**: Scikit-learn, TensorFlow
• **Automation**: Selenium, Beautiful Soup

**Phase 3: Projects (2-3 weeks)**
• Build a web app with Django
• Create data analysis projects
• Automate daily tasks
• Contribute to open source

**Career Paths:**
• Backend Developer
• Data Scientist
• ML Engineer
• DevOps Engineer

Which Python path interests you most? 🎯`
      }

      return `🐍 **Python Development Guide**

Python is versatile and beginner-friendly!

**Strengths:**
• Clean, readable syntax
• Huge ecosystem of libraries
• Great for web dev, data science, AI
• Strong community support

**Popular Frameworks:**
• **Django**: Full-featured web framework
• **Flask**: Lightweight web framework
• **FastAPI**: Modern, fast API development
• **Pandas**: Data manipulation
• **TensorFlow/PyTorch**: Machine learning

**Project Ideas:**
• REST API with FastAPI
• Data analysis dashboard
• Web scraper
• Machine learning model

What Python project are you working on? 💻`
    }

    // JavaScript-related questions
    if (message.includes("javascript") || message.includes("js") || message.includes("node")) {
      return `⚡ **JavaScript Ecosystem Guide**

**Core JavaScript:**
• ES6+ features (arrow functions, destructuring)
• Async/await and Promises
• DOM manipulation
• Event handling

**Frontend Frameworks:**
• React, Vue, Angular
• State management (Redux, Vuex)
• Build tools (Webpack, Vite)

**Backend Development:**
• Node.js and Express
• Database integration (MongoDB, PostgreSQL)
• RESTful APIs and GraphQL
• Authentication and security

**Modern Tools:**
• TypeScript for type safety
• Testing with Jest/Cypress
• Deployment with Vercel/Netlify

**Learning Path:**
1. Master vanilla JavaScript first
2. Learn a frontend framework
3. Build full-stack projects
4. Deploy and share your work

Which JavaScript area needs your focus? 🎯`
    }

    // Career advice
    if (message.includes("career") || message.includes("job") || message.includes("interview")) {
      if (message.includes("interview") || message.includes("prepare")) {
        return `💼 **Coding Interview Preparation**

**Technical Preparation:**
• **Data Structures**: Arrays, linked lists, trees, graphs
• **Algorithms**: Sorting, searching, dynamic programming
• **System Design**: Scalability, databases, caching
• **Practice Platforms**: LeetCode, HackerRank, CodeSignal

**Behavioral Questions:**
• "Tell me about yourself"
• "Why do you want this role?"
• "Describe a challenging project"
• "How do you handle conflicts?"

**Interview Process:**
1. **Phone/Video Screening** (30-45 min)
2. **Technical Assessment** (1-2 hours)
3. **On-site/Virtual** (3-5 hours)
4. **Final Round** with leadership

**Pro Tips:**
✅ Practice coding on whiteboard/screen
✅ Think out loud during problem-solving
✅ Ask clarifying questions
✅ Prepare questions about the company

**Timeline**: 2-3 months of consistent practice

Ready to ace your next interview? 🚀`
      }

      return `🎯 **Tech Career Roadmap**

**Entry Level Positions:**
• Junior Developer ($50-70k)
• Frontend/Backend Developer
• QA Engineer
• Technical Support

**Mid-Level (2-5 years):**
• Senior Developer ($80-120k)
• Full-Stack Engineer
• DevOps Engineer
• Product Manager

**Senior Level (5+ years):**
• Tech Lead ($120-180k)
• Engineering Manager
• Solutions Architect
• Principal Engineer

**Career Growth Tips:**
✅ Build a strong portfolio
✅ Contribute to open source
✅ Network with other developers
✅ Keep learning new technologies
✅ Develop soft skills

**Salary Negotiation:**
• Research market rates
• Highlight your achievements
• Consider total compensation
• Be prepared to walk away

What's your current career stage? 📈`
    }

    // Hackathon-related questions
    if (message.includes("hackathon") || message.includes("competition")) {
      return `🏆 **Hackathon Success Strategy**

**Before the Event:**
• **Team Formation**: 2-4 diverse members
• **Skill Mix**: Frontend, backend, design, business
• **Idea Brainstorming**: Solve real problems
• **Tech Stack**: Use familiar technologies

**During the Hackathon:**
• **Day 1**: Finalize idea, plan MVP, start coding
• **Day 2**: Build core features, integrate components
• **Day 3**: Polish, test, prepare presentation

**Winning Tips:**
✅ Focus on user experience
✅ Solve a real problem
✅ Create a compelling demo
✅ Tell a story in your pitch
✅ Show business potential

**Common Mistakes:**
❌ Overcomplicating the solution
❌ Poor time management
❌ Weak presentation skills
❌ Not testing thoroughly

**Popular Hackathon Themes:**
• AI/ML applications
• Sustainability solutions
• Healthcare innovations
• Fintech products

**Prizes & Benefits:**
• Cash prizes ($1k-$50k+)
• Job opportunities
• Mentorship
• Network building

Ready to dominate your next hackathon? 🚀`
    }

    // Learning and debugging help
    if (message.includes("debug") || message.includes("error") || message.includes("bug")) {
      return `🐛 **Debugging Mastery Guide**

**Systematic Debugging Process:**
1. **Reproduce** the error consistently
2. **Isolate** the problem area
3. **Examine** the code logic
4. **Test** potential solutions
5. **Verify** the fix works

**Essential Debugging Tools:**
• **Browser DevTools**: Console, Network, Elements
• **IDE Debuggers**: Breakpoints, step-through
• **Logging**: console.log, print statements
• **Error Tracking**: Sentry, LogRocket

**Common Error Types:**
• **Syntax Errors**: Missing brackets, semicolons
• **Runtime Errors**: Null references, type errors
• **Logic Errors**: Wrong algorithms, conditions
• **Performance Issues**: Memory leaks, slow queries

**Pro Debugging Tips:**
✅ Read error messages carefully
✅ Use version control to track changes
✅ Write unit tests to catch bugs early
✅ Rubber duck debugging (explain to someone)
✅ Take breaks when stuck

**Prevention Strategies:**
• Code reviews
• Automated testing
• Type checking (TypeScript)
• Linting tools

What specific error are you facing? 🔍`
    }

    // AI and Machine Learning
    if (message.includes("ai") || message.includes("machine learning") || message.includes("ml")) {
      return `🤖 **AI/ML Learning Path**

**Foundation (2-3 months):**
• **Math**: Linear algebra, statistics, calculus
• **Programming**: Python, R, SQL
• **Tools**: Jupyter notebooks, Git

**Core ML Concepts (3-4 months):**
• **Supervised Learning**: Regression, classification
• **Unsupervised Learning**: Clustering, dimensionality reduction
• **Deep Learning**: Neural networks, CNNs, RNNs
• **Model Evaluation**: Cross-validation, metrics

**Practical Skills (2-3 months):**
• **Libraries**: Scikit-learn, TensorFlow, PyTorch
• **Data Processing**: Pandas, NumPy, data cleaning
• **Visualization**: Matplotlib, Seaborn, Plotly
• **Deployment**: Flask, Docker, cloud platforms

**Specialization Areas:**
• **Computer Vision**: Image recognition, object detection
• **NLP**: Text analysis, chatbots, translation
• **Recommendation Systems**: Collaborative filtering
• **Time Series**: Forecasting, anomaly detection

**Project Ideas:**
• Predict house prices
• Build a chatbot
• Image classifier
• Recommendation engine

**Career Opportunities:**
• ML Engineer ($120-200k)
• Data Scientist ($100-180k)
• AI Researcher ($150-300k)
• ML Ops Engineer ($130-220k)

Which AI area excites you most? 🎯`
    }

    // General programming questions
    if (message.includes("programming") || message.includes("coding") || message.includes("developer")) {
      return `💻 **Programming Excellence Guide**

**Choose Your Path:**
• **Frontend**: HTML, CSS, JavaScript, React/Vue
• **Backend**: Node.js, Python, Java, databases
• **Mobile**: React Native, Flutter, Swift, Kotlin
• **Data Science**: Python, R, SQL, machine learning
• **DevOps**: Docker, Kubernetes, AWS, CI/CD

**Essential Skills:**
✅ Problem-solving mindset
✅ Version control (Git)
✅ Testing and debugging
✅ Code documentation
✅ Continuous learning

**Best Practices:**
• Write clean, readable code
• Follow coding standards
• Use meaningful variable names
• Comment complex logic
• Refactor regularly

**Learning Resources:**
• FreeCodeCamp (free)
• Codecademy (interactive)
• YouTube tutorials
• Official documentation
• Open source projects

**Build Your Portfolio:**
• Personal website
• 3-5 diverse projects
• GitHub contributions
• Technical blog posts

**Timeline to Job-Ready:**
• **Beginner**: 6-12 months
• **Career Switch**: 3-6 months
• **Bootcamp**: 3-6 months

What programming area interests you most? 🚀`
    }

    // Default responses for general questions
    const defaultResponses = [
      `🤔 **Great question!** 

I can help you with:
• **Programming**: React, Python, JavaScript, and more
• **Career Advice**: Interview prep, salary negotiation
• **Learning Paths**: Structured roadmaps for any tech
• **Debugging**: Step-by-step problem solving
• **Hackathons**: Winning strategies and tips
• **AI/ML**: Machine learning fundamentals

What specific topic would you like to explore? 💡`,

      `💡 **I'm here to help!**

As your AI coding mentor, I can assist with:
• Technical concepts and explanations
• Project ideas and implementation
• Career guidance and growth
• Learning resources and roadmaps
• Best practices and code reviews

Try asking me something like:
• "How do I learn React in 30 days?"
• "Help me prepare for coding interviews"
• "What's the best Python learning path?"
• "How to win hackathons?"

What would you like to know? 🚀`,

      `🎯 **Let me help you level up!**

I specialize in:
• **Web Development**: Frontend, backend, full-stack
• **Programming Languages**: JavaScript, Python, Java, C++
• **Frameworks**: React, Node.js, Django, Flask
• **Career Development**: Job search, interviews, growth
• **Project Guidance**: From idea to deployment

Ask me anything about coding, career, or learning! 

What's your current challenge? 💪`,
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(inputMessage),
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    ) // 1-3 seconds delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          data-chatbot-trigger
          className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={`bg-gray-900 border-gray-700 shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-yellow-400 text-black rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-sm font-semibold">AI Coding Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-black hover:bg-yellow-500 p-1 h-auto"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-black hover:bg-yellow-500 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[420px] p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-800 text-white border border-gray-700"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === "bot" && <Bot className="w-4 h-4 mt-1 text-yellow-400 flex-shrink-0" />}
                      {message.sender === "user" && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white border border-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-yellow-400" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about coding, career, or learning..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
