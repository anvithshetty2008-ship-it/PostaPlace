'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getVerifiedPlacesPage } from '../../firebase'

export default function Explore() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { places: firstPage, lastDoc: cursor } = await getVerifiedPlacesPage(20, null)
        if (!mounted) return
        setPlaces(firstPage)
        setLastDoc(cursor)
        setHasMore(firstPage.length === 20 && !!cursor)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const { places: nextPage, lastDoc: cursor } = await getVerifiedPlacesPage(20, lastDoc)
      setPlaces((prev) => [...prev, ...nextPage])
      setLastDoc(cursor)
      setHasMore(nextPage.length === 20 && !!cursor)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: '800px 0px', threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, lastDoc, loadingMore])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading places...</div>
  }

  if (!places.length) {
    return (
      <div className="empty-state">
        <h3>No verified places yet</h3>
        <p style={{ marginTop: '10px' }}>
          Be the first to <Link href="/submit">submit a place</Link>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Explore Places</h2>
      <div className="places-grid">
        {places.map((p) => (
          <Link key={p.id} href={`/place/${p.id}`} className="place-card">
            {p.photo ? <img src={p.photo} alt={p.place_name || 'Place'} /> : <img alt="" />}
            <div className="place-card-content">
              <h3>{p.place_name || 'Untitled place'}</h3>
              <div className="place-card-meta">
                {(p.state || 'Unknown state') + (p.district ? ` • ${p.district}` : '')}
              </div>
              <p>{p.description || 'No description provided.'}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
        {hasMore ? <div style={{ color: '#999' }}>{loadingMore ? 'Loading...' : 'Scroll to load more'}</div> : null}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={loadMoreRef} style={{ height: '1px' }} />

      {!hasMore ? <div style={{ textAlign: 'center', color: '#999', marginTop: '15px' }}>You’ve reached the end.</div> : null}
    </div>
  )
}

