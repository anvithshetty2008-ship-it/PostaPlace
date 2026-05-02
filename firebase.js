import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, getDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Functions for database operations
export async function submitPlace(placeData) {
  try {
    const docRef = await addDoc(collection(db, 'places'), {
      ...placeData,
      is_verified: false,
      created_date: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting place:', error);
    throw error;
  }
}

export async function getVerifiedPlaces() {
  try {
    const q = query(collection(db, 'places'), where('is_verified', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

// Pagination-friendly read for Explore (prevents loading whole DB).
// Returns { places, lastDoc } where lastDoc can be passed back for next page.
export async function getVerifiedPlacesPage(pageSize = 20, lastDoc = null) {
  try {
    const base = [
      collection(db, 'places'),
      where('is_verified', '==', true),
      orderBy('created_date', 'desc'),
      limit(pageSize),
    ]

    const q = lastDoc ? query(...base, startAfter(lastDoc)) : query(...base)
    const snapshot = await getDocs(q)
    const places = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    const newLastDoc = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null
    return { places, lastDoc: newLastDoc }
  } catch (error) {
    console.error('Error fetching places page:', error)
    return { places: [], lastDoc: null }
  }
}

export async function getUnverifiedPlaces() {
  try {
    const q = query(collection(db, 'places'), where('is_verified', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching unverified places:', error);
    return [];
  }
}

export async function getPlaceById(placeId) {
  try {
    const snap = await getDoc(doc(db, 'places', placeId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('Error fetching place:', error);
    return null;
  }
}

export async function verifyPlace(placeId) {
  try {
    await updateDoc(doc(db, 'places', placeId), {
      is_verified: true,
    });
  } catch (error) {
    console.error('Error verifying place:', error);
    throw error;
  }
}

export async function deletePlace(placeId) {
  try {
    await deleteDoc(doc(db, 'places', placeId));
  } catch (error) {
    console.error('Error deleting place:', error);
    throw error;
  }
}

export async function uploadImage(file, fileName) {
  try {
    const storageRef = ref(storage, `places/${Date.now()}-${fileName}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}