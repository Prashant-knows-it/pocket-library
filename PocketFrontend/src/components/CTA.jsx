import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function CTA() {
  const navigate = useNavigate()
  const { auth } = React.useContext(AuthContext)

  return (
    <div className="hero-ctas">
      <button className="btn primary" onClick={() => navigate('/library')}>My Library</button>
      {/* <button className="btn ghost" onClick={() => navigate('/login')}>{auth && auth.isAuthenticated ? 'Open My Library' : 'Log in'}</button> */}
    </div>
  )
}
