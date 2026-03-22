import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Home, Bed, Info } from 'lucide-react';

export default function AuthorDashboard() {
  const { user } = useAuth();

  // Paper Submission State
  const [formData, setFormData] = useState({ title: '' });
  const [file, setFile] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard Data State
  const [myPapers, setMyPapers] = useState([]);
  const [myHostelRequests, setMyHostelRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hostel Form State
  const [hostelDates, setHostelDates] = useState({ startDate: '', endDate: '' });
  const [hostelMessage, setHostelMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [papersRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/submissions/my-papers'),
        axios.get('http://localhost:3000/api/hostel/my-requests')
      ]);
      setMyPapers(papersRes.data);
      setMyHostelRequests(requestsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHostelRequest = async (paperId) => {
    try {
      await axios.post('http://localhost:3000/api/hostel/request', { paperId });
      fetchDashboardData(); // Refresh to show new status
    } catch (error) {
      console.error('Failed to request hostel:', error);
      alert(error.response?.data?.error || 'Failed to request hostel');
    }
  };

  const handleHostelSubmitDetails = async (e, requestId) => {
    e.preventDefault();
    if (!hostelDates.startDate || !hostelDates.endDate) return;

    try {
      await axios.post('http://localhost:3000/api/hostel/submit-details', {
        requestId,
        startDate: hostelDates.startDate,
        endDate: hostelDates.endDate
      });
      setHostelDates({ startDate: '', endDate: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to submit details:', error);
      alert(error.response?.data?.error || 'Failed to submit details');
    }
  };

  const getHostelRequestForPaper = (paperId) => {
    return myHostelRequests.find(req => req.paper_id === paperId);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePaperSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setSubmitMessage('Please select a PDF file to upload.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    const payload = new FormData();
    // Use the authenticated user's details to submit
    payload.append('name', user.name);
    payload.append('email', user.email);
    payload.append('title', formData.title);
    payload.append('paperFile', file);

    try {
      await axios.post('http://localhost:3000/api/submissions', payload);

      setSubmitMessage('Success! Your paper has been submitted.');
      setFormData({ title: '' });
      setFile(null);
      document.getElementById('fileInput').value = '';

      // Refresh list
      fetchDashboardData();

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Error: ' + (error.response?.data?.error || 'Submission failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>

      {/* Left Col: Submission Form */}
      <div className="glass-card" style={{ alignSelf: 'start' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Submit New Paper</h2>
          <p style={{ color: 'var(--text-muted)' }}>Share your latest research.</p>
        </div>

        <form onSubmit={handlePaperSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label>Paper Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="The Future of AI..."
              required
            />
          </div>

          <div>
            <label>Upload PDF</label>
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  cursor: 'pointer'
                }}
                required
              />
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {file ? file.name : 'Click or Drag PDF'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ justifyContent: 'center' }}
          >
            {isSubmitting ? 'Submitting...' : <><FileText size={18} /> Submit Paper</>}
          </button>
        </form>

        {submitMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            background: submitMessage.includes('Success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${submitMessage.includes('Success') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: submitMessage.includes('Success') ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            {submitMessage.includes('Success') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {submitMessage}
          </div>
        )}
      </div>

      {/* Right Col: Dashboard info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Papers & Accommodations</h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading your data...</p>
          ) : myPapers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any papers yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myPapers.map(paper => {
                const hostelRequest = getHostelRequestForPaper(paper.id);

                return (
                  <div key={paper.id} style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{paper.title}</h3>
                      <span className={`status-badge status-${paper.status.toLowerCase()}`}>
                        {paper.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Submitted on {new Date(paper.submitted_at).toLocaleDateString()}
                    </p>

                    {/* Hostel Logic */}
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        <Bed size={16} color="var(--primary)" /> Hostel Accommodation
                      </h4>

                      {paper.status !== 'APPROVED' ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                          Your paper must be approved before you can request a hostel.
                        </p>
                      ) : !hostelRequest ? (
                        <div>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleHostelRequest(paper.id)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            Request Hostel
                          </button>
                        </div>
                      ) : hostelRequest.status === 'REQUESTED_BY_AUTHOR' || hostelRequest.status === 'FORWARDED_TO_HOSTEL' ? (
                        <p style={{ fontSize: '0.85rem', color: '#fbbf24', margin: 0 }}>
                          <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                          Request pending admin and hostel management approval.
                        </p>
                      ) : hostelRequest.status === 'APPROVED_BY_HOSTEL' ? (
                        <form onSubmit={(e) => handleHostelSubmitDetails(e, hostelRequest.id)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            Request Approved! Please provide your dates of stay.
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.8rem' }}>Check-in Date</label>
                              <input
                                type="date"
                                value={hostelDates.startDate}
                                onChange={(e) => setHostelDates({ ...hostelDates, startDate: e.target.value })}
                                required
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.8rem' }}>Check-out Date</label>
                              <input
                                type="date"
                                value={hostelDates.endDate}
                                onChange={(e) => setHostelDates({ ...hostelDates, endDate: e.target.value })}
                                required
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', alignSelf: 'flex-start' }}>Submit Stay Details</button>
                        </form>
                      ) : hostelRequest.status === 'SUBMITTED_BY_AUTHOR' ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Accommodation Confirmed</p>
                          <p style={{ margin: 0 }}><strong>Check-in:</strong> {new Date(hostelRequest.hostel_start_date).toLocaleDateString()}</p>
                          <p style={{ margin: 0 }}><strong>Check-out:</strong> {new Date(hostelRequest.hostel_end_date).toLocaleDateString()}</p>
                        </div>
                      ) : null}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
