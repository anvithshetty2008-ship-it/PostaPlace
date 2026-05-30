export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://posta-place.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
