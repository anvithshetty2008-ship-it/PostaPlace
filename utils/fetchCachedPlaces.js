import { getDocs } from 'firebase/firestore';

/**
 * Fetches place documents from Firestore with a 24-hour localStorage cache.
 * 
 * @param {import('firebase/firestore').Query} firestoreQuery - The Firebase query object.
 * @param {string} cacheKey - The unique key under which to cache the data in localStorage.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of document data including document IDs.
 * 
 * @example
 * // Usage inside a React useEffect hook:
 * import { useEffect, useState } from 'react';
 * import { query, collection, where } from 'firebase/firestore';
 * import { db } from './firebase'; // Your initialized Firestore database instance
 * import { fetchCachedPlaces } from './utils/fetchCachedPlaces';
 * 
 * function NearbyPlaces() {
 *   const [places, setPlaces] = useState([]);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     const q = query(collection(db, 'places'), where('category', '==', 'Beach'), where('is_verified', '==', true));
 *     
 *     fetchCachedPlaces(q, 'cached_beach_places')
 *       .then((data) => {
 *         setPlaces(data);
 *         setLoading(false);
 *       })
 *       .catch((err) => {
 *         console.error('Failed to fetch cached places:', err);
 *         setLoading(false);
 *       });
 *   }, []);
 * 
 *   if (loading) return <div>Loading...</div>;
 *   return (
 *     <ul>
 *       {places.map(place => (
 *         <li key={place.id}>{place.place_name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
export async function fetchCachedPlaces(firestoreQuery, cacheKey) {
  // 1. Check if we are running in the browser env
  if (typeof window === 'undefined') {
    const snapshot = await getDocs(firestoreQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 2. Check if data exists in localStorage
  const cachedItem = localStorage.getItem(cacheKey);
  if (cachedItem) {
    try {
      const cached = JSON.parse(cachedItem);
      const now = Date.now();
      const ageInMs = now - cached.timestamp;
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

      // 3. If cache is less than 24 hours old, return immediately
      if (ageInMs < twentyFourHoursInMs) {
        return cached.data;
      }
    } catch (error) {
      console.warn(`Failed to parse cache for key "${cacheKey}":`, error);
      // Fallback: delete corrupt item
      localStorage.removeItem(cacheKey);
    }
  }

  // 4. Perform actual Firestore getDocs query
  const snapshot = await getDocs(firestoreQuery);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 5. Save results and current timestamp to localStorage
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn(`Failed to set cache for key "${cacheKey}":`, error);
  }

  return data;
}
