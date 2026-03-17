"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Users, Calendar, Wallet, Globe,
  Bell, UserPlus, Compass, BarChart2, ClipboardList,
  BookMarked, Crown, Shield,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: any
}

interface JoinedClub {
  id: string
  name: string
  logoUrl?: string
}

export function Sidebar({ joinedClubs = [] }: { joinedClubs?: JoinedClub[] }) {
  const pathname                    = usePathname()
  const [role, setRole]             = useState("student")
  const [username, setUsername]     = useState<string | null>(null)
  const [myClubs, setMyClubs]       = useState<JoinedClub[]>(joinedClubs)
  const [pending, setPending] = useState(0)
  const currentLogo = "/logo-1.jpg.jpeg"

  useEffect(() => {
    const savedRole  = sessionStorage.getItem("role") ?? "student"
    const savedUser  = sessionStorage.getItem("username")
    setRole(savedRole)
    setUsername(savedUser)

    if (savedUser && ["member", "leader"].includes(savedRole)) {
      fetch("/api/clubs")
        .then(r => r.json())
        .then((data: any[]) => {
          const mine = data
            .filter(c => c.members?.some((m: any) => m.username === savedUser))
            .map(c => ({ id: c.id, name: c.name, logoUrl: c.logoUrl }))
          setMyClubs(mine)
        })
        .catch(() => {})
    }

    // Poll pending requests count for leaders
    if (savedRole === "leader" && savedUser) {
      const pollPending = () => {
        fetch("/api/clubs")
          .then(r => r.json())
          .then(async (clubs: any[]) => {
            const mine = clubs.filter(c =>
              c.members?.some((m: any) =>
                m.username === savedUser && ["president", "officer"].includes(m.role)
              )
            )
            let count = 0
            await Promise.all(mine.map(async (club: any) => {
              const reqs = await fetch(`/api/join-requests?clubId=${club.id}`).then(r => r.json())
              count += reqs.filter((r: any) => r.status === "pending").length
            }))
            setPending(count)
            ;(window as any).__clubhub_pending = count
          })
          .catch(() => {})
      }
      pollPending()
      const interval = setInterval(pollPending, 10000)
      return () => clearInterval(interval)
    }
  }, [])

  // ── Nav items ───────────────────────────────────────────────────────────────
  const baseItems: NavItem[] = [
    { name: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard },
    { name: "Clubs",         href: "/clubs",         icon: Globe           },
    { name: "Events",        href: "/events",        icon: Calendar        },
    { name: "Announcements", href: "/announcements", icon: Bell            },
  ]

  const studentExtras: NavItem[] = [
    { name: "Join Requests", href: "/join-requests", icon: UserPlus },
  ]

  const memberExtras: NavItem[] = [
    { name: "Join Requests", href: "/join-requests", icon: UserPlus   },
    { name: "My Clubs",      href: "/my-clubs",       icon: BookMarked },
    { name: "Members",       href: "/member",         icon: Users      },
  ]

  const leaderExtras: NavItem[] = [
    { name: "My Clubs",        href: "/my-clubs",       icon: BookMarked    },
    { name: "Members",         href: "/member",         icon: Users         },
    { name: "Manage Requests", href: "/join-requests",  icon: ClipboardList },
    { name: "Finances",        href: "/finances",       icon: Wallet        },
  ]

  const facultyExtras: NavItem[] = [
    { name: "My Clubs", href: "/my-clubs",  icon: BookMarked },
    { name: "Members",  href: "/member",    icon: Users      },
    { name: "Reports",  href: "/reports",   icon: BarChart2  },
  ]

  const extrasMap: Record<string, NavItem[]> = {
    student: studentExtras,
    member:  memberExtras,
    leader:  leaderExtras,
    faculty: facultyExtras,
  }

  // ── Role badge ──────────────────────────────────────────────────────────────
  const roleBadge: Record<string, { label: string; color: string; icon: any }> = {
    student: { label: "Student", color: "text-gray-400 bg-white/10",          icon: Users     },
    member:  { label: "Member",  color: "text-blue-300 bg-blue-500/20",        icon: Shield    },
    leader:  { label: "Leader",  color: "text-yellow-300 bg-yellow-500/20",    icon: Crown     },
    faculty: { label: "Faculty", color: "text-purple-300 bg-purple-500/20",    icon: BarChart2 },
  }
  const badge    = roleBadge[role] ?? roleBadge.student
  const BadgeIcon = badge.icon

  return (
    <div
      className="flex flex-col h-screen pt-0 px-4 pb-4 text-white w-64 border-r border-white/10 sticky top-0 overflow-y-auto"
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(10,5,25,1) 30%, rgba(30,10,60,0.98) 65%, rgba(80,20,140,0.95) 100%)" }}
    >
      {/* ── Logo ── */}
      <div className="mb-6 -mx-4 mt-6">
        <div className="relative w-full overflow-hidden">
          <img
            src={currentLogo}
            alt="ClubHub Logo"
            className="w-full object-cover"
            style={{ maxHeight: "180px", objectPosition: "center" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="flex justify-center pt-2 px-4">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
            <BadgeIcon size={11} />
            {badge.label}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-1">Navigation</p>
        {baseItems.map(item => <NavLink key={item.href + item.name} item={item} pathname={pathname} />)}

        {(extrasMap[role] ?? []).length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mt-4 mb-1">
              {role === "student" ? "Membership" :
               role === "member"  ? "My Activity" :
               role === "leader"  ? "Club Management" : "Faculty Tools"}
            </p>
            {(extrasMap[role] ?? []).map(item => (
              <NavLink key={item.href + item.name} item={item} pathname={pathname} badge={item.name === "Manage Requests" ? pending : 0} />
            ))}
          </>
        )}

        {myClubs.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mt-4 mb-1">My Clubs</p>
            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
              {myClubs.map(club => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all hover:bg-purple-500/20 hover:translate-x-1 ${
                    pathname === `/clubs/${club.id}` ? "bg-purple-500/30 border border-purple-400/50" : ""
                  }`}
                >
                  <div className="w-5 h-5 rounded-md bg-purple-500/50 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {club.logoUrl
                      ? <img src={club.logoUrl} alt={club.name} className="w-5 h-5 rounded-md object-cover" />
                      : club.name[0]}
                  </div>
                  <span className="truncate text-gray-300 text-xs">{club.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* ── Profile ── */}
      <Link href="/profile">
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{username ?? "Guest"}</span>
              <span className="text-xs text-gray-400 truncate">@{username?.toLowerCase() ?? "guest"}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ item, pathname, badge = 0 }: { item: NavItem; pathname: string; badge?: number }) {
  const Icon   = item.icon
  const active = pathname === item.href

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-purple-500/20 hover:translate-x-1 ${
        active ? "bg-purple-500/30 border border-purple-400/50 text-white" : "text-gray-300 hover:text-white"
      }`}
    >
      <Icon size={16} className={active ? "text-purple-300" : "text-gray-400"} />
      <span className="flex-1">{item.name}</span>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 animate-pulse">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  )
}
