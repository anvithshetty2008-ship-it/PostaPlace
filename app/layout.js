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
          <header className="navbar">
            <div className="nav-container">
              <Link href="/" className="logo">
                <span className="logo-emoji">🌍</span>
                <span className="logo-text">PostaPlace</span>
              </Link>
              <nav className="nav-links">
                <Link href="/" className="nav-link-item">Explore Gems</Link>
                <Link href="/submit" className="nav-btn-primary">Submit Place</Link>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <p>© {new Date().getFullYear()} PostaPlace. Built for travelers to discover the hidden wonders of India.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}