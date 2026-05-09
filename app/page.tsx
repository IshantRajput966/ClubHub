"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Eye, EyeOff, Loader2, User, Lock, ChevronRight, Sparkles, 
  ShieldCheck, Zap, Globe, Users, Calendar, Trophy, 
  ArrowRight, MousePointer2, LayoutDashboard, Database, 
  Brain, Network, MessageSquare, Play, Star
} from "lucide-react"

// Base metadata for roles used in Command Center
const ROLE_METADATA: Record<string, any> = {
  student: { color: "from-gray-800 to-black", icon: <Users size={16} /> },
  member:  { color: "from-blue-900 to-black", icon: <ShieldCheck size={16} /> },
  leader:  { color: "from-purple-900/50 to-black", icon: <Trophy size={16} /> },
  faculty: { color: "from-emerald-900/50 to-black", icon: <Database size={16} /> },
}

export default function LandingPage() {
  const router = useRouter()
  // Auth state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Quick Login state
  const [quickLoading, setQuickLoading] = useState<string | null>(null)
  const [demoGroups, setDemoGroups] = useState<any[]>([])
  
  // Background particles
  const [particles, setParticles] = useState<any[]>([])

  // Fade-in observer
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Generate Neural Particles
    const p = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: Math.random() * 0.5 + 0.1
    }))
    setParticles(p)

    // Fetch demo accounts
    async function fetchDemoAccounts() {
      try {
        const res = await fetch("/api/auth/demo-accounts", { cache: "no-store" })
        if (!res.ok) return
        const users: any[] = await res.json()
        
        const groups: Record<string, any[]> = { student: [], member: [], leader: [], faculty: [] }
        users.forEach(u => {
          const roleKey = u.role.toLowerCase()
          if (groups[roleKey]) {
            groups[roleKey].push({ 
              username: u.username, 
              label: u.username.split('_').map((s:string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') 
            })
          }
        })

        const formatted = Object.keys(ROLE_METADATA).map(role => ({
          role,
          ...ROLE_METADATA[role],
          accounts: groups[role] || []
        }))
        setDemoGroups(formatted)
      } catch (err) {}
    }
    fetchDemoAccounts()
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
        }
      })
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" })

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  async function login(u: string, p: string) {
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username: u, password: p }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Login failed")
    return data
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await login(username.trim().toLowerCase(), password)
      sessionStorage.setItem("username", data.username)
      sessionStorage.setItem("role",     data.role)
      localStorage.setItem("username",   data.username)
      localStorage.setItem("originalUsername", data.username)
      router.push("/dashboard")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleQuickLogin(u: string) {
    setQuickLoading(u)
    setError(null)
    try {
      const data = await login(u, "ClubHub@123")
      sessionStorage.setItem("username", data.username)
      sessionStorage.setItem("role",     data.role)
      localStorage.setItem("username",   data.username)
      localStorage.setItem("originalUsername", data.username)
      router.push("/dashboard")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setQuickLoading(null)
    }
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-[#010109] text-white min-h-screen selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* ── GLOBAL BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: p.left, top: p.top, width: p.size, height: p.size,
              animationDuration: p.duration, animationDelay: p.delay,
              opacity: p.opacity,
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)"
            }}
          />
        ))}
      </div>

      {/* ── 1. HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32">
        {/* Volumetric Corner Lighting (Pushed to edges) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Centerpiece: Floating Logo */}
          <div className="mb-6 animate-float-y animate-fade-in-up">
            <img 
              src="/logo.png" alt="ClubHub" 
              className="w-56 h-56 md:w-64 md:h-64 object-contain brightness-110"
              style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,0.05))", mixBlendMode: "lighten" }}
            />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 animate-fade-in-up-delay-1 leading-[1.1]">
            Manage Clubs.<br/>Simplify Campus Life.
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up-delay-2">
            The all-in-one management platform to oversee events, scale memberships, and orchestrate communication effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3 w-full sm:w-auto">
            <button 
              onClick={() => scrollToSection('login')}
              className="relative group h-14 w-full sm:w-56 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-[1px] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-shadow pointer-events-none" />
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="h-14 w-full sm:w-48 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-semibold hover:bg-white/[0.06] hover:border-white/20 transition-all backdrop-blur-md"
            >
              Explore Platform
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURES (GLASS SHOWCASE) ── */}
      <section id="features" className="relative py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-[#010109]">
        <div className="max-w-7xl mx-auto px-6">
          <div id="feat-title" data-animate className={`text-center mb-20 transition-all duration-1000 ${isVisible['feat-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Command Your Organization</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">High-fidelity tools designed for modern student leaders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Event Pulse */}
            <div id="card-1" data-animate className={`animate-tilt relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent transition-all duration-1000 delay-100 ${isVisible['card-1'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-full w-full rounded-[23px] bg-black/60 backdrop-blur-2xl p-8 border border-white/5 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 border border-purple-500/30">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upcoming Events</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                  Broadcast live events, manage RSVPs, and automatically sync schedules across your entire member base.
                </p>
                {/* Visual mockup */}
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-4 overflow-hidden relative">
                   <div className="w-3/4 h-3 bg-white/20 rounded-full mb-3" />
                   <div className="w-1/2 h-3 bg-purple-500/40 rounded-full mb-6" />
                   <div className="absolute right-[-10%] bottom-[-10%] w-24 h-24 bg-purple-500/20 blur-2xl rounded-full" />
                </div>
              </div>
            </div>

            {/* Card 2: Activity Feed */}
            <div id="card-2" data-animate className={`animate-tilt relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent transition-all duration-1000 delay-200 ${isVisible['card-2'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-full w-full rounded-[23px] bg-black/60 backdrop-blur-2xl p-8 border border-white/5 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 border border-blue-500/30">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Club Activity Feed</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                  A centralized, real-time hub for announcements, discussions, and vibrant community interactions.
                </p>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-4 overflow-hidden flex flex-col gap-3">
                   <div className="flex gap-2 items-center"><div className="w-6 h-6 rounded-full bg-blue-500/40" /><div className="w-full h-2 bg-white/10 rounded-full" /></div>
                   <div className="flex gap-2 items-center"><div className="w-6 h-6 rounded-full bg-purple-500/40" /><div className="w-2/3 h-2 bg-white/10 rounded-full" /></div>
                </div>
              </div>
            </div>

            {/* Card 3: Community Pulse */}
            <div id="card-3" data-animate className={`animate-tilt relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent transition-all duration-1000 delay-300 ${isVisible['card-3'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-full w-full rounded-[23px] bg-black/60 backdrop-blur-2xl p-8 border border-white/5 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 border border-cyan-500/30">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Member Profiles</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                  Deeply integrated member directories allow you to find colleagues, view leadership roles, and connect instantly.
                </p>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-4 overflow-hidden relative flex flex-col gap-2">
                   <div className="w-full h-2 bg-white/10 rounded-full" />
                   <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                   <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6">
          <div id="flow-title" data-animate className={`mb-20 transition-all duration-1000 ${isVisible['flow-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-center md:text-left">Architected for Scale</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-between relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -z-10" />

            {[
              { step: "01", title: "Join", desc: "Browse the campus neural network and submit requests directly." },
              { step: "02", title: "Connect", desc: "Gain immediate access to private feeds and internal events." },
              { step: "03", title: "Lead", desc: "Ascend to presidency and inherit absolute administrative control." }
            ].map((s, i) => (
              <div key={i} id={`flow-${i}`} data-animate className={`flex-1 p-8 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-lg hover:bg-white/[0.04] transition-colors transition-all duration-1000 ${isVisible[`flow-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 150}ms`}}>
                 <span className="text-5xl font-black text-white/5 block mb-6">{s.step}</span>
                 <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. ANALYTICS PREVIEW ── */}
      <section className="py-32 border-y border-white/5 bg-gradient-to-b from-[#010109] to-blue-900/10 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div id="ai-text" data-animate className={`transition-all duration-1000 ${isVisible['ai-text'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
               <Database size={14} /> System Core
             </div>
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Data Visualization<br/>For Every Leader.</h2>
             <p className="text-gray-400 text-lg leading-relaxed mb-8">
               Track club growth and financial performance with high-fidelity charts and automated reports. Professional-grade management for every society.
             </p>
             <button className="flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors">
               Explore Governance <ArrowRight size={16} />
             </button>
          </div>
          
          <div id="ai-vis" data-animate className={`relative h-[400px] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden transition-all duration-1000 delay-200 ${isVisible['ai-vis'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
             {/* Visual Abstract Analysis */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[1px] border-blue-500/30 flex items-center justify-center animate-pulse">
                <LayoutDashboard className="text-blue-400" size={40} />
             </div>
             <div className="absolute top-[20%] left-[20%] w-full h-[1px] bg-white/5" />
             <div className="absolute top-[40%] left-[20%] w-full h-[1px] bg-white/5" />
             <div className="absolute top-[60%] left-[20%] w-full h-[1px] bg-white/5" />
             <div className="absolute top-[80%] left-[20%] w-full h-[1px] bg-white/5" />
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ── */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Trusted by Campus Leaders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { text: "ClubHub transformed our fragmented email chains into a unified, high-speed ecosystem. Absolutely vital for our tech society.", author: "Arjun Verma", role: "Coding Club President" },
              { text: "The event matching is flawless. I found my perfect robotics team in my first week without checking a single notice board.", author: "Priya Singh", role: "First-Year Member" }
            ].map((t, i) => (
              <div key={i} id={`test-${i}`} data-animate className={`p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-md transition-all duration-1000 ${isVisible[`test-${i}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                 <div className="flex text-purple-400 mb-6"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                 <p className="text-lg text-gray-300 leading-relaxed italic mb-8">"{t.text}"</p>
                 <div>
                   <p className="font-bold text-white">{t.author}</p>
                   <p className="text-xs text-gray-500 uppercase tracking-widest">{t.role}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA & COMMAND CENTER ── */}
      <section id="login" className="py-32 border-t border-white/5 relative overflow-hidden bg-gradient-to-b from-transparent to-[#050510]">
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-purple-600/10 blur-[200px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Ready to Lead?</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Authenticate into the system and explore the live demo environment.</p>
          </div>

          <div className="max-w-md mx-auto">
            
            {/* Standard Login Panel */}
            <div className="p-[1px] rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-black/80 backdrop-blur-3xl p-10 rounded-[31px] border border-white/5">
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/10">
                   <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                     <Lock size={18} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold">Secure Access</h3>
                     <p className="text-xs text-gray-500 uppercase tracking-widest">Global Entry Point</p>
                   </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                      <input 
                        value={username} onChange={e => setUsername(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group/input">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                      <input 
                        type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">{error}</div>}

                  <button disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)] flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ChevronRight size={18} /></>}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4">Demo Password: <span className="text-purple-400 font-mono">ClubHub@123</span></p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10">
         <p className="text-gray-600 text-xs uppercase tracking-widest font-bold">© 2026 ClubHub. Powered autonomously.</p>
      </footer>
    </div>
  )
}
