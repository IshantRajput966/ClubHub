import { ArrowRight, Terminal } from "lucide-react"

export default function FinanceTable() {
  const transactions = [
    { item: "Event Catering", amount: 120, status: "PAID", date: "2024-03-20" },
    { item: "Venue Booking", amount: 300, status: "PENDING", date: "2024-03-22" },
    { item: "Equipment Sync", amount: 450, status: "PAID", date: "2024-03-24" },
    { item: "Neural Branding", amount: 150, status: "DENIED", date: "2024-03-25" },
  ]

  return (
    <div className="group relative p-1 rounded-[31px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
      <div className="h-full w-full rounded-[30px] bg-black/40 backdrop-blur-3xl p-8 border border-white/5 shadow-inner">
        
        <div className="flex items-center gap-3 mb-8">
          <Terminal size={18} className="text-purple-500" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">
            Recent Ledger Signals
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Transaction Entity</th>
                <th className="pb-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-500">Temporal Stamp</th>
                <th className="pb-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-500">Credit Flow</th>
                <th className="pb-4 text-right text-[9px] font-black uppercase tracking-widest text-gray-500">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {transactions.map((tx, i) => (
                <tr key={i} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/row:border-purple-500/30 transition-colors">
                        <ArrowRight size={14} className="text-gray-600 group-hover/row:text-purple-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 group-hover/row:text-white transition-colors">{tx.item}</span>
                    </div>
                  </td>
                  <td className="py-5 text-center text-[10px] font-bold text-gray-600 tabular-nums">
                    {tx.date}
                  </td>
                  <td className="py-5 text-center font-black italic text-white tracking-tight">
                    ${tx.amount}
                  </td>
                  <td className="py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                      tx.status === "PAID" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      tx.status === "PENDING" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}