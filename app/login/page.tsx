"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, User, Lock, ChevronRight, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Floating particles background
  const [particles, setParticles] = useState<any[]>([])
  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 20}s`,
      size: `${1 + Math.random() * 2}px`
    }))
    setParticles(p)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError("Please enter your credentials")
      return
    }
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          username: username.trim().toLowerCase(), 
          password 
        }),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error ?? "Authentication failed")
      
      sessionStorage.setItem("username", data.username)
      sessionStorage.setItem("role",     data.role)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 overflow-hidden selection:bg-purple-500/30">
      
      {/* ── BACKGROUND: VANTABLACK ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* NEURAL PULSE BACKGROUND — Volumetric corner lighting */}
        
        {/* Top-Left: Neon Purple Core */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-500/5 blur-[100px] rounded-full animate-float-y" />
        
        {/* Bottom-Right: Electric Cyan Core */}
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-500/5 blur-[100px] rounded-full animate-float-y" style={{ animationDelay: '2s' }} />

        {/* Peripheral Rim Glows */}
        <div className="absolute top-[25%] left-[-15%] w-[25%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[25%] right-[-15%] w-[25%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />

        {/* NO RADIAL GRADIENTS NEAR LOGO — SOLID VANTABLACK SURROUNDINGS */}
        
        {/* Floating Neural Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/20 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
              boxShadow: "0 0 8px rgba(255,255,255,0.2)"
            }}
          />
        ))}
      </div>

      {/* ── CENTERPIECE: FLOATING LOGO ── */}
      <div className="relative z-10 mb-0 animate-float-y flex flex-col items-center">
        {/* BALANCED LOGO — PURE VANTABLACK SURROUNDINGS */}
        <img 
          src="/logo.png" 
          alt="ClubHub" 
          className="relative w-56 h-56 md:w-64 md:h-64 object-contain brightness-110" 
          style={{ 
            filter: "drop-shadow(0 0 1px rgba(255,255,255,0.05))",
            mixBlendMode: "lighten" // Helps blend the black background of the logo with the pure black of the page
          }}
        />
      </div>

      {/* ── GLASSMORPHISM LOGIN CARD ── */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-[32px] bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-purple-500/30 transition-all duration-500">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm font-light tracking-wide">Enter your neural credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2 group/input">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Ident_Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 group/input">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Security_Cipher</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {/* Neon Login Button */}
            <button
              disabled={loading}
              className="w-full relative group/btn h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-[1px] font-bold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <div className="relative h-full w-full bg-transparent flex items-center justify-center gap-2 text-white text-sm tracking-widest uppercase">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initiate Session <ChevronRight size={18} /></>}
              </div>
              {/* Outer Glow */}
              <div className="absolute inset-0 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all pointer-events-none" />
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-300">
               <Sparkles size={12} />
               <span>Demo Protocol: ClubHub@123</span>
             </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER HINT ── */}
      <div className="mt-20 relative z-10 text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity duration-700">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">ClubHub Neural Entry Point v2.0</p>
        <p className="text-[10px] font-light text-gray-600">Secure SHA-256 Hashed Authentication Enabled</p>
      </div>

    </div>
  )
}