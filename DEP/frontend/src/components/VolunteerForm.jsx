import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function VolunteerForm() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', eventId: '' });
  const [message, setMessage] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/volunteers/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage('Failed to load available events.');
      }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterClick = (eventId) => {
    setSelectedEventId(eventId);
    setFormData(prev => ({ ...prev, eventId }));
    setMessage('');
    // Scroll to form or open modal logic could go here
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventId) {
      setMessage('Please select an event.');
      return;
    }

    try {
      setMessage('Registering...');
      await axios.post('http://localhost:3000/api/volunteers/register', {
        name: formData.name,
        email: formData.email,
        eventId: formData.eventId
      });

      setMessage('Success! You are registered as a volunteer.');
      setFormData({ name: '', email: '', eventId: '' });
      setSelectedEventId(null);

    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="volunteer-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Volunteer Opportunities</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Join us in making these events a success.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {events.map(event => (
          <div key={event.event_id} className={`glass-card ${selectedEventId === event.event_id ? 'selected' : ''}`}
            style={{
              borderColor: selectedEventId === event.event_id ? 'var(--primary)' : 'var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>

            {selectedEventId === event.event_id && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }} />
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{event.paper_title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <User size={16} />
                <span style={{ fontSize: '0.9rem' }}>{event.author_name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={18} />
                <span>{new Date(event.event_date).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
            </div>

            <button
              onClick={() => handleRegisterClick(event.event_id)}
              className={`btn ${selectedEventId === event.event_id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {selectedEventId === event.event_id ? 'Selected' : 'Volunteer for this Event'}
            </button>
          </div>
        ))}
      </div>

      {selectedEventId && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            Complete Registration
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="john@example.com"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Complete Registration
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius)',
              background: message.includes('Success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${message.includes('Success') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {message.includes('Success') ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
