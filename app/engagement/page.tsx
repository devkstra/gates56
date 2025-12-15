"use client"
import LowAttendanceTable from "@/components/low-attendance-table"
import DailyQuotesSettings from "@/components/daily-quotes-settings"

export default function EngagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement & WhatsApp Automation</h1>
        <p className="text-muted-foreground text-opacity-80 mt-1">Automated member communication and retention tools</p>
      </div>

      <div className="space-y-6">
        <LowAttendanceTable />
        <DailyQuotesSettings />
      </div>
    </div>
  )
}
