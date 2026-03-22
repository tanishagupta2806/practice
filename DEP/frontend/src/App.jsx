import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AuthorDashboard from './components/AuthorDashboard';
import AdminPanel from './components/AdminPanel';
import VolunteerForm from './components/VolunteerForm';
import Login from './components/Login';
import Signup from './components/Signup'; // [NEW]
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />

          <main className="container" style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Author Route */}
              <Route element={<ProtectedRoute allowedRoles={['AUTHOR']} />}>
                <Route path="/" element={<AuthorDashboard />} />
              </Route>

              {/* Protected Volunteer Route */}
              <Route element={<ProtectedRoute allowedRoles={['VOLUNTEER']} />}>
                <Route path="/volunteer" element={<VolunteerForm />} />
              </Route>

              {/* Protected Admin Route */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </main>

          <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 Conference Management Portal. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
