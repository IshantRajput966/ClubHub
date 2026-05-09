import { Sidebar } from "@/components/layout/sidebar"
import FinanceTable from "@/components/finance/finance-table"
import { CreditCard, TrendingUp, ArrowDownRight, ArrowUpRight, Activity } from "lucide-react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { useState } from "react"

function SpendingVelocityChart() {
  const data = [40, 70, 45, 90, 65, 85, 50, 75, 40, 60, 80, 55]
  return (
    <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.01] shadow-2xl mb-10 overflow-hidden">
      <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-8 border border-white/5 flex flex-col relative overflow-hidden">
        {/* Background signal glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
             <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <Activity size={16} className="text-pink-400" />
             </div>
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Spectral Signal Flow</h2>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Neural Spending Velocity — Last 30 Days</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Live Telemetry</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-1 h-32 w-full relative z-10 group/chart">
          {data.map((val, i) => (
            <div 
              key={i} 
              className="flex-1 bg-gradient-to-t from-purple-600/40 via-blue-500/40 to-transparent rounded-t-lg transition-all duration-500 hover:from-purple-500/80 hover:via-blue-400/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              style={{ height: `${val}%`, transitionDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans flex-col lg:flex-row bg-[#02020a]">
      <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0 p-4 md:p-10 pt-20 lg:pt-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <CreditCard className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Credit Register</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 italic">Resource Allocation Nexus</p>
              </div>
            </div>
            <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              Request Disbursement
            </button>
          </div>

          {/* Metrics & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            <div className="lg:col-span-3">
               <SpendingVelocityChart />
            </div>
            <div className="flex flex-col gap-6">
              {[
                { label: "Neural Credits", value: "$4,250", color: "text-emerald-400", icon: TrendingUp },
                { label: "Allocated",         value: "$1,890", color: "text-blue-400",    icon: ArrowDownRight },
              ].map(s => (
                <div key={s.label} className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] shadow-2xl flex-1">
                  <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                    <p className={`text-4xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { label: "Pending Claims",    value: "$420",   color: "text-amber-400",   icon: ArrowUpRight },
                { label: "Pulse Efficiency",  value: "94%",    color: "text-purple-400",  icon: CreditCard },
              ].map(s => (
                <div key={s.label} className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] shadow-xl">
                  <div className="h-full w-full rounded-xl bg-black/40 backdrop-blur-3xl p-4 border border-white/5 flex items-center justify-between px-8">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">{s.label}</p>
                    <p className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
          </div>

          <FinanceTable />

        </div>
      </div>
    </div>
  )
}