"use client"

import { useGym } from "@/lib/context"
import AttendanceChart from "@/components/attendance-chart"
import PeakHoursChart from "@/components/peak-hours-chart"
import MembershipDistribution from "@/components/membership-distribution"
import AnalyticsCard from "@/components/analytics-card"

export default function AnalyticsPage() {
  const { members, attendance } = useGym()

  const activeMembers = members.filter((m) => m.status === "active").length
  const expiredMembers = members.filter((m) => m.status === "expired").length
  const avgAttendancePerDay = Math.round(attendance.length / 7)
  const totalAttendance = attendance.length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-opacity-80 mt-1">Gym performance and member statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
        <AnalyticsCard label="Active Members" value={activeMembers} change="+5% this month" />
        <AnalyticsCard label="Expired Plans" value={expiredMembers} change="Action required" />
        <AnalyticsCard label="Total Attendance" value={totalAttendance} change="Last 7 days" />
        <AnalyticsCard label="Avg Daily Visits" value={avgAttendancePerDay} change="Per day average" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart attendance={attendance} />
        <PeakHoursChart attendance={attendance} />
      </div>

      <div className="w-full">
        <MembershipDistribution members={members} />
      </div>
    </div>
  )
}
