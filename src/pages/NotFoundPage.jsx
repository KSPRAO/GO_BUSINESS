import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="notfound-viewport">
      <div className="notfound-message-block">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-text">Page not found</p>
        <Link to="/" className="notfound-home-link">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;