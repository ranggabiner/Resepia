'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)  // Accessing user from session
    }

    fetchUser()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome {user.email}</h1>
          <button onClick={handleLogout}>Logout</button>
          <Link href={`/profile/${user.id}`}>
            <button>Go to Profile</button>
          </Link>
        </div>
      ) : (
        <div>
          <h1>You are not logged in</h1>
          <Link href="/auth/login">
            <button>Login</button>
          </Link>
        </div>
      )}
      <div>
      <Link href="/recipes/create">
        <button>Post a New Recipe</button>
      </Link>
      </div>
    </div>
  )
}
