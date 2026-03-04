import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchFighters()
  }, [])

 const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    console.log('Profile data:', data)
    console.log('Profile error:', error)

    if (data) setProfile(data)
  }

  const fetchFighters = async () => {
    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('owner_id', session.user.id)

    if (data) setFighters(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>

      <h1>UMA Dashboard</h1>

      {profile && (
        <div>
          <h2>👋 {profile.username || session.user.email}</h2>
          <p>💰 RB Balance: {profile.rebirth_points}</p>
          <p>📈 Lifetime Earnings: {profile.lifetime_earnings}</p>
        </div>
      )}

      <h2>🥊 Your Fighters</h2>
      {fighters.length === 0 ? (
        <p>No fighters yet — create or buy one to get started!</p>
      ) : (
        fighters.map(f => (
          <div key={f.id}>
            <h3>{f.name}</h3>
            <p>Record: {f.wins}-{f.losses}</p>
            <p>Weight Class: {f.weight_class}</p>
            <p>Value: {f.value} RBs</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Dashboard