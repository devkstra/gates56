"use client"

import { Lock, Unlock } from "lucide-react"

interface GateControlProps {
  gateStatus: "open" | "closed"
  onGateControl: (action: "open" | "close") => void
}

export default function GateControl({ gateStatus, onGateControl }: GateControlProps) {
  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/20 rounded-xl p-6 space-y-6 hover:border-border/40 transition-all duration-300">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Gate Control Panel
        </h2>
      </div>

      <div className="bg-gradient-to-br from-card/50 to-background/50 rounded-xl p-6 border border-border/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Current Status</p>
            <div className="flex items-center gap-3 mt-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${gateStatus === "open" ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <p className="text-lg font-bold capitalize">{gateStatus}</p>
            </div>
          </div>
          <div
            className={`p-4 rounded-xl ${gateStatus === "open" ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-red-500/20 border border-red-500/40"}`}
          >
            {gateStatus === "open" ? (
              <Unlock className={`w-8 h-8 ${gateStatus === "open" ? "text-emerald-500" : "text-red-500"}`} />
            ) : (
              <Lock className={`w-8 h-8 ${gateStatus === "open" ? "text-emerald-500" : "text-red-500"}`} />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onGateControl("open")}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
        >
          <Unlock className="w-5 h-5 inline mr-2" />
          Force Open
        </button>
        <button
          onClick={() => onGateControl("close")}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
        >
          <Lock className="w-5 h-5 inline mr-2" />
          Force Close
        </button>
      </div>
    </div>
  )
}
