'use client'

import { Auth0Provider } from '@auth0/nextjs-auth0/client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Profile } from '@/types/database.types'

interface AuthContextType {
    profile: Profile | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    profile: null,
    isLoading: true,
    error: null,
    refetch: async () => { },
})

export function useAuth() {
    return useContext(AuthContext)
}

interface AuthProviderProps {
    children: ReactNode
}

function AuthContextProvider({ children }: AuthProviderProps) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Sync user on component mount (ensures profile exists)
            const response = await fetch('/api/auth/sync', {
                method: 'POST',
            })

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated, this is fine
                    setProfile(null)
                    return
                }
                throw new Error('Failed to sync profile')
            }

            const data = await response.json()

            if (data.success && data.profile) {
                // Fetch full profile data
                const profileResponse = await fetch('/api/user/profile')
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json()
                    setProfile(profileData.profile)
                }
            }
        } catch (err) {
            console.error('Auth context error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                profile,
                isLoading,
                error,
                refetch: fetchProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Combined Auth Provider that wraps Auth0's Auth0Provider (v4)
 * and our custom AuthContext for Supabase profile data
 */
export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <Auth0Provider>
            <AuthContextProvider>{children}</AuthContextProvider>
        </Auth0Provider>
    )
}
