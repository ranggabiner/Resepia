'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Fetch the current session and user data
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('Session error:', error)
        return
      }

      const user = session.user
      const email = user.email
      const fullName = user.user_metadata?.full_name || ''
      const [firstName, lastName] = fullName.split(' ')

      // Check if profile already exists
      const { data: profileExists, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // Handle other errors
        console.error('Error checking profile:', profileError)
        return
      }

      // Generate a unique username if profile does not exist
      if (!profileExists) {
        const uniqueUsername = `@resepia_${Math.floor(Math.random() * 10000)}`

        // Insert new profile with default values and generated username
        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: user.id,
          first_name: firstName || '',  // Set to empty string if not provided
          last_name: lastName || '',     // Set to empty string if not provided
          username: uniqueUsername,
          dob: null,                     // Default to null
          location: null                 // Default to null
        })

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }
      }

      // Redirect the user to the home page after successful profile creation
      router.push('/')
    }

    handleAuth()
  }, [router])

  return <div>Loading...</div>
}
