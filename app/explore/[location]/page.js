import Link from 'next/link'
import { getVerifiedPlaces } from '../../../firebase'

export default async function ExploreLocation({ params }) {
  const locationRaw = params.location;
  // If the URL is /explore/karnataka or /explore/uttar-pradesh
  const decodedLocation = decodeURIComponent(locationRaw).toLowerCase().replace(/-/g, ' ');
  
  const allPlaces = await getVerifiedPlaces();
  const places = allPlaces.filter(p => {
    const stateMatch = p.state && p.state.toLowerCase() === decodedLocation;
    const districtMatch = p.district && p.district.toLowerCase() === decodedLocation;
    return stateMatch || districtMatch;
  });

  const titleLocation = decodedLocation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div>
      <div className="home-section" style={{ marginBottom: '40px', padding: '40px 20px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Best Hidden Travel Gems in {titleLocation}</h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', color: '#555' }}>
          Discover the most beautiful, secret, and unexplored places to visit in {titleLocation}. Handpicked by travelers.
        </p>
      </div>

      {places.length === 0 ? (
        <div className="empty-state">
          <h3>No places found in {titleLocation} yet!</h3>
          <p style={{ marginTop: '10px' }}>
            Be the first to <Link href="/submit">submit a place</Link> in this area.
          </p>
        </div>
      ) : (
        <div className="places-grid">
          {places.map((p) => {
            const avgRating = p.total_ratings ? (p.total_stars / p.total_ratings).toFixed(1) : 0;
            return (
              <Link key={p.id} href={`/place/${p.slug || p.id}`} className="place-card">
                {p.photo ? <img src={p.photo} alt={p.place_name || 'Place'} loading="lazy" /> : <img alt="" loading="lazy" />}
                <div className="place-card-content">
                  <h3>{p.place_name || 'Untitled place'}</h3>
                  <div className="place-card-meta">
                    {(p.state || 'Unknown state') + (p.district ? ` • ${p.district}` : '')}
                  </div>
                  {(() => {
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
            )
          })}
        </div>
      )}
    </div>
  )
}
