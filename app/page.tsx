'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    fetchUser()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {user ? (
        <div className="text-center bg-white shadow-md rounded-lg p-8 w-fit">
          <h1 className="text-2xl font-semibold mb-4">Welcome, {user.email}</h1>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-red-600"
          >
            Logout
          </button>
          <Link href={`/profile/${user.id}`}>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600">
              Go to Profile
            </button>
          </Link>
        </div>
      ) : (
        <div className="text-center bg-white shadow-md rounded-lg p-8 w-80">
          <h1 className="text-xl font-semibold mb-4">You are not logged in</h1>
          <Link href="/auth/login">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              Login
            </button>
          </Link>
        </div>
      )}
      <div className="flex flex-col items-center space-y-4 mt-8">
        <Link href="/recipes/create">
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg w-64 hover:bg-green-600">
            Post a New Recipe
          </button>
        </Link>
        <Link href="/recipes/your-recipe">
          <button className="bg-yellow-500 text-white py-2 px-4 rounded-lg w-64 hover:bg-yellow-600">
            Your Recipes
          </button>
        </Link>
        <Link href="/recipes">
          <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg w-64 hover:bg-indigo-600">
            All Recipes
          </button>
        </Link>
      </div>
    </div>
  )
}
