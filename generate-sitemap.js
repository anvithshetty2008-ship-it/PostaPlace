const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

async function run() {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  
  // Graceful check for serviceAccountKey.json
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('\nError: "serviceAccountKey.json" was not found in the root directory.');
    console.error('----------------------------------------------------------------------');
    console.error('To run this script successfully, please do the following:');
    console.error('1. Go to Firebase Console -> Project Settings -> Service Accounts.');
    console.error('2. Click "Generate New Private Key" and download the JSON file.');
    console.error('3. Place it in the root directory of this project and rename it to "serviceAccountKey.json".');
    console.error('4. Run the script again using: node generate-sitemap.js\n');
    process.exit(1);
  }

  try {
    // 1. Initialize the Firebase Admin SDK
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    const db = admin.firestore();
    
    // 2. Query Firestore collection 'places' where 'status' equals 'approved'
    console.log('Fetching approved places from Firestore...');
    const snapshot = await db.collection('places').where('status', '==', 'approved').get();
    
    // 3. Extract unique, cleaned, URL-friendly city names
    const uniqueCities = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.city && typeof data.city === 'string') {
        const cleanedCity = data.city
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')                // Replace spaces with hyphens
          .replace(/[^a-z0-9\-]/g, '')         // Remove non-URL friendly chars
          .replace(/-+/g, '-')                 // Collapse duplicate hyphens
          .replace(/^-|-$/g, '');              // Trim leading/trailing hyphens
        
        if (cleanedCity) {
          uniqueCities.add(cleanedCity);
        }
      }
    });

    const citiesList = Array.from(uniqueCities);
    console.log(`Found ${citiesList.length} unique approved cities.`);

    // 4. Use the 'sitemap' package to construct sitemap structure
    // 5. Base URL of the website is 'https://postaplace.com'
    // 7. Include static root URL at the top with a priority of '1.0'
    const links = [
      { url: 'https://postaplace.com', changefreq: 'daily', priority: 1.0 }
    ];

    // 6. Set changefreq to 'daily' and priority to '0.8' for city pages
    citiesList.forEach(citySlug => {
      links.push({
        url: `https://postaplace.com/${citySlug}`,
        changefreq: 'daily',
        priority: 0.8
      });
    });

    const stream = new SitemapStream({ hostname: 'https://postaplace.com' });
    const xmlBuffer = await streamToPromise(Readable.from(links).pipe(stream));
    const xmlContent = xmlBuffer.toString();

    // 8. Write final compiled XML output to sitemap.xml in root directory
    const outputPath = path.join(__dirname, 'sitemap.xml');
    fs.writeFileSync(outputPath, xmlContent, 'utf8');

    console.log('\n-------------------------------------------------------------');
    console.log('Sitemap generation completed successfully!');
    console.log(`File created: ${outputPath}`);
    console.log(`Total unique city URLs added: ${citiesList.length}`);
    console.log('-------------------------------------------------------------\n');
  } catch (error) {
    console.error('Error occurred during sitemap generation:', error);
    process.exit(1);
  }
}

run();
