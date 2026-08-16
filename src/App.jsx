// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './Home';  // Import the Home page component
import About from './About'; // Import the About page component
import Pricing from './pages/Pricing';
import FeaturesPage from './pages/Features';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import './App.css'; // Import the CSS file
import Signin from './auth/Signin';
import Authentication from './api/OAuthSuccess';
import StateCheck from './api/StateCheck';
import Dashboard from './components/Dashboard';
import StudyRoom, { STUDY_ROOM_MAIN_CONTENT_CLASS } from './components/StudyRoom';
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
import BrainLoader from './components/BrainLoader';
import './api/OAuthSuccess.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-container">
        <BrainLoader size={80} label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

// AppContent wrapper to use location
function AppContent() {
  const location = useLocation();

  // Set default title if no page-specific title is set
  useEffect(() => {
    if (document.title === 'Vitse + React' || document.title === 'React App' || !document.title) {
      document.title = 'NeuroNote - Study Smarter, Not Harder';
    }
  }, [location.pathname]);

  const studyRoomMainClass =
    location.pathname.startsWith('/study-room') ? STUDY_ROOM_MAIN_CONTENT_CLASS : '';

  return (
    <>
      <main className={['main-content', studyRoomMainClass].filter(Boolean).join(' ')}>
        <Routes>
          <Route path='/auth/callback/' element={<Authentication />} />
          <Route path='/auth/state/' element={<StateCheck />} />
          <Route path="/" element={<Home />} /> {/* Home page route */}
          <Route path="/about" element={<About />} /> {/* About page route */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
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
            path="/quiz/:quizId/edit" 
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