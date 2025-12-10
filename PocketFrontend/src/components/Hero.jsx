import React from 'react'
import CTA from './CTA'
import BookIllustration from './BookIllustration'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Your personal AI-powered library ✨</h1>
        <p className="hero-sub">
          Read anywhere, get smart recommendations, chat with your books, and discover reading communities near you.
          Your next favorite book is just a click away.
        </p>
        <CTA />
      </div>

      <aside className="hero-visual">
        <BookIllustration />
      </aside>
    </section>
  )
}
