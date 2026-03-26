"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Send, Bot, X, Minimize2, Maximize2 } from "lucide-react"
import { ChatOpenAI } from "@langchain/openai"
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { HumanMessage, AIMessage } from "@langchain/core/messages"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAgentPanelProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
}

export default function AIAgentPanel({ isMinimized = false, onToggleMinimize, onClose }: AIAgentPanelProps) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState(0)
  const [clubData, setClubData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize LLM with fallback providers
  const getLLM = () => {
    // Try Groq first (free, high limits)
    if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      return new ChatGroq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
      })
    }
    // Fallback to Google GenAI
    if (process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY) {
      return new ChatGoogleGenerativeAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY,
        model: "gemini-pro",
        temperature: 0.7,
      })
    }
    // Last resort: OpenAI (if quota allows)
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return new ChatOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      })
    }
    throw new Error("No AI API key configured. Please set GROQ_API_KEY, GOOGLE_GENAI_API_KEY, or OPENAI_API_KEY")
  }

  // Generate interesting facts about a club
  const generateClubFacts = (club: any) => {
    if (!club) return null

    const facts = []
    
    // Member count fact
    if (club.members?.length > 0) {
      facts.push(`• This club has ${club.members.length} active member${club.members.length !== 1 ? 's' : ''}`)
    }
    
    // Event count fact
    if (club.events?.length > 0) {
      facts.push(`• Organized ${club.events.length} event${club.events.length !== 1 ? 's' : ''} so far`)
    }
    
    // Domain-based facts
    const domainFacts: { [key: string]: string[] } = {
      'robotics': [
        '🤖 Robotics clubs often participate in competitions like FIRST Robotics, VEX Robotics, and RoboCup',
        '🔧 Members typically learn programming, electronics, and mechanical design',
        '🏆 Many robotics clubs win regional and national competitions annually'
      ],
      'coding': [
        '💻 Coding clubs usually work on projects using languages like Python, JavaScript, and Java',
        '🚀 Members often participate in hackathons and coding competitions',
        '🌟 Many coding clubs contribute to open-source projects'
      ],
      'art': [
        '🎨 Art clubs explore various mediums including digital art, painting, and sculpture',
        '📸 Photography and design are common specializations',
        '🏅 Art clubs frequently exhibit work in local galleries and competitions'
      ],
      'music': [
        '🎵 Music clubs often include bands, choirs, and individual performers',
        '🎹 Learning instruments and music theory are core activities',
        '🎤 Many music clubs perform at school events and local venues'
      ],
      'sports': [
        '⚽ Sports clubs organize training sessions and friendly matches',
        '🏃 Fitness and teamwork are key focuses',
        '🥇 Competitive sports clubs often participate in inter-school tournaments'
      ],
      'science': [
        '🔬 Science clubs conduct experiments and research projects',
        '🧪 Chemistry, physics, and biology are common areas of study',
        '🔭 Many science clubs participate in science fairs and competitions'
      ],
      'literature': [
        '📚 Literature clubs organize book discussions and writing workshops',
        '✍️ Creative writing and poetry are popular activities',
        '📖 Members often publish their own magazines or anthologies'
      ],
      'debate': [
        '🗣️ Debate clubs participate in competitive debating tournaments',
        '💭 Critical thinking and public speaking skills are developed',
        '🏆 Many debate clubs win regional and national championships'
      ]
    }
    
    const clubDomain = club.domain?.toLowerCase()
    if (domainFacts[clubDomain]) {
      // Add 1-2 random facts from the domain
      const randomFacts = domainFacts[clubDomain].sort(() => 0.5 - Math.random()).slice(0, 2)
      facts.push(...randomFacts)
    }
    
    // Age of club fact
    if (club.createdAt) {
      const createdDate = new Date(club.createdAt)
      const now = new Date()
      const ageInMonths = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      if (ageInMonths > 0) {
        facts.push(`• Established ${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} ago`)
      }
    }
    
    return facts.length > 0 ? facts.join('\n') : null
  }

  // Get contextual information based on current page
  const getPageContext = (path: string): {
    title: string
    description: string
    suggestions: string[]
    isClubPage?: boolean
    clubId?: string
  } => {
    // Handle club detail pages
    if (path.startsWith('/clubs/') && path !== '/clubs') {
      const clubId = path.split('/clubs/')[1]
      return {
        title: 'Club Details',
        description: `Exploring club details. I can provide insights about this club's activities, achievements, and interesting facts.`,
        suggestions: ['Tell me about this club\'s recent achievements', 'What events does this club organize?', 'How can I get involved?'],
        isClubPage: true,
        clubId: clubId
      }
    }

    const contexts = {
      '/': {
        title: 'Home',
        description: 'Welcome to ClubHub! I can help you navigate the platform.',
        suggestions: ['Show me available clubs', 'How do I join a club?', 'What events are coming up?']
      },
      '/dashboard': {
        title: 'Dashboard',
        description: 'Your personal dashboard. I can help you manage your clubs and activities.',
        suggestions: ['Create a new post', 'Check my club memberships', 'View upcoming events']
      },
      '/clubs': {
        title: 'Clubs',
        description: 'Browse and discover amazing clubs in our community.',
        suggestions: ['Search for clubs by interest', 'Join a new club', 'Create your own club']
      },
      '/events': {
        title: 'Events',
        description: 'Discover and manage club events happening around you.',
        suggestions: ['Find events by date', 'RSVP to events', 'Create a new event']
      },
      '/member': {
        title: 'Members',
        description: 'Manage your club members and their roles.',
        suggestions: ['Add new members', 'Update member roles', 'View member activity']
      },
      '/announcements': {
        title: 'Announcements',
        description: 'Stay updated with the latest news and announcements.',
        suggestions: ['Create an announcement', 'View recent updates', 'Manage announcements']
      },
      '/finances': {
        title: 'Finances',
        description: 'Track and manage your club\'s financial activities.',
        suggestions: ['Add expenses', 'View financial reports', 'Manage budgets']
      },
      '/profile': {
        title: 'Profile',
        description: 'Manage your personal profile and preferences.',
        suggestions: ['Update profile information', 'Change settings', 'View activity history']
      }
    }

    return contexts[path as keyof typeof contexts] || {
      title: 'ClubHub',
      description: 'Your comprehensive club management platform.',
      suggestions: ['Explore clubs', 'Check events', 'Update profile']
    }
  }

  // Fetch club data for club pages
  useEffect(() => {
    const fetchClubData = async () => {
      if (pathname.startsWith('/clubs/') && pathname !== '/clubs') {
        const clubId = pathname.split('/clubs/')[1]
        try {
          const response = await fetch(`/api/clubs/${clubId}`)
          if (response.ok) {
            const data = await response.json()
            setClubData(data)
          }
        } catch (error) {
          console.error('Failed to fetch club data:', error)
        }
      } else {
        setClubData(null)
      }
    }

    fetchClubData()
  }, [pathname])

  // Initialize with welcome message based on current page
  useEffect(() => {
    const context = getPageContext(pathname)
    
    let welcomeContent = `👋 Welcome to ${context.title}!\n\n${context.description}\n\n💡 Try asking:\n${context.suggestions.map(s => `• ${s}`).join('\n')}`
    
    // Add interesting facts for clubs
    if (context.isClubPage && clubData) {
      const facts = generateClubFacts(clubData)
      if (facts) {
        welcomeContent += `\n\n🎯 **Interesting Facts:**\n${facts}`
      }
    }
    
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [pathname, clubData])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Rate limiting: minimum 2 seconds between requests
    const now = Date.now()
    if (now - lastRequestTime < 2000) {
      const waitTime = Math.ceil((2000 - (now - lastRequestTime)) / 1000)
      const rateLimitMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Please wait ${waitTime} second(s) before sending another message.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, rateLimitMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setLastRequestTime(now)

    try {
      const context = getPageContext(pathname)
      const llm = getLLM()
      let systemPrompt = `You are Aura AI, a helpful assistant for ClubHub, a comprehensive club management platform.

Current page: ${context.title}
Page description: ${context.description}

You should provide contextual help based on the current page the user is on. Be friendly, helpful, and provide specific guidance related to club management, events, members, and platform features.

Keep responses concise but informative. If the user asks about features not available on the current page, suggest navigating to the appropriate page.`

      // Add club-specific information if available
      if (context.isClubPage && clubData) {
        systemPrompt += `

Current Club Information:
- Name: ${clubData.name}
- Description: ${clubData.description}
- Domain: ${clubData.domain}
- Members: ${clubData.members?.length || 0}
- Events: ${clubData.events?.length || 0}
- Created: ${new Date(clubData.createdAt).toLocaleDateString()}

Provide insights and interesting facts about this specific club when relevant.`
      }

      const response = await llm.invoke([
        new HumanMessage(systemPrompt),
        ...messages.slice(-5).map(m => m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
        ),
        new HumanMessage(input)
      ])

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content as string,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. This might be due to API quota limits or configuration issues. Please check your API keys and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 backdrop-blur-xl border-l border-purple-500/20 ${isMinimized ? 'w-16' : 'w-80'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          {!isMinimized && (
            <h2 className="text-lg font-bold text-purple-400">Aura AI</h2>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white ml-8'
                    : 'bg-slate-800 text-gray-300 mr-8'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bg-slate-800 p-3 rounded-lg mr-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-800 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                placeholder="Ask Aura AI..."
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}