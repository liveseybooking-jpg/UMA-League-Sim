import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/auth/AuthForm'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div>
      {session ? (
        <h1>Welcome to UMA, {session.user.email}</h1>
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App