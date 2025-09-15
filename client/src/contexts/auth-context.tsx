import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', session ? 'Found session' : 'No session');
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Session active' : 'No session');
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getBaseURL = () => {
    // Use the current origin for all environments
    return window.location.origin
  }

  const signInWithGoogle = async () => {
    const baseURL = getBaseURL()
    const redirectURL = `${baseURL}/auth/callback`
    
    console.log('🔗 Redirect URL being used:', redirectURL);
    console.log('🌐 Base URL:', baseURL);
    console.log('🔑 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🆔 Current domain:', window.location.hostname);
    console.log('🌍 Full current URL:', window.location.href);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectURL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      console.error('❌ OAuth error:', error)
      throw error
    } else {
      console.log('✅ OAuth request sent successfully')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}