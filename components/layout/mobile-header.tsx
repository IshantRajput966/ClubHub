"use client"

import { Menu, Zap } from "lucide-react"
import Link from "next/link"

export function MobileHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-[100] h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar}
          className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-1.5 shadow-lg shadow-purple-500/20">
              <Zap className="text-white fill-white" size={16} />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">ClubHub</span>
        </Link>
      </div>
      
      {/* Search Shortcut for Mobile */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-500 font-bold uppercase">
         CTRL + K
      </div>
    </header>
  )
}
