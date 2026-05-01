'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPlaceById } from '../../../firebase'

export default function PlaceDetail({ params }) {
  const placeId = params?.id
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = placeId ? await getPlaceById(placeId) : null
        if (mounted) setPlace(data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [placeId])

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>

  if (!place) {
    return (
      <div className="empty-state">
        <h3>Place not found</h3>
        <p style={{ marginTop: '10px' }}>
          Go back to <Link href="/explore">Explore</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="detail-view">
      {place.photo ? <img src={place.photo} alt={place.place_name || 'Place'} className="detail-image" /> : null}
      <div className="detail-content">
        <h2>{place.place_name || 'Untitled place'}</h2>
        <div className="detail-meta">
          <div>
            <strong>State</strong>
            <div>{place.state || '—'}</div>
          </div>
          <div>
            <strong>District</strong>
            <div>{place.district || '—'}</div>
          </div>
          <div>
            <strong>Category</strong>
            <div>{place.category || '—'}</div>
          </div>
          <div>
            <strong>Submitted by</strong>
            <div>{place.submitted_by_name || '—'}</div>
          </div>
        </div>
        <p style={{ color: '#555', lineHeight: 1.7 }}>{place.description || 'No description provided.'}</p>
        <div style={{ marginTop: '25px' }}>
          <Link href="/explore" className="btn btn-secondary">
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  )
}

