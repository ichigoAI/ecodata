'use client'

import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

const SupabaseContext = createContext<ReturnType<typeof createClient> | undefined>(undefined)

export function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const supabase = createClient()
  const router = useRouter()
  
  // Rafraîchit les données serveur quand la session change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== session?.access_token) {
        router.refresh()
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])
  
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase doit être utilisé dans SupabaseProvider')
  }
  return context
}