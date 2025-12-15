"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { AttendanceRecord } from "@/lib/mock-data"

interface PeakHoursChartProps {
  attendance: AttendanceRecord[]
}

export default function PeakHoursChart({ attendance }: PeakHoursChartProps) {
  // Generate hourly data
  const hourlyData: Record<number, number> = {}

  for (let i = 0; i < 24; i++) {
    hourlyData[i] = 0
  }

  attendance.forEach((record) => {
    const hour = new Date(record.timestamp).getHours()
    hourlyData[hour] = (hourlyData[hour] || 0) + 1
  })

  const data = Object.entries(hourlyData)
    .map(([hour, count]) => ({
      time: `${Number.parseInt(hour)}:00`,
      visits: count,
    }))
    .filter((_, i) => i % 2 === 0) // Show every other hour for readability

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-lg font-bold mb-4">Peak Hours Analysis</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            labelStyle={{ color: "#f5f5f5" }}
          />
          <Line type="monotone" dataKey="visits" stroke="#3b82f6" dot={{ fill: "#3b82f6" }} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
