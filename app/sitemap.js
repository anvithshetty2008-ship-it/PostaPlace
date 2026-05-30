import { getVerifiedPlaces } from '../firebase'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://posta-place.vercel.app';
  
  // Get all verified places
  let places = [];
  try {
    places = await getVerifiedPlaces();
  } catch (error) {
    console.error('Error fetching places for sitemap:', error);
  }

  const placeUrls = places.map((place) => ({
    url: `${baseUrl}/place/${place.slug || place.id}`,
    lastModified: place.created_date ? new Date(place.created_date.seconds * 1000) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...placeUrls,
  ];
}
