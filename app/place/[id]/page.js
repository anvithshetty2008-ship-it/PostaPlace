'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPlaceById, ratePlace, getVerifiedPlacesPage } from '../../../firebase'

export default function PlaceDetail({ params }) {
  const placeId = params?.id
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasRated, setHasRated] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [isRating, setIsRating] = useState(false)
  const [explorePlaces, setExplorePlaces] = useState([])

  useEffect(() => {
    if (placeId) {
      const rated = localStorage.getItem(`rated_${placeId}`)
      if (rated) setHasRated(true)
    }
  }, [placeId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = placeId ? await getPlaceById(placeId) : null
        if (mounted) setPlace(data)

        if (data) {
          const { places } = await getVerifiedPlacesPage(4, null)
          if (mounted) {
            setExplorePlaces(places.filter(p => p.id !== data.id).slice(0, 3))
          }
        }
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
          Go back to <Link href="/">Home</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="detail-view">
      {place.photo ? <img src={place.photo} alt={place.place_name || 'Place'} className="detail-image" /> : null}
      <div className="detail-content">
        <h2>{place.place_name || 'Untitled place'}</h2>
        
        {(() => {
          const avgRating = place.total_ratings ? (place.total_stars / place.total_ratings).toFixed(1) : 0;
          
          const handleRate = async (value) => {
            if (hasRated || isRating) return;
            setIsRating(true);
            try {
              await ratePlace(placeId, value);
              localStorage.setItem(`rated_${placeId}`, 'true');
              setHasRated(true);
              setPlace(prev => ({
                ...prev,
                total_ratings: (prev.total_ratings || 0) + 1,
                total_stars: (prev.total_stars || 0) + value
              }));
            } catch (err) {
              console.error('Failed to rate', err);
              alert('Failed to submit rating. Please try again.');
            } finally {
              setIsRating(false);
            }
          };

          return (
            <div className="rating-container" style={{ margin: '15px 0 25px 0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="stars" style={{ display: 'flex', margin: '0 -8px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || Math.round(avgRating));
                  return (
                    <span
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => !hasRated && setHoverRating(star)}
                      onMouseLeave={() => !hasRated && setHoverRating(0)}
                      style={{
                        cursor: hasRated || isRating ? 'default' : 'pointer',
                        color: isFilled ? '#fbbf24' : '#e5e7eb',
                        fontSize: '28px',
                        padding: '8px',
                        transition: 'color 0.2s, transform 0.1s',
                        lineHeight: '1',
                        textShadow: isFilled ? '0 0 1px rgba(0,0,0,0.1)' : 'none',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.95em', color: '#555', fontWeight: '500' }}>
                {place.total_ratings > 0 ? `${avgRating} out of 5 (${place.total_ratings} ${place.total_ratings === 1 ? 'rating' : 'ratings'})` : 'No ratings yet. Be the first!'}
              </span>
              {hasRated && <span style={{ fontSize: '0.9em', color: '#10b981', fontWeight: '600' }}>✓ Rated</span>}
            </div>
          );
        })()}

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
          {place.adventure_type && (
            <div>
              <strong>Adventure Type</strong>
              <div>{place.adventure_type}</div>
            </div>
          )}
          <div>
            <strong>Submitted by</strong>
            <div>{place.submitted_by_name || '—'}</div>
          </div>
        </div>

        <div className="travel-info-cards" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginTop: '25px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            border: '1px solid #e2e8f0',
            borderLeft: '5px solid #667eea',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          }}>
            <div style={{ fontSize: '32px', lineHeight: '1' }}>⏰</div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#718096', marginBottom: '4px' }}>
                Best Time & Timings
              </span>
              <strong style={{ fontSize: '15px', color: '#2d3748', fontWeight: '600' }}>
                {place.timings || 'Flexible (Open 24/7)'}
              </strong>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
            border: '1px solid #e2e8f0',
            borderLeft: '5px solid #f97316',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          }}>
            <div style={{ fontSize: '32px', lineHeight: '1' }}>☀️</div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#718096', marginBottom: '4px' }}>
                Best Season to Visit
              </span>
              <strong style={{ fontSize: '15px', color: '#2d3748', fontWeight: '600' }}>
                {place.best_season || 'Year-round'}
              </strong>
            </div>
          </div>
        </div>

        {(() => {
          const autoAddress = `${place.place_name}, ${place.district ? place.district + ', ' : ''}${place.state}`;
          const displayAddress = place.address || autoAddress;
          
          return (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.1em' }}>Location Address</h3>
              <p style={{ marginBottom: '15px' }}>{displayAddress}</p>
              <a 
                href={`https://www.google.com/maps/search/${encodeURIComponent(displayAddress)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-block' }}
              >
                View on Google Maps
              </a>
            </div>
          );
        })()}
        <p style={{ color: '#555', lineHeight: 1.7, marginTop: '20px' }}>{place.description || 'No description provided.'}</p>
        <div style={{ marginTop: '25px', marginBottom: '40px' }}>
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>

        {explorePlaces.length > 0 && (
          <div className="explore-more" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#667eea' }}>Explore More Hidden Gems</h3>
            <div className="places-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {explorePlaces.map((p) => {
                const avgRating = p.total_ratings ? (p.total_stars / p.total_ratings).toFixed(1) : 0;
                return (
                  <Link key={p.id} href={`/place/${p.slug || p.id}`} className="place-card">
                    {p.photo ? <img src={p.photo} alt={p.place_name || 'Place'} loading="lazy" style={{ height: '140px' }} /> : <img alt="" loading="lazy" style={{ height: '140px' }} />}
                    <div className="place-card-content" style={{ padding: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>{p.place_name}</h4>
                      <div style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>{p.state}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: avgRating > 0 ? '#fbbf24' : '#e5e7eb', fontSize: '14px', lineHeight: '1' }}>★</span>
                        <span style={{ fontSize: '12px', color: '#777' }}>
                          {p.total_ratings > 0 ? `${avgRating}` : 'New'}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

