import { Card, CardContent } from "@/components/ui/card"

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-3 gap-6">

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm text-gray-500">Total Members</h3>
          <p className="text-3xl font-bold">124</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm text-gray-500">Remaining Budget</h3>
          <p className="text-3xl font-bold">$4200</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm text-gray-500">Upcoming Events</h3>
          <p className="text-3xl font-bold">3</p>
        </CardContent>
      </Card>

    </div>
  )
}