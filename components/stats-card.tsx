import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: string
}

export default function StatsCard({ icon: Icon, label, value, trend }: StatsCardProps) {
  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/20 rounded-xl p-6 hover:border-border/40 hover:bg-card/60 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <h3 className="text-4xl font-bold mt-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {value}
          </h3>
          {trend && <p className="text-xs text-muted-foreground mt-3">{trend}</p>}
        </div>
        <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
