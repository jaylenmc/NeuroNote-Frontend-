// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './Home';  // Import the Home page component
import About from './About'; // Import the About page component
import Pricing from './pages/Pricing';
import FeaturesPage from './pages/Features';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import './App.css'; // Import the CSS file
import Signin from './auth/Signin';
import Authentication from './api/OAuthSuccess';
import Dashboard from './components/Dashboard';
import StudyRoom from './components/StudyRoom';
import StudyRoomPage from './pages/StudyRoom';
import DeckContent from './components/DeckContent';
import { useAuth, AuthProvider } from './auth/AuthContext'; // or wherever it's defined
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalNotification from './components/GlobalNotification';
import StudyDecks from './components/StudyDecks';
import ReviewSession from './pages/ReviewSession';
import ReviewPage from './pages/ReviewPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import FocusPage from './pages/FocusPage';
import ProgressPage from './pages/ProgressPage';
import StudyGroups from './pages/StudyGroups';
import Achievements from './pages/Achievements';
import QuizCreatePage from './pages/QuizCreatePage';
import QuizReviewPage from './pages/QuizReviewPage';
import QuizTakePage from './pages/QuizTakePage';
import QuizResultsPage from './pages/QuizResultsPage';
import NightOwlFlashcardsPage from './pages/NightOwlFlashcardsPage';
import NotesEditorPage from './pages/NotesEditorPage';
import NotificationSignup from './pages/NotificationSignup';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const ownerEmail = 'jayzilla195@gmail.com';
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Additional safety check: verify user is the owner
  if (user.email && user.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Hide navbar on these routes
  const hideNavbarRoutes = ['/dashboard', '/signin', '/auth/callback/', '/study-room', '/review', '/chat', '/login', '/register', '/quiz', '/focus', '/progress', '/study-groups', '/achievements', '/notes-editor'];
  if (hideNavbarRoutes.some(route => location.pathname.startsWith(route))) {
    return null;
  }
  
  return (
    <nav className={`nn-navbar-global ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nn-logo">
        <img
          className="nn-logo-image"
          src="/NeuroNote Logo Transparent.png"
          alt="NeuroNote Logo"
        />
      </div>
      <div className="nn-nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About us</Link>
      </div>
      <div className="nn-nav-cta">
        {user ? (
          <>
            <Link to="/dashboard" className="nn-dashboard-btn">Dashboard</Link>
            <button onClick={logout} className="nn-signup-btn-minimal">Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="nn-login-btn">Log in</Link>
            <Link to="/signin" className="nn-signup-btn-minimal">Join waitlist</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// AppContent wrapper to use location
function AppContent() {
  const location = useLocation();
  const showNavbar = !['/dashboard', '/signin', '/auth/callback/', '/chat', '/login', '/register', '/quiz', '/progress', '/study-groups', '/achievements', '/notes-editor'].some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path='/auth/callback/' element={<Authentication />} />
          <Route path="/" element={<Home />} /> {/* Home page route */}
          <Route path="/about" element={<About />} /> {/* About page route */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/signup" element={<div>Sign Up Page</div>} />
          <Route path="/notification-signup" element={<NotificationSignup />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/folder/:folderId" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room" 
            element={
              <ProtectedRoute>
                <StudyRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room/deck/:deckId" 
            element={
              <ProtectedRoute>
                <DeckContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-room/decks" 
            element={
              <ProtectedRoute>
                <StudyDecks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/review-session" 
            element={
              <ProtectedRoute>
                <ReviewSession />
              </ProtectedRoute>
            } 
          />
          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          } />
          <Route path='/signin' element={ <Signin /> }/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } />
          <Route path="/focus" element={
            <ProtectedRoute>
              <FocusPage />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={<ProgressPage />} />
          <Route 
            path="/study-groups" 
            element={
              <ProtectedRoute>
                <StudyGroups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-groups/study-room/" 
            element={
              <ProtectedRoute>
                <StudyRoomPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/achievements" element={<Achievements />} />
          <Route 
            path="/quiz/create" 
            element={
              <ProtectedRoute>
                <QuizCreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/review" 
            element={
              <ProtectedRoute>
                <QuizReviewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/test" 
            element={
              <ProtectedRoute>
                <QuizTakePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz/:quizId/results" 
            element={
              <ProtectedRoute>
                <QuizResultsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/night-owl-flashcards" 
            element={
              <ProtectedRoute>
                <NightOwlFlashcardsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notes-editor" 
            element={
            <ProtectedRoute>
                <NotesEditorPage />
            </ProtectedRoute>
          }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
            <GlobalNotification />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;