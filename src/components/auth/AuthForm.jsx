import { useState } from 'react'
import { supabase } from '../../lib/supabase'

function AuthForm({ onGuest, onResumeGuest }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resumeCode, setResumeCode] = useState('')
  const [resumeError, setResumeError] = useState(null)
  const [resumeLoading, setResumeLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setError(null)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleResume = async () => {
    if (!resumeCode.trim()) return
    setResumeLoading(true)
    setResumeError(null)
    const result = await onResumeGuest(resumeCode.trim())
    if (result?.error) setResumeError(result.error)
    setResumeLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '32px' }}>
      <h1>🥊 UMA League Simulator</h1>

      <div>
        <button onClick={() => setIsSignUp(false)} style={{ fontWeight: !isSignUp ? 'bold' : 'normal' }}>Sign In</button>
        <button onClick={() => setIsSignUp(true)} style={{ fontWeight: isSignUp ? 'bold' : 'normal' }}>Sign Up</button>
      </div>

      <div style={{ marginTop: '16px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '8px', padding: '8px' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleAuth} disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </div>

      <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
        <button onClick={onGuest} style={{ width: '100%', padding: '10px' }}>
          👤 Play as Guest
        </button>
      </div>

      <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
        <p style={{ fontSize: '13px', color: '#666' }}>Have a guest code? Resume your session:</p>
        <input
          type="text"
          placeholder="G-XXXXXX"
          value={resumeCode}
          onChange={e => setResumeCode(e.target.value.toUpperCase())}
          maxLength={8}
          style={{ padding: '8px', letterSpacing: '2px', textTransform: 'uppercase', marginRight: '8px' }}
        />
        <button onClick={handleResume} disabled={resumeLoading}>
          {resumeLoading ? 'Loading...' : 'Resume'}
        </button>
        {resumeError && <p style={{ color: 'red' }}>{resumeError}</p>}
      </div>
    </div>
  )
}

export default AuthForm