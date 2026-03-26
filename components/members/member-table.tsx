"use client"

import { Users } from "lucide-react"

interface Member {
  id: string
  username: string
  email: string
  role: string
  joinDate: string
  bio?: string
}

interface MemberTableProps {
  members: Member[]
  isLoading: boolean
}

export function MemberTable({ members, isLoading }: MemberTableProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "leader":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "faculty":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "member":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "student":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400">No members yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-purple-500/20">
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">
              Username
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">
              Email
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">
              Role
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">
              Joined
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300">
              Bio
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
            >
              <td className="py-4 px-4">
                <p className="text-white font-semibold">{member.username}</p>
              </td>
              <td className="py-4 px-4">
                <p className="text-gray-400 text-sm">{member.email}</p>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    member.role
                  )}`}
                >
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4">
                <p className="text-gray-400 text-sm">
                  {new Date(member.joinDate).toLocaleDateString()}
                </p>
              </td>
              <td className="py-4 px-4">
                <p className="text-gray-400 text-sm truncate max-w-xs">
                  {member.bio || "-"}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}