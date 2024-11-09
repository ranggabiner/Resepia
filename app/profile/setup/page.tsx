'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch the session and user info
    const fetchUserData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        setError('Could not fetch user data.')
        return
      }

      const user = session.user
      const displayName = user.user_metadata?.full_name || ''
      const [first, last] = displayName.split(' ')
      setFirstName(first || '')
      setLastName(last || '')
      setUsername(`@resepia_${Math.floor(Math.random() * 10000)}`) // Generate username
    }

    fetchUserData()
  }, [])

  // Handle form submission to save the profile data
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const user = session?.user

    if (sessionError || !user) {
      setError('User not found')
      setLoading(false)
      return
    }

    // Insert or update profile in the "profiles" table
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      username: username,
      dob: dob || null,         // Store DOB if provided
      location: location || null // Store location if provided
    })

    if (profileError) {
      setError(profileError.message)
    } else {
      router.push('/') // Redirect to the home page after profile is saved
    }

    setLoading(false)
  }

  return (
    <div>
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleProfileSubmit}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving Profile...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
