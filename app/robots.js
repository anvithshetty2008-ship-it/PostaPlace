export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://postaplace.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
