import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Check, X, FileText, User, Clock, Ban, Users, AlertTriangle } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'events', 'volunteers', 'hostel'
  const [papers, setPapers] = useState([]);
  const [events, setEvents] = useState([]);
  const [hostelRequests, setHostelRequests] = useState([]);
  // const [volunteers, setVolunteers] = useState([]); // Removed unused state
  // const [loading, setLoading] = useState(true); // Removed unused state
  const [message, setMessage] = useState('');

  // State for the approval form
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    eventDate: '',
    location: ''
  });
  const [collisionWarning, setCollisionWarning] = useState(null);

  const fetchPapers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/papers?status=PENDING');
      setPapers(response.data);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchHostelRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/hostel/requests');
      setHostelRequests(response.data);
    } catch (error) {
      console.error('Error fetching hostel requests:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPapers(), fetchEvents(), fetchHostelRequests()]);
      // setLoading(false);
    };
    loadData();
  }, []);

  const handleApproveClick = (paper) => {
    setSelectedPaper(paper);
    setMessage('');
    setCollisionWarning(null);
  };

  const handleRejectClick = async (paper) => {
    if (!window.confirm(`Are you sure you want to reject "${paper.title}"?`)) return;

    try {
      await axios.post('http://localhost:3000/api/admin/reject', { paperId: paper.id });
      setMessage(`Paper "${paper.title}" rejected.`);
      fetchPapers();
    } catch (error) {
      console.error('Error rejecting paper:', error);
      setMessage('Failed to reject paper.');
    }
  };

  const handleVolunteerStatus = async (registrationId, status) => {
    try {
      await axios.post('http://localhost:3000/api/admin/volunteers/status', { registrationId, status });
      fetchEvents(); // Refresh events to update volunteer list
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Failed to update volunteer status');
    }
  };

  const handleForwardHostel = async (requestId) => {
    try {
      await axios.post('http://localhost:3000/api/hostel/forward', { requestId });
      setMessage('Hostel request forwarded successfully.');
      fetchHostelRequests();
    } catch (error) {
      console.error('Error forwarding hostel request:', error);
      alert('Failed to forward request');
    }
  };

  const handleInputChange = (e) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    setCollisionWarning(null); // Clear warning on change
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaper) return;

    try {
      await axios.post('http://localhost:3000/api/admin/approve', {
        paperId: selectedPaper.id,
        eventDate: eventDetails.eventDate,
        location: eventDetails.location,
        force: collisionWarning ? true : false // Force if warning was already shown
      });

      setMessage(`Success! Paper "${selectedPaper.title}" approved and scheduled.`);
      setSelectedPaper(null);
      setEventDetails({ eventDate: '', location: '' });
      setCollisionWarning(null);

      // Refresh lists
      fetchPapers();
      fetchEvents();

    } catch (error) {
      if (error.response && error.response.status === 409) {
        setCollisionWarning(error.response.data.message);
      } else {
        console.error('Error approving paper:', error);
        setMessage('Failed to approve paper. ' + (error.response?.data?.error || error.message));
      }
    }
  };

  // Helper to extract all volunteers from all events for the "Volunteers" tab
  // Or we can just show them under events. The user asked for a separate tab.
  const getAllVolunteers = () => {
    const all = [];
    events.forEach(event => {
      event.volunteers.forEach(v => {
        all.push({ ...v, eventTitle: event.paper_title, eventDate: event.event_date });
      });
    });
    return all;
  };

  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage submissions and schedule events.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Pending Approvals ({papers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'events' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'events' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Approved Events ({events.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'volunteers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'volunteers' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Volunteers
        </button>
        <button
          className={`tab-btn ${activeTab === 'hostel' ? 'active' : ''}`}
          onClick={() => setActiveTab('hostel')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            color: activeTab === 'hostel' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'hostel' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Hostel Requests ({hostelRequests.filter(r => r.status === 'REQUESTED_BY_AUTHOR').length})
        </button>
      </div>

      {message && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          background: message.includes('Success') || message.includes('rejected') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${message.includes('Success') || message.includes('rejected') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: 'white'
        }}>
          {message}
        </div>
      )}

      {/* PENDING TAB */}
      {activeTab === 'pending' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {papers.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No pending papers found. All caught up! 🎉</p>
            </div>
          ) : (
            papers.map(paper => (
              <div key={paper.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {paper.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {new Date(paper.submitted_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{paper.title}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <User size={16} />
                  <span style={{ fontSize: '0.9rem' }}>{paper.author_name} ({paper.author_email})</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.3rem' }}>
                  <a
                    href={`http://localhost:3000/${paper.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    title="View PDF"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                  >
                    <FileText size={14} /> View
                  </a>

                  <button
                    onClick={() => handleRejectClick(paper)}
                    className="btn"
                    title="Reject Paper"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      padding: '0.4rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <Ban size={14} /> Reject
                  </button>

                  <button
                    onClick={() => handleApproveClick(paper)}
                    className="btn btn-primary"
                    title="Approve Paper"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {events.map(event => (
            <div key={event.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{event.paper_title}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} /> {event.author_name} (Speaker)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> {new Date(event.event_date).toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} /> {event.location}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} /> Volunteers ({event.volunteers.length})
                </h4>
                {event.volunteers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No volunteers registered yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {event.volunteers.map(v => (
                      <div key={v.id} style={{
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        border: v.status === 'PENDING' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid transparent'
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.email}</div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: v.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : v.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                            color: v.status === 'APPROVED' ? '#10b981' : v.status === 'REJECTED' ? '#ef4444' : '#fbbf24'
                          }}>
                            {v.status}
                          </span>
                          {v.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => handleVolunteerStatus(v.id, 'APPROVED')} className="btn-icon" style={{ padding: '2px', color: '#10b981' }}><Check size={14} /></button>
                              <button onClick={() => handleVolunteerStatus(v.id, 'REJECTED')} className="btn-icon" style={{ padding: '2px', color: '#ef4444' }}><X size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VOLUNTEERS TAB (Aggregated View) */}
      {activeTab === 'volunteers' && (
        <div className="glass-card">
          <h3>Volunteer Requests</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Volunteer</th>
                <th style={{ padding: '1rem' }}>Event</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {getAllVolunteers().map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{v.eventTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(v.eventDate).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: v.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : v.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                      color: v.status === 'APPROVED' ? '#10b981' : v.status === 'REJECTED' ? '#ef4444' : '#fbbf24'
                    }}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {v.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleVolunteerStatus(v.id, 'APPROVED')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Approve</button>
                        <button onClick={() => handleVolunteerStatus(v.id, 'REJECTED')} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', border: '1px solid var(--border)' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* HOSTEL TAB */}
      {activeTab === 'hostel' && (
        <div className="glass-card">
          <h3>Hostel Accommodation Requests</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Forward incoming requests to the Hostel Management dummy endpoint to approve their stay.
          </p>

          {hostelRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hostel requests found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Author</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Paper</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Dates</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {hostelRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{req.author_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.author_email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>{req.paper_title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requested {new Date(req.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {req.hostel_start_date && req.hostel_end_date ? (
                        <>
                          <div style={{ color: '#10b981' }}>In: {new Date(req.hostel_start_date).toLocaleDateString()}</div>
                          <div style={{ color: '#ef4444' }}>Out: {new Date(req.hostel_end_date).toLocaleDateString()}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Pending Author Input</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: req.status === 'SUBMITTED_BY_AUTHOR' ? 'rgba(16, 185, 129, 0.2)'
                          : req.status === 'APPROVED_BY_HOSTEL' ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(251, 191, 36, 0.2)',
                        color: req.status === 'SUBMITTED_BY_AUTHOR' ? '#10b981'
                          : req.status === 'APPROVED_BY_HOSTEL' ? '#3b82f6'
                            : '#fbbf24'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {req.status === 'REQUESTED_BY_AUTHOR' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          onClick={() => handleForwardHostel(req.id)}
                        >
                          Forward to Management
                        </button>
                      )}
                      {req.status === 'APPROVED_BY_HOSTEL' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting Dates</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedPaper && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Schedule Event</h3>
              <button onClick={() => { setSelectedPaper(null); setCollisionWarning(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Approving paper: <strong style={{ color: 'white' }}>{selectedPaper.title}</strong>
            </p>

            {collisionWarning && (
              <div style={{
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'start',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Warning:</strong> {collisionWarning}
                  <br />
                  <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Click "Confirm Approval" again to force schedule it anyway.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleApproveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Event Date & Time</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--text-muted)' }} />
                  <input
                    type="datetime-local"
                    name="eventDate"
                    value={eventDetails.eventDate}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="location"
                    value={eventDetails.location}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                    placeholder="e.g. Grand Hall A"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setSelectedPaper(null); setCollisionWarning(null); }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {collisionWarning ? 'Confirm Anyway' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
