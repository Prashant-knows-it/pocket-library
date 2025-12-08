import React from 'react'
import CTA from './CTA'
import BookIllustration from './BookIllustration'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Your personal AI-powered library</h1>
        <p className="hero-sub">Read anywhere, get smart recommendations, and discover your next favorite book through personalized AI insights.</p>
        <CTA />
      </div>

      <aside className="hero-visual">
        <BookIllustration />
      </aside>
    </section>
  )
}
