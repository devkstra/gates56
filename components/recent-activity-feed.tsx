"use client"

import { useSupabase } from "@/lib/supabase/provider"
import { User, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface RecentScan {
  id: string
  memberId: string
  timestamp: Date
  method: 'face' | 'qr'
  entryTime: Date
  exitTime?: Date
  member: {
    id: string
    name: string
    status: 'active' | 'inactive' | 'expired'
  } | null
}

export default function RecentActivityFeed() {
  const { attendance, members } = useSupabase()
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])

  useEffect(() => {
    if (attendance.length > 0 && members.length > 0) {
      // Get the last 5 unique members who scanned in
      const scans = attendance
        .slice(0, 5)
        .map((record) => {
          const member = members.find((m) => m.id === record.memberId)
          if (!member) return null;
          
          return {
            id: record.id,
            memberId: record.memberId,
            timestamp: record.timestamp,
            method: record.method,
            entryTime: record.entryTime,
            exitTime: record.exitTime,
            member: {
              id: member.id,
              name: member.name,
              status: member.status
            }
          } as RecentScan;
        })
        .filter((item): item is RecentScan => item !== null)
      
      setRecentScans(scans)
    }
  }, [attendance, members])

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/20 rounded-xl p-6 hover:border-border/40 transition-all duration-300 space-y-4">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Recent Activity
        </h2>
      </div>

      <div className="space-y-2">
        {recentScans.map((scan) => (
          <div
            key={scan.id}
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-card/50 to-background/30 hover:from-card/80 hover:to-background/60 rounded-lg border border-border/20 hover:border-border/40 transition-all duration-300"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{scan.member?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {scan.method === "face" ? "👤 Face Recognition" : "📱 QR Scan"} •{" "}
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">Check-in</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
