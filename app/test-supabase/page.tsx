// app/test-supabase/page.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  useEffect(() => {
    const testConnection = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('members').select('*').limit(1)
      console.log('Test connection:', { data, error })
    }
    testConnection()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Supabase Test</h1>
      <p>Check browser console for connection test results</p>
    </div>
  )
}