export default function RightSidebar() {
  return (
    <div className="p-6 space-y-6">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-purple-300">
          Trending Clubs
        </h3>

        <p>🤖 Robotics Club</p>
        <p>🎭 Drama Society</p>
        <p>📸 Photography Club</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-purple-300">
          AI Insights
        </h3>

        <p>3 events happening today</p>
        <p>Robotics club growing fast</p>
        <p>Drama auditions trending</p>
      </div>

    </div>
  )
}