import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Shield, Users, Menu, X, LogIn, LogOut, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <GraduationCap className="logo-icon" size={28} />
          IIT Ropar Conference Management
        </Link>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>

          {/* Show these only if logged in as AUTHOR */}
          {user && user.role === 'AUTHOR' && (
            <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => setIsOpen(false)}>
              <Home size={18} />
              Submit Paper
            </Link>
          )}

          {/* Show these only if logged in as VOLUNTEER */}
          {user && user.role === 'VOLUNTEER' && (
            <Link to="/volunteer" className={`nav-item ${isActive('/volunteer')}`} onClick={() => setIsOpen(false)}>
              <Users size={18} />
              Volunteer
            </Link>
          )}

          {/* Show Admin link only if logged in as Admin */}
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className={`nav-item ${isActive('/admin')}`} onClick={() => setIsOpen(false)}>
              <Shield size={18} />
              Admin
            </Link>
          )}

          {user ? (
            <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={`nav-item ${isActive('/login')}`} onClick={() => setIsOpen(false)}>
                <LogIn size={18} />
                Sign In
              </Link>
              <Link to="/signup" className={`nav-item ${isActive('/signup')}`} onClick={() => setIsOpen(false)}>
                <LogIn size={18} />
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--primary); /* Academic Blue */
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          letter-spacing: 0.5px;
        }

        .logo-icon {
          color: var(--accent); /* Gold accent */
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          transition: var(--transition);
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active-link {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          font-weight: 600;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--primary);
            flex-direction: column;
            padding: 2rem;
            gap: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
            transition: var(--transition);
          }

          .nav-links.open {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }
      `}</style>
    </nav>
  );
}
