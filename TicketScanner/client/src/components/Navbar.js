import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isAdmin, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Toggle body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          EventPass
        </Link>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
        
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/view-instructions" className="nav-link" onClick={closeMenu}>
              View Your Pass
            </Link>
          </li>
          
          {/* Only show Manage Passes for admin users */}
          {isAdmin && (
            <li className="nav-item">
              <Link to="/manage" className="nav-link" onClick={closeMenu}>
                Manage Passes
              </Link>
            </li>
          )}
          
          {/* Auth related links - Mobile View */}
          {isAuthenticated && isMenuOpen && (
            <>
              {isAdmin && (
                <li className="nav-item mobile-only">
                  <Link to="/manage" className="nav-link admin-nav-link" onClick={closeMenu}>
                    Admin
                  </Link>
                </li>
              )}
              <li className="nav-item mobile-only">
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
          
          {/* Login link for non-authenticated users */}
          {!isAuthenticated && (
            <li className="nav-item">
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
            </li>
          )}
          
          {/* Auth related links - Desktop View */}
          {isAuthenticated ? (
            <li className="nav-item desktop-only user-dropdown" ref={dropdownRef}>
              <button className="user-icon-btn" onClick={toggleDropdown}>
                <span className="user-icon">
                  <i className="user-avatar"></i>
                </span>
                {isAdmin && <span className="user-badge"></span>}
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {isAdmin && (
                    <div className="dropdown-admin-badge">Admin</div>
                  )}
                  <button onClick={handleLogout} className="dropdown-logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 