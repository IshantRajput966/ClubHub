"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, User, Lock, ChevronRight, Sparkles } from "lucide-react"

// All demo accounts grouped by role
const DEMO_ACCOUNTS = [
  {
    role:  "student",
    color: "from-gray-600 to-gray-700",
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    accounts: [
      { username: "student_demo", label: "Student Demo" },
      { username: "arjun_sharma", label: "Arjun Sharma" },
      { username: "priya_verma",  label: "Priya Verma"  },
      { username: "sneha_patel",  label: "Sneha Patel"  },
      { username: "karan_singh",  label: "Karan Singh"  },
      { username: "rohan_gupta",  label: "Rohan Gupta"  },
      { username: "ishant",       label: "Ishant"        },
      { username: "kunal",        label: "Kunal"         },
    ],
  },
  {
    role:  "member",
    color: "from-blue-600 to-blue-700",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    accounts: [
      { username: "member_demo",  label: "Member Demo"  },
      { username: "ananya_iyer",  label: "Ananya Iyer"  },
      { username: "vikram_nair",  label: "Vikram Nair"  },
      { username: "divya_mishra", label: "Divya Mishra" },
      { username: "rahul_joshi",  label: "Rahul Joshi"  },
      { username: "pooja_reddy",  label: "Pooja Reddy"  },
      { username: "riya",         label: "Riya"          },
      { username: "monty",        label: "Monty"         },
    ],
  },
  {
    role:  "leader",
    color: "from-yellow-600 to-amber-600",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    accounts: [
      { username: "leader_demo",  label: "Leader Demo"  },
      { username: "aditya_kumar", label: "Aditya Kumar" },
      { username: "meera_pillai", label: "Meera Pillai" },
      { username: "nikhil_rao",   label: "Nikhil Rao"   },
      { username: "shreya_bose",  label: "Shreya Bose"  },
      { username: "tanvir_khan",  label: "Tanvir Khan"  },
      { username: "lakshya",      label: "Lakshya"       },
      { username: "kartik",       label: "Kartik"        },
    ],
  },
  {
    role:  "faculty",
    color: "from-purple-600 to-violet-700",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    accounts: [
      { username: "faculty_demo", label: "Faculty Demo" },
      { username: "dr_sharma",    label: "Dr. Sharma"   },
      { username: "prof_mehta",   label: "Prof. Mehta"  },
      { username: "dr_krishnan",  label: "Dr. Krishnan" },
      { username: "prof_agarwal", label: "Prof. Agarwal"},
      { username: "dr_banerjee",  label: "Dr. Banerjee" },
    ],
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername]     = useState("")
  const [password, setPassword]     = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [quickLoading, setQuickLoading] = useState<string | null>(null)

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
      router.push("/dashboard")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setQuickLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />

      {/* Radial gradient: pure black at center (form), purple outward */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 70% at 25% 50%, rgba(0,0,0,0.97) 0%, rgba(5,2,15,0.95) 30%, rgba(20,8,55,0.88) 55%, rgba(60,20,120,0.80) 75%, rgba(100,30,180,0.70) 100%)",
        }}
      />

      {/* Extra purple push at corners and edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 80% 50%, rgba(120,40,200,0.35) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Login form ── */}
        <div className="flex flex-col justify-center">
          {/* Logo with glow */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 flex items-center justify-center">
              {/* Large radial glow — black at logo center, purple outward */}
              <div className="absolute"
                style={{
                  width: "320px",
                  height: "320px",
                  background: "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 20%, rgba(30,10,80,0.7) 50%, rgba(100,30,200,0.4) 70%, transparent 85%)",
                  filter: "blur(8px)",
                  borderRadius: "50%",
                }} />
              {/* Extra purple ring further out */}
              <div className="absolute"
                style={{
                  width: "420px",
                  height: "420px",
                  background: "radial-gradient(circle, transparent 40%, rgba(120,40,220,0.25) 65%, rgba(140,50,240,0.15) 80%, transparent 90%)",
                  filter: "blur(15px)",
                  borderRadius: "50%",
                }} />
              <img
                src="/logo-1.jpg.jpeg"
                alt="ClubHub"
                className="relative w-52 h-52 object-contain"
                style={{
                  mixBlendMode: "lighten",
                  filter: "drop-shadow(0 0 25px rgba(139,92,246,0.9)) brightness(1.1)",
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 mt-1">Sign in to your ClubHub account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-gray-500" />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-gray-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-white/15 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ChevronRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-purple-400" />
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Demo Password</p>
            </div>
            <p className="text-white font-mono text-sm">ClubHub@123</p>
            <p className="text-xs text-gray-500 mt-1">All demo accounts use this password</p>
          </div>
        </div>

        {/* ── Right: Demo accounts ── */}
        <div className="overflow-y-auto max-h-[85vh] space-y-4 pr-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-300">Quick Login</p>
            <span className="text-xs text-gray-500">— click any account</span>
          </div>

          {DEMO_ACCOUNTS.map(group => (
            <div key={group.role} className="rounded-2xl border border-white/10 overflow-hidden"
                 style={{ background: "rgba(255,255,255,0.05)" }}>
              {/* Role header */}
              <div className={`px-4 py-2.5 bg-gradient-to-r ${group.color} flex items-center justify-between`}>
                <span className="text-white font-semibold text-sm capitalize">{group.role}</span>
                <span className="text-white/60 text-xs">{group.accounts.length} accounts</span>
              </div>

              {/* Accounts grid */}
              <div className="grid grid-cols-2 gap-1.5 p-2">
                {group.accounts.map(acc => (
                  <button
                    key={acc.username}
                    onClick={() => handleQuickLogin(acc.username)}
                    disabled={quickLoading !== null}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/10 transition text-left group disabled:opacity-60"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${group.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {quickLoading === acc.username
                        ? <Loader2 size={14} className="animate-spin" />
                        : acc.label[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate group-hover:text-purple-200 transition">
                        {acc.label}
                      </p>
                      <p className="text-gray-500 text-[10px] truncate">{acc.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        </div>
      </div>
    </div>
  )
}
