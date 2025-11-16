import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Header from './components/Header'
import Library from './pages/Library'
import ProtectedRoute from './components/ProtectedRoute'

// AuthContext provides auth state and simple login/logout helpers
export const AuthContext = React.createContext({
  auth: { token: null, user: null, isAuthenticated: false },
  login: () => {},
  logout: () => {}
})

export default function App() {
  const [auth, setAuth] = React.useState(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return { token, user, isAuthenticated: !!token }
  })

  const login = ({ token, user }) => {
    if (token) localStorage.setItem('token', token)
    if (user) localStorage.setItem('user', user)
    setAuth({ token, user, isAuthenticated: !!token })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null, isAuthenticated: false })
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <div className="app-root">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/library" 
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}
