'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const Button = ({ onClick, children, style }: any) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 rounded-md ${style}`}
  >
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

  if (loading) return <div className="text-center text-gray-600">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!profile) return <div className="text-center text-gray-600">No Profile Found</div>

  const { first_name, last_name, dob, location } = profile
  const fullName = `${first_name} ${last_name}`

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-semibold mb-4">{fullName}'s Profile</h1>
      
      <p className="text-gray-700 mb-2"><strong>First Name:</strong> {first_name}</p>
      <p className="text-gray-700 mb-2"><strong>Last Name:</strong> {last_name}</p>
      <p className="text-gray-700 mb-2"><strong>Date of Birth:</strong> {dob || 'Not Provided'}</p>
      <p className="text-gray-700 mb-4"><strong>Location:</strong> {location || 'Not Provided'}</p>

      <div className="space-y-4 mt-6">
        <Link href={`/`}><Button style="bg-gray-500 text-white hover:bg-gray-600">Back to Home</Button></Link>
        <Link href={`/profile/${id}/edit`}><Button style="bg-blue-500 text-white hover:bg-blue-600">Edit Profile</Button></Link>
      </div>

      <div className="mt-8">
        {!confirmDelete ? (
          <Button onClick={() => setConfirmDelete(true)} style="bg-red-500 text-white hover:bg-red-600 w-full mt-4">
            Delete Account
          </Button>
        ) : (
          <div className="text-center mt-4">
            <h3 className="text-red-500 font-semibold">Are you sure you want to delete your account?</h3>
            <p className="text-gray-600">This action is permanent and cannot be undone.</p>
            <div className="mt-4 flex justify-center space-x-4">
              <Button onClick={handleDelete} style="bg-red-500 text-white hover:bg-red-600">Yes, Delete</Button>
              <Button onClick={() => setConfirmDelete(false)} style="bg-gray-500 text-white hover:bg-gray-600">Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
