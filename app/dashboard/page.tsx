"use client"

import { useSupabase } from "@/lib/supabase/provider"
import { toast } from "sonner"
import { Users, DollarSign, TrendingUp } from "lucide-react"
import StatsCard from "@/components/stats-card"
import GateControl from "@/components/gate-control"
import RecentActivityFeed from "@/components/recent-activity-feed"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { members, attendance, gateStatus, setGateStatus } = useSupabase()
  const [todayAttendance, setTodayAttendance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate today's attendance
  useEffect(() => {
    if (attendance.length > 0) {
      const today = new Date().toDateString()
      const todayRecords = attendance.filter(a => {
        return new Date(a.timestamp).toDateString() === today
      })
      setTodayAttendance(todayRecords.length)
    }
  }, [attendance])

  const totalMembers = members.filter((m) => m.status === "active").length
  const monthlyRevenue = members.filter((m) => m.status === "active").length * 49 // Avg $49/month

  const handleGateControl = async (action: "open" | "closed") => {
    try {
      await setGateStatus(action)
      toast.success(`Gate ${action === "open" ? "Opened" : "Closed"}!`)
    } catch (error) {
      console.error('Error controlling gate:', error)
      toast.error('Failed to control gate')
    }
  }

  return (
    <div className="px-4 md:px-6 pt-4 space-y-6 bg-background">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back to GymGuard Control Center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard icon={Users} label="Total Active Members" value={totalMembers} trend="+2.5% from last month" />
        <StatsCard icon={TrendingUp} label="Today's Attendance" value={todayAttendance} trend="Real-time count" />
        <StatsCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${monthlyRevenue}`}
          trend="Estimated from active members"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GateControl gateStatus={gateStatus} onGateControl={handleGateControl} />
        </div>
        <div>
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  )
}
