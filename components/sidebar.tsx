"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Camera, UserPlus, BarChart3, MessageSquare, Dumbbell, LogOut } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-access", label: "Live Access", icon: Camera },
  { href: "/registration", label: "Registration", icon: UserPlus },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/engagement", label: "Engagement", icon: MessageSquare },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside 
      className={`w-64 bg-gradient-to-b from-card to-background border-r border-border/30 flex flex-col fixed h-screen z-50 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="p-6 border-b border-border/20 flex items-center gap-3 bg-card/50 backdrop-blur-sm">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
          <Dumbbell className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">
            Gates56
          </h1>
          <p className="text-xs text-muted-foreground text-opacity-80">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold border border-primary/40 shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/20 space-y-3">
        <button className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
        <p className="text-xs text-muted text-center">© 2025 GymGuard</p>
      </div>
    </aside>
  )
}
