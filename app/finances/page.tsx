import { Sidebar } from "@/components/layout/sidebar"
import FinanceTable from "@/components/finance/finance-table"
import { CreditCard, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react"

export default function FinancePage() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto scrollbar-hide z-0 p-10">
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

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            {[
              { label: "Available Credits", value: "$4,250", color: "text-emerald-400", icon: TrendingUp },
              { label: "Allocated",         value: "$1,890", color: "text-blue-400",    icon: ArrowDownRight },
              { label: "Pending Claims",    value: "$420",   color: "text-amber-400",   icon: ArrowUpRight },
              { label: "Pulse Efficiency",  value: "94%",    color: "text-purple-400",  icon: CreditCard },
            ].map(s => (
              <div key={s.label} className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent transition-all hover:scale-[1.02] shadow-2xl">
                <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                  <p className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
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