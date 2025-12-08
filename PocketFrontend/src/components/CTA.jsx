import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <button className="btn primary" onClick={() => navigate('/library')}>My Library</button>
  )
}
