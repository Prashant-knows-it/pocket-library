import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../App'

export default function Signup() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.register({ displayName, email, password })
      if (res && res.token) {
        // auto-login after signup
        login({ token: res.token, user: res.displayName || email })
        navigate('/library')
      } else {
        setError(res.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.message || 'Network error')
    }
  }

  return (
    <div className="form-card">
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <label>
          Display name
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Signup</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}
