"use client"

import { User, Bell, Settings, Menu } from "lucide-react"
import { useSupabase } from "@/lib/supabase/provider"

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { gateStatus } = useSupabase()

  return (
    <header className="h-16 lg:h-20 bg-gradient-to-r from-card/80 to-background/50 backdrop-blur-xl border-b border-border/20 flex items-center justify-between px-4 lg:px-8 fixed w-full top-0 right-0 lg:left-64 z-30">
      <button 
        onClick={onMenuClick} 
        className="lg:hidden p-2 -ml-1 rounded-md hover:bg-card/50 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card/40 border border-border/20">
          <div
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${gateStatus === "open" ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <span className="text-sm font-medium">
            Gate: <span className="capitalize font-bold">{gateStatus}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-muted-foreground">
          System Status: <span className="text-emerald-500 font-semibold">Online</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-card/50 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-card/50 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border/20">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Admin User</p>
            <p className="text-xs text-muted-foreground">Reception PC</p>
          </div>
        </div>
      </div>
    </header>
  )
}
