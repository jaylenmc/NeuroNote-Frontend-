import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';

const NightOwlFlashcardsPage = () => {
  // Remove the global navbar if present
  useEffect(() => {
    const navbar = document.querySelector('.landing-navbar');
    if (navbar) navbar.style.display = 'none';
    return () => {
      if (navbar) navbar.style.display = '';
    };
  }, []);

  // Render Dashboard with flashcards view
  return (
    <div className="nightowl-page-shell">
      <Dashboard initialView="flashcards" />
    </div>
  );
};

export default NightOwlFlashcardsPage; 