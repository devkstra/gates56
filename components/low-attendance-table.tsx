"use client"

import { useState } from "react"
import { useGym } from "@/lib/context"
import { toast } from "sonner"
import { MessageCircle, Send } from "lucide-react"

export default function LowAttendanceTable() {
  const { members, attendance } = useGym()
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  // Find members who haven't visited in the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const lowAttendanceMembers = members.filter((member) => {
    if (member.status !== "active") return false

    const memberAttendance = attendance.find((a) => a.memberId === member.id)
    if (!memberAttendance) return true

    return new Date(memberAttendance.timestamp) < sevenDaysAgo
  })

  const sendWhatsAppNudge = (memberId: string, memberName: string, phoneNumber: string) => {
    setSendingTo(memberId)

    // Simulate sending
    setTimeout(() => {
      console.log(`[Simulation] WhatsApp message sent to ${memberName} (${phoneNumber}): "We miss you at the gym!"`)
      toast.success(`Message sent to ${memberName}! 📱`)
      setSendingTo(null)
    }, 1500)
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Low Attendance Members</h2>
        <span className="ml-auto text-sm bg-background px-3 py-1 rounded-full">
          {lowAttendanceMembers.length} members
        </span>
      </div>

      {lowAttendanceMembers.length === 0 ? (
        <div className="text-center text-muted-foreground text-opacity-80 py-8">
          <p>Great! All active members have visited recently.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-sm">Member Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Last Visit</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Days Inactive</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowAttendanceMembers.map((member) => {
                const memberLastVisit = member.lastVisitDate || new Date(0)
                const daysInactive = Math.floor(
                  (new Date().getTime() - memberLastVisit.getTime()) / (1000 * 60 * 60 * 24),
                )

                return (
                  <tr key={member.id} className="border-b border-border hover:bg-card-hover transition-colors">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="py-3 px-4 text-sm">{member.phone}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground text-opacity-80">{memberLastVisit.toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-warning">{daysInactive} days</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => sendWhatsAppNudge(member.id, member.name, member.phone)}
                        disabled={sendingTo === member.id}
                        className="bg-black hover:bg-black-hover text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                      >
                        <Send className="w-4 h-4" />
                        {sendingTo === member.id ? "Sending..." : "Send Nudge"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
