import { getPlaceById } from '../../../firebase'

export async function generateMetadata({ params }) {
  const placeId = params?.id
  const place = placeId ? await getPlaceById(placeId) : null

  if (!place) {
    return {
      title: 'Place Not Found - PostaPlace',
    }
  }

  return {
    title: `${place.place_name} | Travel Guide & Photos - PostaPlace`,
    description: place.description ? place.description.substring(0, 160) : `Discover ${place.place_name}, a beautiful hidden travel gem in ${place.state}, India.`,
    keywords: [place.place_name, place.state, place.district, place.category, 'travel', 'india tourism'].filter(Boolean),
  }
}

export default async function PlaceLayout({ children, params }) {
  const placeId = params?.id
  const place = placeId ? await getPlaceById(placeId) : null

  if (!place) {
    return children;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.place_name,
    description: place.description || `A beautiful hidden travel gem in ${place.state}, India.`,
    address: {
      '@type': 'PostalAddress',
      addressRegion: place.state,
      addressLocality: place.district,
      addressCountry: 'IN'
    },
  };

  if (place.photo) {
    jsonLd.image = place.photo;
  }

  if (place.total_ratings > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (place.total_stars / place.total_ratings).toFixed(1),
      reviewCount: place.total_ratings
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
