import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalNotification from './components/GlobalNotification';
import PageLoader from './components/PageLoader';

const STUDY_ROOM_MAIN_CONTENT_CLASS = 'study-room-main-content';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FeaturesPage = lazy(() => import('./pages/Features'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Signin = lazy(() => import('./auth/Signin'));
const Authentication = lazy(() => import('./api/OAuthSuccess'));
const StateCheck = lazy(() => import('./api/StateCheck'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const StudyRoom = lazy(() => import('./components/StudyRoom'));
const StudyRoomPage = lazy(() => import('./pages/StudyRoom'));
const DeckContent = lazy(() => import('./components/DeckContent'));
const StudyDecks = lazy(() => import('./components/StudyDecks'));
const ReviewSession = lazy(() => import('./pages/ReviewSession'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const FocusPage = lazy(() => import('./pages/FocusPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const StudyGroups = lazy(() => import('./pages/StudyGroups'));
const Achievements = lazy(() => import('./pages/Achievements'));
const QuizCreatePage = lazy(() => import('./pages/QuizCreatePage'));
const QuizReviewPage = lazy(() => import('./pages/QuizReviewPage'));
const QuizTakePage = lazy(() => import('./pages/QuizTakePage'));
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'));
const NightOwlFlashcardsPage = lazy(() => import('./pages/NightOwlFlashcardsPage'));
const NotesEditorPage = lazy(() => import('./pages/NotesEditorPage'));
const NotificationSignup = lazy(() => import('./pages/NotificationSignup'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/auth/callback/' element={<Authentication />} />
          <Route path='/auth/state/' element={<StateCheck />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
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
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            }
          />
          <Route path='/signin' element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <FocusPage />
              </ProtectedRoute>
            }
          />
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
      </Suspense>
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
