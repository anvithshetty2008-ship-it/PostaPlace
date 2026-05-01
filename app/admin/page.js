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
              <th>Place Name</th>
              <th>State</th>
              <th>Submitted By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminPlaces.map((place) => (
              <tr key={place.id}>
                <td><strong>{place.place_name}</strong></td>
                <td>{place.state}</td>
                <td>{place.submitted_by_name}</td>
                <td>
                  <button className="btn-small btn-verify" onClick={() => handleVerify(place.id)}>
                    Verify
                  </button>
                  <button className="btn-small btn-delete" onClick={() => handleDelete(place.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}