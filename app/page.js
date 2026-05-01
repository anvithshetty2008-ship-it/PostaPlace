'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-section">
      <h2>Discover Hidden Travel Gems</h2>
      <p>Share and explore the most amazing hidden travel places across India. From secret waterfalls to quiet beaches, help others find their next adventure.</p>
      <div className="button-group">
        <Link href="/submit" className="btn btn-primary">
          Submit a Place
        </Link>
        <Link href="/explore" className="btn btn-secondary">
          Explore Places
        </Link>
      </div>
    </div>
  )
}