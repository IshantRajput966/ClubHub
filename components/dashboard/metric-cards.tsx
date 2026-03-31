export default function MetricCards() {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-sm text-gray-500">Total Members</p>
        <h2 className="text-3xl font-bold">156</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-sm text-gray-500">Account Balance</p>
        <h2 className="text-3xl font-bold">$2450</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-sm text-gray-500">Upcoming Events</p>
        <h2 className="text-3xl font-bold">4</h2>
      </div>

    </div>
  )
}