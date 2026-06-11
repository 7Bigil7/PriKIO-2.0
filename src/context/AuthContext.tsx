'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  full_name: string | null
  student_id: string | null
  department: string | null
  year: number | null
  wallet_balance: number
  role: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Mock user for testing
    const dummyUser = { id: 'test-user', email: 'test@example.com' } as User
    const dummyProfile: Profile = {
      id: 'test-user',
      full_name: 'Test Student',
      student_id: 'PU123456',
      department: 'Computer Science',
      year: 3,
      wallet_balance: 500,
      role: 'student'
    }
    
    setUser(dummyUser)
    setProfile(dummyProfile)
    setLoading(false)
  }, [supabase])

  const signIn = async () => {
    // Dummy sign in
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
