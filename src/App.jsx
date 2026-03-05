import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { generateLeague } from './lib/leagueGenerator'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/Dashboard'

const generateGuestCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'G-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function App() {
  const [session, setSession] = useState(null)
  const [guestProfile, setGuestProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const signupPromptTimer = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) await checkAndGenerateLeague(session.user.id)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setGuestProfile(null)
      setLoading(false)
    })
  }, [])

  // Hourly signup prompt for guests
  useEffect(() => {
    if (guestProfile) {
      signupPromptTimer.current = setInterval(() => {
        setShowSignupPrompt(true)
      }, 60 * 60 * 1000) // every hour
    }
    return () => clearInterval(signupPromptTimer.current)
  }, [guestProfile])

  const checkAndGenerateLeague = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('league_generated')
      .eq('id', userId)
      .single()
    if (profile && !profile.league_generated) {
      await generateLeague(userId)
      await supabase.from('profiles').update({ league_generated: true }).eq('id', userId)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    const guestCode = generateGuestCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        username: guestCode,
        guest_code: guestCode,
        is_guest: true,
        rebirth_points: 10000,
        lifetime_earnings: 0,
        expires_at: expiresAt,
        league_generated: false
      })
      .select()
      .single()

    if (error) { console.error('Guest error:', error); setLoading(false); return }

    await generateLeague(profile.id)
    await supabase.from('profiles').update({ league_generated: true }).eq('id', profile.id)

    setGuestProfile(profile)
    setLoading(false)

    // Delete on browser/tab close
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/delete_guest`,
        JSON.stringify({ guest_profile_id: profile.id })
      )
    })
  }

  const handleResumeGuest = async (code) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_guest_by_code', { code: code.toUpperCase() })
    if (error || !data || data.length === 0) {
      setLoading(false)
      return { error: 'Guest code not found or expired' }
    }
    const profile = data[0]
    const { data: fullProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()

    setGuestProfile(fullProfile)
    setLoading(false)

    // Reset 24hr timer on resume
    await supabase
      .from('profiles')
      .update({ expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
      .eq('id', profile.id)

    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/delete_guest`,
        JSON.stringify({ guest_profile_id: profile.id })
      )
    })

    return { success: true }
  }

  const handleGuestSignup = async (transferProgress, newSession) => {
    clearInterval(signupPromptTimer.current)
    if (transferProgress && guestProfile && newSession) {
      await supabase.from('fighters').update({ owner_id: newSession.user.id }).eq('owner_id', guestProfile.id)
      const { data: gp } = await supabase.from('profiles').select('rebirth_points').eq('id', guestProfile.id).single()
      if (gp) await supabase.from('profiles').update({ rebirth_points: gp.rebirth_points }).eq('id', newSession.user.id)
      await supabase.from('profiles').delete().eq('id', guestProfile.id)
    } else if (guestProfile) {
      await supabase.from('fighters').delete().eq('owner_id', guestProfile.id)
      await supabase.from('profiles').delete().eq('id', guestProfile.id)
    }
    setGuestProfile(null)
  }

  if (loading) return <p>Loading UMA...</p>

  if (session) return <Dashboard session={session} />

  if (guestProfile) return (
    <>
      {showSignupPrompt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center' }}>
            <h2>⚠️ Save Your Progress!</h2>
            <p>You're playing as a guest. Your data will be deleted when you close the browser.</p>
            <p>Your guest code: <strong style={{ fontSize: '24px', letterSpacing: '2px' }}>{guestProfile.guest_code}</strong></p>
            <p style={{ fontSize: '12px', color: '#666' }}>Copy this code to resume your session within 24hrs</p>
            <button onClick={() => navigator.clipboard.writeText(guestProfile.guest_code)}>📋 Copy Code</button>
            <br /><br />
            <button onClick={() => setShowSignupPrompt(false)}>Continue as Guest</button>
            <button onClick={() => { setShowSignupPrompt(false) }}>Sign Up to Save →</button>
          </div>
        </div>
      )}
      <Dashboard
        session={{ user: { id: guestProfile.id } }}
        isGuest={true}
        guestProfile={guestProfile}
        onSignup={handleGuestSignup}
      />
    </>
  )

  return <AuthForm onGuest={handleGuest} onResumeGuest={handleResumeGuest} />
}

export default App