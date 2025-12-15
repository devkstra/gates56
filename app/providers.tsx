'use client';

import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { SupabaseProvider } from "@/lib/supabase/provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
      <Toaster position="top-right" />
      <Analytics />
    </SupabaseProvider>
  )
}
