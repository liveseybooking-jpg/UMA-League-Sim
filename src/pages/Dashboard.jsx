import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FighterCreator from './FighterCreator'

function Dashboard({ session, isGuest, guestData, setGuestData, onSignup }) {
  const [profile, setProfile] = useState(null)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [showTransferPrompt, setShowTransferPrompt] = useState(false)

  useEffect(() => {
    if (isGuest) {
      setProfile(guestData)
      setFighters(guestData.fighters || [])
      setLoading(false)
    } else {
      fetchProfile()
      fetchFighters()
    }
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) setProfile(data)
  }

  const fetchFighters = async () => {
    const { data } = await supabase
      .from('fighters')
      .select('*')
      .eq('owner_id', session.user.id)
    if (data) setFighters(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleGuestFighterCreate = (fighter) => {
    const newFighters = [...fighters, fighter]
    setFighters(newFighters)
    setGuestData({
      ...guestData,
      fighters: newFighters,
      rebirth_points: guestData.rebirth_points - fighter.cost
    })
    setShowCreator(false)
  }

  if (loading) return <p>Loading...</p>

  if (showCreator) return (
    <FighterCreator
      session={session}
      isGuest={isGuest}
      guestData={guestData}
      onGuestCreate={handleGuestFighterCreate}
      onBack={() => {
        setShowCreator(false)
        if (!isGuest) { fetchFighters(); fetchProfile() }
      }}
    />
  )

  return (
    <div>
      {isGuest && (
        <div style={{ background: 'orange', padding: '10px' }}>
          Playing as Guest — progress will be lost when you close the tab!
          <button onClick={() => setShowTransferPrompt(true)}>Sign Up to Save</button>
        </div>
      )}

      {!isGuest && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}

      {showTransferPrompt && (
        <div style={{ background: '#eee', padding: '20px' }}>
          <h3>You have guest progress!</h3>
          <p>Would you like to transfer your fighters and RBs to your new account?</p>
          <button onClick={() => onSignup(true)}>Yes, transfer progress</button>
          <button onClick={() => onSignup(false)}>No, start fresh</button>
        </div>
      )}

      <h1>UMA Dashboard</h1>

      {profile && (
        <div>
          <h2>👋 {isGuest ? 'Guest' : (profile.username || session.user.email)}</h2>
          <p>💰 RB Balance: {isGuest ? guestData.rebirth_points : profile.rebirth_points}</p>
          <p>📈 Lifetime Earnings: {profile.lifetime_earnings || 0}</p>
        </div>
      )}

      <h2>🥊 Your Fighters</h2>
      <button onClick={() => setShowCreator(true)}>+ Create Fighter</button>
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
            <p>Value: {f.value} RBs</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Dashboard