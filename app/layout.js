import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'PostaPlace - Hidden Travel Gems',
  description: 'Discover and share hidden travel places',
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
            <Link href="/explore">Explore</Link>
          </nav>

          <div className="container">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}