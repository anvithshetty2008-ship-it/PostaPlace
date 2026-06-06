export async function generateMetadata({ params }) {
  const locationRaw = params.location;
  const decodedLocation = decodeURIComponent(locationRaw).toLowerCase().replace(/-/g, ' ');
  const titleLocation = decodedLocation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Best Hidden Travel Gems to Visit in ${titleLocation} - PostaPlace`,
    description: `Discover top-rated hidden travel destinations, tourist attractions, and secret spots to visit in ${titleLocation}, India.`,
    keywords: [titleLocation, `travel in ${titleLocation}`, `places to visit in ${titleLocation}`, 'hidden gems', 'tourism', 'india'],
  }
}

export default function ExploreLayout({ children }) {
  return <>{children}</>;
}
