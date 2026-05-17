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
          <header style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <img 
                src="/logo.png" 
                alt="PostaPlace Logo" 
                style={{ height: '120px', width: 'auto', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
              />
            </div>
            <h1>PostaPlace</h1>
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