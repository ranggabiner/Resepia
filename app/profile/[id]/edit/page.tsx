'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import { useParams } from 'next/navigation'

const EditProfilePage = () => {
  const router = useRouter()
  const { id } = useParams()
  
  // Initialize profileData with default empty string values
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    dob: '',
    location: ''
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const currentUser = sessionData?.session?.user

    if (!currentUser || currentUser.id !== id) return setError('Unauthorized access')

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    if (profileError || !profileData) return setError('Profile not found')
    // Make sure all fields are set to a default value if not present in the database
    setProfileData({
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      username: profileData.username || '',
      dob: profileData.dob || '',
      location: profileData.location || '',
    })
  }

  useEffect(() => { fetchProfile() }, [id])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error: updateError } = await supabase.from('profiles').update({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      username: profileData.username,
      dob: profileData.dob,
      location: profileData.location,
    }).eq('user_id', id)

    if (updateError) setError(updateError.message)
    else router.push(`/profile/${id}`)

    setLoading(false)
  }

  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h1>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        {['firstName', 'lastName', 'username', 'dob', 'location'].map(field => (
          <div key={field} className="flex flex-col">
            <label className="text-sm font-medium mb-2 text-gray-700">{field}</label>
            <input
              type={field === 'dob' ? 'date' : 'text'}
              value={profileData[field as keyof typeof profileData] || ''}
              onChange={e => setProfileData({ ...profileData, [field]: e.target.value })}
              required
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfilePage
