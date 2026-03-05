import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FighterCreator from './FighterCreator'
import Roster from './Roster'
import Card from './Card'
import { generateLeague } from '../lib/leagueGenerator'

function Dashboard({ session, isGuest, guestProfile, onSignup }) {
  const [profile, setProfile] = useState(null)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [showRoster, setShowRoster] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [showTransferPrompt, setShowTransferPrompt] = useState(false)

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
    console.log('Profile:', data, 'Error:', error)
    if (data) setProfile(data)
  }

  const fetchFighters = async () => {
    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('owner_id', session.user.id)
      .eq('is_ai', false)
    console.log('Fighters:', data, 'Error:', error)
    if (data) setFighters(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleGenerateLeague = async () => {
    console.log('Generating league...')
    await generateLeague(session.user.id)
    console.log('Done!')
    const viewNow = window.confirm('✅ League Created! View now?')
    if (viewNow) setShowRoster(true)
  }

  if (loading) return <p>Loading...</p>

  if (showCreator) return (
    <FighterCreator
      session={session}
      isGuest={isGuest}
      onBack={() => {
        setShowCreator(false)
        fetchFighters()
        fetchProfile()
      }}
    />
  )

  if (showRoster) return (
    <Roster session={session} onBack={() => setShowRoster(false)} />
  )

  if (showCard) return (
    <Card session={session} onBack={() => setShowCard(false)} />
  )

  return (
    <div>
      {isGuest && (
        <div style={{ background: 'orange', padding: '10px' }}>
          ⚠️ Guest Mode — data deletes when you close the browser!
          Your code: <strong style={{ letterSpacing: '2px' }}>{guestProfile?.guest_code}</strong>
          <button onClick={() => navigator.clipboard.writeText(guestProfile?.guest_code)}>📋 Copy</button>
          <button onClick={() => setShowTransferPrompt(true)}>Sign Up to Save</button>
        </div>
      )}

      {!isGuest && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}

      {showTransferPrompt && (
        <div style={{ background: '#eee', padding: '20px' }}>
          <h3>Save your progress!</h3>
          <p>Would you like to transfer your fighters and RBs to your new account?</p>
          <button onClick={() => onSignup(true)}>Yes, transfer progress</button>
          <button onClick={() => onSignup(false)}>No, start fresh</button>
        </div>
      )}

      <h1>UMA Dashboard</h1>

      {profile && (
        <div>
          <h2>👋 {isGuest ? guestProfile?.guest_code : (profile.username || session.user.email)}</h2>
          <p>💰 RB Balance: {profile.rebirth_points} RBs</p>
          <p>📈 Lifetime Earnings: {profile.lifetime_earnings || 0}</p>
        </div>
      )}

      <div>
        <button onClick={() => setShowCreator(true)}>+ Create Fighter</button>
        <button onClick={() => setShowRoster(true)}>📋 View League</button>
        <button onClick={() => setShowCard(true)}>🥊 Fight Card</button>
        <button onClick={handleGenerateLeague}>🌍 Generate League</button>
      </div>

      <h2>🥊 Your Fighters</h2>
      {fighters.length === 0 ? (
        <p>No fighters yet — create or buy one to get started!</p>
      ) : (
        fighters.map((f, i) => (
          <div key={f.id || i}>
            <h3>{f.name}</h3>
            <p>Record: {f.wins || 0}-{f.losses || 0}</p>
            <p>Weight Class: {f.weight_class}</p>
            <p>Potential: {f.potential}</p>
            <p>Division: {f.gender === 'women' ? "Women's" : "Men's"}</p>
            <p>OVR: {f.overall} | Value: {f.value} RBs</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Dashboard