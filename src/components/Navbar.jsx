import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    navigate('/login');
  };

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          Go Business
        </Link>
        
        <nav className="nav-navigation">
          <Link to="/" className="nav-link">Home</Link>
        </nav>

        <div className="nav-actions">
          <button className="try-free-btn">Try for free</button>
          <button onClick={handleLogout} className="logout-btn">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;