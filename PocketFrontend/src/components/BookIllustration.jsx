import React from 'react'

export default function BookIllustration() {
  return (
    <div className="book-stack" aria-hidden>
      <div className="book b1" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🎯</div>
      <div className="book b2" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>✨</div>
      <div className="book b3" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📚</div>
    </div>
  )
}
