import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function Header() {
  const { auth, logout } = React.useContext(AuthContext)
  const navigate = useNavigate()

  const handleRight = () => {
    if (auth && auth.isAuthenticated) navigate('/')
    else navigate('/login')
  }

  const handleLogoClick = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-header-bleed">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <div className="logo" aria-hidden>📚</div>
            <div className="title">pocketlibrary</div>
          </div>

          <div className="actions">
            <button className="right-btn" onClick={handleRight}>
              {auth && auth.isAuthenticated ? '📖 My Library' : '🔐 Login'}
            </button>
            {auth && auth.isAuthenticated && (
              <button
                className="logout"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                👋 Logout
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
