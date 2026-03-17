import { Sidebar } from "@/components/layout/sidebar"
import FinanceTable from "@/components/finance/finance-table"

export default function FinancePage() {
  return (
    <div className="flex h-screen bg-black">

      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        <h1 className="text-3xl font-bold mb-6 text-white">
          Finances
        </h1>

        <FinanceTable />

      </main>

    </div>
  )
}