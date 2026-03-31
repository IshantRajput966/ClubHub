"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Send, Bot, X, Minimize2, Maximize2 } from "lucide-react"
import { ChatOpenAI } from "@langchain/openai"
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import { TypewriterText } from "./typewriter-text"

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
    if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      return new ChatGroq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
      })
    }
    if (process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY) {
      return new ChatGoogleGenerativeAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY,
        model: "gemini-pro",
        temperature: 0.7,
      })
    }
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return new ChatOpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      })
    }
    throw new Error("No AI API key configured.")
  }

  const generateClubFacts = (club: any) => {
    if (!club) return null
    const facts = []
    if (club.members?.length > 0) facts.push(`• This club has ${club.members.length} active members`)
    if (club.events?.length > 0) facts.push(`• Organized ${club.events.length} events so far`)
    return facts.length > 0 ? facts.join('\n') : null
  }

  const getPageContext = (path: string) => {
    if (path.startsWith('/clubs/') && path !== '/clubs') {
      const clubId = path.split('/clubs/')[1]
      return {
        title: 'Club Details',
        description: `Exploring club details.`,
        suggestions: ['Tell me about achievements', 'Events?', 'How to join?'],
        isClubPage: true,
        clubId: clubId
      }
    }
    const contexts: any = {
      '/': { title: 'Home', description: 'Welcome to ClubHub!', suggestions: ['Clubs', 'How to join?', 'Events'] },
      '/dashboard': { title: 'Dashboard', description: 'Your personal dashboard.', suggestions: ['Post', 'Memberships', 'Events'] },
      '/clubs': { title: 'Clubs', description: 'Discover amazing clubs.', suggestions: ['Search', 'Join', 'Create'] },
    }
    return contexts[path] || { title: 'ClubHub', description: 'Your management platform.', suggestions: ['Clubs', 'Events'] }
  }

  useEffect(() => {
    const fetchClubData = async () => {
      if (pathname.startsWith('/clubs/') && pathname !== '/clubs') {
        const clubId = pathname.split('/clubs/')[1]
        try {
          const response = await fetch(`/api/clubs/${clubId}`)
          if (response.ok) setClubData(await response.json())
        } catch (error) {}
      } else setClubData(null)
    }
    fetchClubData()
  }, [pathname])

  useEffect(() => {
    const context = getPageContext(pathname)
    let welcomeContent = `👋 Welcome to ${context.title}!\n\n${context.description}\n\n💡 Try asking:\n${context.suggestions.map((s: string) => `• ${s}`).join('\n')}`
    if (context.isClubPage && clubData) {
      const facts = generateClubFacts(clubData)
      if (facts) welcomeContent += `\n\n🎯 **Interesting Facts:**\n${facts}`
    }
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomeContent, timestamp: new Date() }])
  }, [pathname, clubData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    const now = Date.now()
    if (now - lastRequestTime < 2000) return
    const userMsg: Message = { id: now.toString(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)
    setLastRequestTime(now)
    try {
      const context = getPageContext(pathname)
      const llm = getLLM()
      const response = await llm.invoke([
        new HumanMessage(`You are Aura AI for ClubHub. Page: ${context.title}. Be concise and helpful.`),
        ...messages.slice(-5).map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)),
        new HumanMessage(input)
      ])
      // response.content can be a string OR an array of content blocks (LangChain)
      const rawContent = response.content
      let textContent: string
      if (typeof rawContent === 'string') {
        textContent = rawContent
      } else if (Array.isArray(rawContent)) {
        textContent = rawContent
          .map((block: any) => (typeof block === 'string' ? block : (block?.text ?? '')))
          .join('')
      } else {
        textContent = String(rawContent ?? '')
      }
      // Final safety: strip literal "undefined" that can appear from bad coercions
      textContent = textContent.replace(/\bundefined\b/g, '').trim()
      if (!textContent) textContent = "I couldn't generate a response. Please try again."
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: textContent, timestamp: new Date() }])
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Neural link error. API quota might be reached.', timestamp: new Date() }])
    } finally { setIsLoading(false) }
  }

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl transition-all duration-500 ${isMinimized ? 'w-16' : 'w-80'}`}
         style={{ background: "linear-gradient(180deg, rgba(15,10,30,0.95) 0%, rgba(5,5,15,0.98) 100%)" }}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!isMinimized && (
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Aura AI</h2>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest opacity-70">Neural Assistant</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {onToggleMinimize && (
            <button onClick={onToggleMinimize} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          )}
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-full animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`relative p-4 rounded-3xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-purple-600/90 text-white rounded-tr-none shadow-lg shadow-purple-600/10'
                      : 'bg-white/5 text-gray-300 rounded-tl-none backdrop-blur-md border border-white/10'
                  }`}
                  style={message.role === 'assistant' ? { background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(200,200,255,0.02) 100%)" } : {}}>
                  
                  <div className="whitespace-pre-wrap">
                    {message.role === 'assistant' ? <TypewriterText text={message.content} /> : message.content}
                  </div>
                  
                  <div className={`text-[9px] mt-2 font-bold uppercase tracking-widest opacity-30 ${message.role === 'user' ? 'text-white' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start max-w-full animate-pulse">
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest opacity-70">Synthesizing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-black/20 border-t border-white/5">
            <div className="flex gap-2 relative">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all text-sm resize-none custom-scrollbar"
                placeholder="Message Aura AI..."
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center bg-white text-black hover:bg-purple-500 hover:text-white disabled:bg-white/10 disabled:text-gray-600 p-3 rounded-2xl transition-all shadow-lg active:scale-95 shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}