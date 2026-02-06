import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LandingPage from './components/landing/LandingPage';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'NeuroNote - Study Smarter, Not Harder';
  }, []);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard/');
    }
  }, [user, navigate]);

  return <LandingPage />;
}

export default Home;
