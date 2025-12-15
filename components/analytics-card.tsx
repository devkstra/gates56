interface AnalyticsCardProps {
  label: string
  value: number
  change: string
}

export default function AnalyticsCard({ label, value, change }: AnalyticsCardProps) {
  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <p className="text-sm text-foreground/80">{label}</p>
      <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
      <p className="text-xs text-foreground/60 mt-2">{change}</p>
    </div>
  )
}
