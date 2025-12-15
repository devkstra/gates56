"use client"

import { useState, type ReactNode } from "react"
import Sidebar from "@/components/sidebar"
import Topbar from "@/components/topbar"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/react"

export const geist = Geist({ subsets: ["latin"] })
export const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function ClientLayout({
  children,
  geistClassName = "",
}: Readonly<{
  children: ReactNode
  geistClassName?: string
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex min-h-screen bg-background text-foreground ${geistClassName}`.trim()}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64 w-full lg:w-[calc(100%-16rem)] transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" theme="dark" />
      <Analytics />
    </div>
  )
}
