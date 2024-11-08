'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // After login, check if the user has a profile
      await checkUserProfile()
    }

    setLoading(false)
  }

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', // Update redirect URL if needed
      },
    })

    if (error) {
      setError(error.message)
    } else {
      await checkUserProfile() // Check user profile after login
    }

    setLoading(false)
  }

  // Check if user has a profile; if not, redirect to setup
  const checkUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        // If profile exists, go to the home page
        router.push('/')
      } else {
        // If profile doesn't exist, redirect to profile setup
        router.push('/profile/setup')
      }
    }
  }

  return (
    <div>
      <h1>Login to Your Account</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? 'Logging in with Google...' : 'Login with Google'}
      </button>

      <p>
        Don't have an account? <a href="/auth/register">Sign up</a>
      </p>
    </div>
  )
}
