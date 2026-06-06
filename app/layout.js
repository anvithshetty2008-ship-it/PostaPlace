import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'PostaPlace - Hidden Travel Gems of India',
  description: 'PostaPlace is a travel directory to discover and share hidden travel destinations, tourist attractions, and secret spots across India.',
  keywords: ['travel', 'hidden gems', 'tourism', 'destinations', 'india', 'tourist attraction', 'places to visit'],
  applicationName: 'PostaPlace',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'PostaPlace',
    statusBarStyle: 'default',
    capable: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=4', sizes: 'any' },
      { url: '/icon.png?v=4', type: 'image/png' }
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/icon.png?v=4',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <header>
            <h1>🌍 PostaPlace</h1>
            <p>Discover Hidden Travel Gems Across India</p>
          </header>

          <nav>
            <Link href="/">Home</Link>
            <Link href="/submit">Submit Place</Link>
          </nav>

          <div className="container">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}