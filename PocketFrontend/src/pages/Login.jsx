import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../App'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.login({ email, password })
      if (res && res.token) {
        // store token via context so Header updates
        login({ token: res.token, user: res.username || res.displayName || email })
        navigate('/library')
      } else {
        setError(res.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'Network error')
    }
  }

  return (
    <div className="form-card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Login</button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}
