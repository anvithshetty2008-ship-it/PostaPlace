'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getVerifiedPlacesPage } from '../firebase'

export default function Home() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { places: firstPage, lastDoc: cursor, error: fetchError } = await getVerifiedPlacesPage(20, null)
        if (!mounted) return
        if (fetchError) {
          setError(fetchError)
          return
        }
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
    if (loadingMore || !hasMore || error) return
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
    if (!hasMore || error) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: '800px 0px', threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, lastDoc, loadingMore, error])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading places...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '40px', color: 'red' }}>
        <h3>Database Error</h3>
        <p>{error.message}</p>
        <p>If it says "The query requires an index", open your browser Developer Tools (F12) to find the clickable link to create the index, or copy the link from the console.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="home-section" style={{ marginBottom: '40px' }}>
        <h2>Discover Hidden Travel Gems</h2>
        <p>Share and explore the most amazing hidden travel places across India. From secret waterfalls to quiet beaches, help others find their next adventure.</p>
        <div className="button-group">
          <Link href="/submit" className="btn btn-primary">
            Submit a Place
          </Link>
        </div>
      </div>

      {(() => {
        const uniqueStates = Array.from(new Set(places.map(p => p.state).filter(Boolean))).slice(0, 8);
        if (uniqueStates.length === 0) return null;
        return (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '15px', color: '#667eea', fontSize: '1.5rem' }}>Popular Destinations</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {uniqueStates.map(state => {
                const slug = state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                return (
                  <Link key={state} href={`/explore/${slug}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Explore {state}
                  </Link>
                )
              })}
            </div>
          </div>
        );
      })()}

      <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Latest Places</h2>
      
      {!places.length ? (
        <div className="empty-state">
          <h3>No verified places yet</h3>
          <p style={{ marginTop: '10px' }}>
            Be the first to <Link href="/submit">submit a place</Link>.
          </p>
        </div>
      ) : (
        <>
          <div className="places-grid">
            {places.map((p) => (
              <Link key={p.id} href={`/place/${p.slug || p.id}`} className="place-card">
                {p.photo ? <img src={p.photo} alt={p.place_name || 'Place'} loading="lazy" /> : <img alt="" loading="lazy" />}
                <div className="place-card-content">
                  <h3>{p.place_name || 'Untitled place'}</h3>
                  <div className="place-card-meta">
                    {(p.state || 'Unknown state') + (p.district ? ` • ${p.district}` : '')}
                  </div>
                  {(() => {
                    const avgRating = p.total_ratings ? (p.total_stars / p.total_ratings).toFixed(1) : 0;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', marginBottom: '8px' }}>
                        <span style={{ color: avgRating > 0 ? '#fbbf24' : '#e5e7eb', fontSize: '18px', lineHeight: '1' }}>★</span>
                        <span style={{ fontSize: '0.85em', color: '#777', fontWeight: '500' }}>
                          {p.total_ratings > 0 ? `${avgRating} (${p.total_ratings})` : 'New'}
                        </span>
                      </div>
                    );
                  })()}
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
        </>
      )}
    </div>
  )
}