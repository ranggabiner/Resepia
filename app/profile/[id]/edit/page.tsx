'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import { useParams } from 'next/navigation'

const EditProfilePage = () => {
  const router = useRouter()
  const { id } = useParams()
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', username: '', dob: '', location: ''
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

  if (error) return <div>{error}</div>

  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleUpdateProfile}>
        {['firstName', 'lastName', 'username', 'dob', 'location'].map(field => (
          <div key={field}>
            <label>{field}</label>
            <input
              type={field === 'dob' ? 'date' : 'text'}
              value={profileData[field as keyof typeof profileData]}
              onChange={e => setProfileData({ ...profileData, [field]: e.target.value })}
              required
            />
          </div>
        ))}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditProfilePage
