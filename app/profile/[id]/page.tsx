// File: /profile/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const Button = ({ onClick, children, style }: any) => (
  <button onClick={onClick} style={{ padding: '10px', cursor: 'pointer', ...style }}>
    {children}
  </button>
)

const ProfilePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      setLoading(true)

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single()

        if (profileError) throw new Error('Profile not found.')
        setProfile(profileData)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'An error occurred while fetching profile data.')
        } else {
          setError('An error occurred while fetching profile data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  const handleDelete = async () => {
    if (!confirmDelete) return setError('Please confirm the deletion.')

    try {
      const { error: logoutError } = await supabase.auth.signOut()
      if (logoutError) throw new Error('Error during logout.')

      // Menghapus profil dari tabel "profiles"
      await supabase.from('profiles').delete().eq('user_id', id)

      // Menghapus user dari autentikasi melalui API route
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profile.user_id })
      })      

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete account.')

      router.push('/')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred while deleting the profile.')
      } else {
        setError('An unexpected error occurred while deleting the profile.')
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!profile) return <div>No Profile Found</div>

  const { first_name, last_name, dob, location } = profile
  const fullName = `${first_name} ${last_name}`

  return (
    <div style={{ padding: '20px' }}>
      <h1>{fullName}'s Profile</h1>
      <p>First Name: {first_name}</p>
      <p>Last Name: {last_name}</p>
      <p>Date of Birth: {dob || 'Not Provided'}</p>
      <p>Location: {location || 'Not Provided'}</p>

      <div style={{ marginTop: '20px' }}>
        <Link href={`/`}><Button>Back to Home</Button></Link>
        <Link href={`/profile/${id}/edit`}><Button>Edit Profile</Button></Link>
      </div>

      <div style={{ marginTop: '30px' }}>
        {!confirmDelete ? (
          <Button onClick={() => setConfirmDelete(true)} style={{ backgroundColor: 'red', color: 'white' }}>
            Delete Account
          </Button>
        ) : (
          <div>
            <h3 style={{ color: 'red' }}>Are you sure you want to delete your account?</h3>
            <p>This action is permanent and cannot be undone.</p>
            <Button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white', marginRight: '10px' }}>
              Yes, Delete
            </Button>
            <Button onClick={() => setConfirmDelete(false)} style={{ backgroundColor: 'gray', color: 'white' }}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
