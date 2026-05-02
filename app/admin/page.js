'use client'

import { useState, useEffect } from 'react'
import { getUnverifiedPlaces, verifyPlace, deletePlace } from '../../firebase'

const ADMIN_EMAIL = 'anvithshetty2008@gmail.com'

export default function Admin() {
  const [adminPlaces, setAdminPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  const handleLogin = (e) => {
    e.preventDefault()
    if (email === ADMIN_EMAIL) {
      setIsAdmin(true)
      fetchPlaces()
      setMessage({ type: 'success', text: 'Admin access granted' })
    } else {
      setMessage({ type: 'error', text: 'Unauthorized access' })
    }
  }

  const fetchPlaces = async () => {
    try {
      setLoading(true)
      const data = await getUnverifiedPlaces()
      setAdminPlaces(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading places' })
    }
    setLoading(false)
  }

  const handleVerify = async (id) => {
    try {
      await verifyPlace(id)
      setMessage({ type: 'success', text: 'Place verified!' })
      fetchPlaces()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error verifying' })
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this place?')) {
      try {
        await deletePlace(id)
        setMessage({ type: 'success', text: 'Place deleted!' })
        fetchPlaces()
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting' })
      }
    }
  }

  if (!isAdmin) {
    return (
      <form onSubmit={handleLogin} style={{ maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '30px', color: '#667eea' }}>Admin Login</h2>
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <div className="form-group">
          <label>Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Login
        </button>
      </form>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>Logged in as: <strong>{email}</strong></span>
        <button className="btn btn-secondary" onClick={() => setIsAdmin(false)} style={{ padding: '8px 15px' }}>
          Logout
        </button>
      </div>

      <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Pending Approvals</h2>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : adminPlaces.length === 0 ? (
        <div className="empty-state"><h3>All caught up!</h3></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Place Name</th>
              <th>Location Info</th>
              <th>Details</th>
              <th>Submitted By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminPlaces.map((place) => (
              <tr key={place.id}>
                <td>
                  {place.photo ? (
                    <img src={place.photo} alt={place.place_name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <span style={{ color: '#888' }}>No Photo</span>
                  )}
                </td>
                <td><strong>{place.place_name}</strong><br/><span style={{ fontSize: '0.85em', color: '#666' }}>{place.category}</span></td>
                <td>
                  {place.district ? `${place.district}, ` : ''}{place.state}
                </td>
                <td style={{ maxWidth: '200px' }}>
                  <div style={{ fontSize: '0.9em', maxHeight: '100px', overflowY: 'auto' }}>
                    {place.description || 'No description'}
                  </div>
                </td>
                <td>
                  {place.submitted_by_name}<br/>
                  {place.instagram && <span style={{ fontSize: '0.85em', color: '#e1306c' }}>@{place.instagram}</span>}<br/>
                  {place.phone && <span style={{ fontSize: '0.85em', color: '#555' }}>{place.phone}</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="btn-small btn-verify" onClick={() => handleVerify(place.id)}>
                      Verify
                    </button>
                    <button className="btn-small btn-delete" onClick={() => handleDelete(place.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}