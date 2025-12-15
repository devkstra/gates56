"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Member } from "@/lib/mock-data"

interface MembershipDistributionProps {
  members: Member[]
}

export default function MembershipDistribution({ members }: MembershipDistributionProps) {
  const data = [
    { name: "Active", value: members.filter((m) => m.status === "active").length, color: "#10b981" },
    { name: "Expired", value: members.filter((m) => m.status === "expired").length, color: "#ef4444" },
    { name: "Inactive", value: members.filter((m) => m.status === "inactive").length, color: "#6b7280" },
  ]

  const activeData = data.filter((d) => d.value > 0)

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-lg font-bold mb-4">Membership Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            labelStyle={{ color: "#f5f5f5" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
