"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { AttendanceRecord } from "@/lib/mock-data"

interface AttendanceChartProps {
  attendance: AttendanceRecord[]
}

export default function AttendanceChart({ attendance }: AttendanceChartProps) {
  // Generate data for the last 7 days
  const data = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

    const count = attendance.filter((a) => {
      const attendDate = new Date(a.timestamp)
      return attendDate.toDateString() === date.toDateString()
    }).length

    data.push({ date: dateStr, visits: count })
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-lg font-bold mb-4">Attendance Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            labelStyle={{ color: "#f5f5f5" }}
          />
          <Bar dataKey="visits" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
