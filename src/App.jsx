import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/auth/AuthForm'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL)

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
        <Dashboard session={session} />
      ) : (
        <AuthForm />
      )}
    </div>
  )
}

export default App