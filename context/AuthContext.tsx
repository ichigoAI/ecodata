'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserProfile = {
  id: string
  email: string
  full_name?: string
  phone?: string
  birth_date?: string
  profession?: string
  type?: "standard" | "premium"
  plan_id?: string | null
  created_at?: string
}

interface AuthContextProps {
  user: UserProfile | null
  jwt: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  jwt: null,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser?: UserProfile | null
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser || null)
  const [jwt, setJwt] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return null
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      type: data.type,
      plan_id: data.plan_id,
      created_at: data.created_at,
      phone: data.phone,
      birth_date: data.birth_date,
      profession: data.profession,
    }
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw error

    const token = data.session?.access_token || null
    const profile = await fetchUserProfile(data.user.id)
    setUser(profile)
    setJwt(token)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setJwt(null)
  }

  // Sync user & JWT à chaque changement d'état auth
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUser(profile)
        setJwt(session.access_token || null)
      } else {
        setUser(null)
        setJwt(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
