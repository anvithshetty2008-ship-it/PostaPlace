'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitPlace, uploadImage } from '../../firebase'

export default function Submit() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [formData, setFormData] = useState({
    place_name: '',
    state: '',
    district: '',
    category: 'Beach',
    description: '',
    photo: null,
    submitted_by_name: '',
    phone: '',
    instagram: '',
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.place_name || !formData.state || !formData.submitted_by_name) {
      setMessage({ type: 'error', text: 'Please fill required fields' })
      return
    }

    setLoading(true)
    try {
      let photoUrl = null
      if (formData.photo) {
        photoUrl = await uploadImage(formData.photo, formData.place_name)
      }

      await submitPlace({
        ...formData,
        photo: photoUrl,
      })

      setMessage({ type: 'success', text: 'Place submitted! Waiting for admin approval.' })
      setTimeout(() => router.push('/'), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting place' })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '30px', color: '#667eea' }}>Submit a Hidden Place</h2>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="form-group">
        <label>Place Name *</label>
        <input
          type="text"
          value={formData.place_name}
          onChange={(e) => setFormData({ ...formData, place_name: e.target.value })}
          placeholder="e.g., Yana Caves"
          required
        />
      </div>

      <div className="form-group">
        <label>State *</label>
        <input
          type="text"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          placeholder="e.g., Karnataka"
          required
        />
      </div>

      <div className="form-group">
        <label>District</label>
        <input
          type="text"
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          placeholder="e.g., Belgaum"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
          <option>Beach</option>
          <option>Waterfall</option>
          <option>Mountain</option>
          <option>Forest</option>
          <option>Cave</option>
          <option>Temple</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tell us about this place..."
        />
      </div>

      <div className="form-group">
        <label>Photo</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {photoPreview && <img src={photoPreview} alt="Preview" className="photo-preview" />}
      </div>

      <div className="form-group">
        <label>Your Name *</label>
        <input
          type="text"
          value={formData.submitted_by_name}
          onChange={(e) => setFormData({ ...formData, submitted_by_name: e.target.value })}
          placeholder="Your name"
          required
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Your phone"
        />
      </div>

      <div className="form-group">
        <label>Instagram</label>
        <input
          type="text"
          value={formData.instagram}
          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          placeholder="Instagram handle (without @)"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Place'}
      </button>
    </form>
  )
}