import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { generateLeague } from './lib/leagueGenerator'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/Dashboard'

const GUEST_INITIAL_STATE = {
  rebirth_points: 10000,
  lifetime_earnings: 0,
  username: 'Guest',
  fighters: []
}

function App() {
  const [session, setSession] = useState(null)
  const [guestMode, setGuestMode] = useState(false)
  const [guestData, setGuestData] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      // Generate league for new users
      if (_event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('league_generated')
          .eq('id', session.user.id)
          .single()

        if (profile && !profile.league_generated) {
          console.log('Generating league for new user...')
          await generateLeague(session.user.id)
          await supabase
            .from('profiles')
            .update({ league_generated: true })
            .eq('id', session.user.id)
        }
      }
    })
  }, [])

  const handleGuest = () => {
    setGuestData(GUEST_INITIAL_STATE)
    setGuestMode(true)
  }

  const handleGuestSignup = (transferProgress) => {
    if (!transferProgress) setGuestData(null)
    setGuestMode(false)
  }

  if (session) return <Dashboard session={session} />

  if (guestMode) return (
    <Dashboard
      isGuest={true}
      guestData={guestData}
      setGuestData={setGuestData}
      onSignup={handleGuestSignup}
    />
  )

  return <AuthForm onGuest={handleGuest} />
}

export default App