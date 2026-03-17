export default function FinanceTable() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4">
        Recent Transactions
      </h2>

      <table className="w-full text-sm">

        <thead className="border-b">
          <tr>
            <th className="py-2 text-left">Item</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          <tr className="border-b">
            <td className="py-2">Event Catering</td>
            <td>$120</td>
            <td className="text-green-600">Paid</td>
          </tr>

          <tr className="border-b">
            <td className="py-2">Venue Booking</td>
            <td>$300</td>
            <td className="text-yellow-500">Pending</td>
          </tr>

        </tbody>

      </table>

    </div>
  )
}