import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowLeft, MessageCircle, Play, Pause, RotateCcw, Settings, Coffee, Timer, Zap, FileText, Lock } from 'lucide-react';
import {
  fetchAllResources,
  createPdfResource,
  uploadPdfToRailway,
  getPdfPresignedUrl,
  createLink,
  getLink,
  deletePdf,
  deleteLink,
  normalizePinnedResources,
} from '../api/resourcesApi';
import StudyRoomResourcePreview from './StudyRoomResourcePreview';
import './StudyRoom.css';

/** Class added to `<main className="main-content">` in App.jsx on Study Room routes. */
export const STUDY_ROOM_MAIN_CONTENT_CLASS = 'study-room-main-content';

const STUDY_ROOM_PINNED_CACHE_KEY = 'study-room-pinned-resources-v2';
const EMPTY_PINNED_RESOURCES = { pdfs: [], links: [] };

const readPinnedResourcesCache = () => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem(STUDY_ROOM_PINNED_CACHE_KEY);
    if (!raw) return null;
    return normalizePinnedResources(JSON.parse(raw));
  } catch {
    return null;
  }
};

const writePinnedResourcesCache = (value) => {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(
      STUDY_ROOM_PINNED_CACHE_KEY,
      JSON.stringify(normalizePinnedResources(value)),
    );
  } catch {
    // Ignore storage failures and continue with runtime state.
  }
};

const tools = [
  { icon: null, label: 'Decks', route: '/study-room/decks', color: '#7c83fd', materialIcon: 'stacks' },
  { icon: null, label: 'Quiz', route: '/quiz', color: '#4ecdc4', materialIcon: 'quiz' },
  { icon: null, label: 'Focus', route: '/focus', color: '#3b82f6', materialIcon: 'track_changes' }, // blue, locked card
  { icon: null, label: 'Review', route: '/review', color: '#f59e0b', materialIcon: 'cognition_2' },
  { icon: null, label: 'Progress', route: '/progress', color: '#22c55e', materialIcon: 'azm' }, // green
  { icon: null, label: 'Ask NeuroNote', route: '/chat', color: '#06B6D4', materialIcon: 'forum' },
];

const mockTasks = [
  { id: 1, text: 'Read Chapter 5: Neurotransmitters', done: false },
  { id: 2, text: 'Summarize lecture notes', done: false },
  { id: 3, text: 'Complete flashcard review', done: false },
  { id: 4, text: 'Practice quiz: Synapses', done: false },
];

const mockResources = [
  // Empty resources array - no stock data
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const phaseMeta = {
  pomodoro: { label: 'Focus', color: '#ef4444', icon: <Timer size={22} /> },
  break: { label: 'Short Break', color: '#10b981', icon: <Coffee size={22} /> },
  longBreak: { label: 'Long Break', color: '#3b82f6', icon: <Zap size={22} /> },
};

const StudyRoom = () => {
    const navigate = useNavigate();
  const cachedPinnedResources = readPinnedResourcesCache();
  const [tasks, setTasks] = useState(mockTasks);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [resources, setResources] = useState(mockResources);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Import modal state
  const [importStep, setImportStep] = useState('select');
  const [selectedType, setSelectedType] = useState(null);
  const [importValue, setImportValue] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importLinkTitle, setImportLinkTitle] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pinnedResources, setPinnedResources] = useState(cachedPinnedResources || EMPTY_PINNED_RESOURCES);
  const [isLoadingPinnedResources, setIsLoadingPinnedResources] = useState(!cachedPinnedResources);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState(null);
  const [overlayType, setOverlayType] = useState(null);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const { showNotification } = useNotification();

  // Pomodoro timer state
  const [phase, setPhase] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);

  useEffect(() => {
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  }, [phase, pomodoroTime, breakTime, longBreakTime]);

    useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      handleTimerComplete();
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Fetch pinned resources on component mount
  useEffect(() => {
    fetchPinnedResources();
  }, []);

  useEffect(() => {
    writePinnedResourcesCache(pinnedResources);
  }, [pinnedResources]);

  const fetchPinnedResources = async () => {
    try {
      const data = await fetchAllResources();
      setPinnedResources(normalizePinnedResources(data));
    } catch (error) {
      console.error('Error fetching pinned resources:', error);
    } finally {
      setIsLoadingPinnedResources(false);
    }
  };

  const handleTimerComplete = () => {
    if (phase === 'pomodoro') {
      setCompletedPomodoros(c => c + 1);
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  };
  const handleSkip = () => {
    setIsRunning(false);
    if (phase === 'pomodoro') {
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
  };

  const handleTaskToggle = (id) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  // Settings handlers
  const handleSettingsChange = (setter) => (e) => setter(Number(e.target.value));

  const handlePinToggle = (id) => {
    setResources(resources => resources.map(r =>
      r.id === id ? { ...r, pinned: !r.pinned } : r
    ));
  };

  const resourceTypes = [
    { key: 'pdf', label: 'PDF', icon: <FileText color="#f56565" size={22} /> },
    { key: 'link', label: 'Link', icon: <MessageCircle color="#4ecdc4" size={22} /> },
  ];

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportStep('select');
    setSelectedType(null);
    setImportValue('');
    setImportFile(null);
    setImportLinkTitle('');
  };

  const handleImportResource = async () => {
    try {
      setIsImporting(true);

      if (selectedType === 'pdf') {
        if (!importFile) {
          alert('Please select a PDF file to upload');
          return;
        }

        if (!importFile.name.toLowerCase().endsWith('.pdf')) {
          alert('Please select a PDF file');
          return;
        }

        const presignedData = await createPdfResource(importFile.name);
        await uploadPdfToRailway({
          url: presignedData.url,
          fields: presignedData.fields,
          file: importFile,
        });

        await fetchPinnedResources();
        setSuccessMessage('PDF imported and pinned successfully!');
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else if (selectedType === 'link') {
        if (!importValue.trim()) {
          alert('Please enter a valid link');
          return;
        }

        if (!importLinkTitle.trim()) {
          alert('Please enter a title for the link');
          return;
        }

        await createLink({
          title: importLinkTitle.trim(),
          link: importValue.trim(),
        });

        await fetchPinnedResources();
        setSuccessMessage('Link pinned successfully!');
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }

      resetImportModal();
    } catch (error) {
      console.error('Error importing resource:', error);
      const message =
        error.response?.data?.Error ||
        error.response?.data?.detail ||
        error.message ||
        'Error importing resource. Please try again.';
      alert(typeof message === 'string' ? message : 'Error importing resource. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleUnpinResource = async (resourceId, resourceType) => {
    try {
      if (resourceType === 'pdf') {
        await deletePdf(resourceId);
      } else if (resourceType === 'link') {
        await deleteLink(resourceId);
      }

      setPinnedResources((prev) => ({
        pdfs: resourceType === 'pdf' ? prev.pdfs.filter((pdf) => pdf.id !== resourceId) : prev.pdfs,
        links: resourceType === 'link' ? prev.links.filter((link) => link.id !== resourceId) : prev.links,
      }));
      setSuccessMessage('Resource unpinned successfully!');
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      console.error('Error unpinning resource:', error);
      alert('Error unpinning resource: ' + (error.response?.data?.Error || error.message));
    }
  };

  const handleResourceClick = async (resource, resourceType) => {
    try {
      setIsLoadingOverlay(true);
      setOverlayType(resourceType);

      if (resourceType === 'pdf') {
        const presignedUrl = await getPdfPresignedUrl(resource.object_name);
        setOverlayContent({
          ...resource,
          file_url: presignedUrl,
        });
        setShowOverlay(true);
      } else if (resourceType === 'link') {
        const linkData = await getLink(resource.id);
        setOverlayContent(linkData);
        setShowOverlay(true);
      }
    } catch (error) {
      console.error('Error fetching resource content:', error);
      alert('Error loading resource: ' + (error.response?.data?.Error || error.message));
    } finally {
      setIsLoadingOverlay(false);
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayContent(null);
    setOverlayType(null);
  };

  const showComingSoonNotification = () => {
    showNotification('Coming Soon!');
  };

    return (
    <div className="study-room">
            <div className="study-room-header">
        <div className="study-room-buttons-container">
            <div className="header-left">
            <button className="study-room-back-button" onClick={() => navigate('/night-owl-flashcards')}>
                <ArrowLeft size={20} />
                Back to Flashcards
            </button>
            </div>
            <div className="header-right">
                <div className="header-controls">
                    {/* <button className="study-room-timer-button" onClick={() => setShowPomodoro(s => !s)} title="Pomodoro Timer">
                      <Timer size={20} />
                    </button> */}
                </div>
            </div>
            </div>

        <div className="header-center">
          <h1>Study Room</h1>
        </div>
      </div>
      <div className="study-room-subtitle">
        Get started by choosing what study tool you'd like to work with today.
      </div>
      
      {/* Success Message */}
      {importSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 3000,
          animation: 'slideInRight 0.3s ease'
        }}>
          {successMessage}
        </div>
      )}

      
      <div className="study-room-grid">
                {tools.map((tool, index) => {
          const isFocusCard = tool.label === 'Focus';
          const isProgressCard = tool.label === 'Progress';
          const isLocked = isFocusCard || isProgressCard;
          return (
            <div 
              key={index} 
              className={`study-room-card ${isLocked ? 'locked' : ''}`} 
              onClick={isLocked ? showComingSoonNotification : () => navigate(tool.route)} 
              style={{ cursor: 'pointer' }}
            >
              {isLocked && (
                <div className="lock-overlay">
                  <Lock size={16} color="#ff6b6b" />
                </div>
              )}
              {tool.materialIcon ? (
                <span className="material-symbols-outlined study-room-card-quiz-icon">{tool.materialIcon}</span>
              ) : (
                React.cloneElement(tool.icon, { color: tool.color })
              )}
              <span>{tool.label}</span>
            </div>
          );
        })}
            </div>
      {/* Pinned Notes & Resources Section */}
      <div className="pinned-resources-section">
        <div className="pinned-resources-header">
          <h3>Pinned Resources</h3>
          {!showOverlay && (
            <button 
              className="study-room-ghost-button" 
              onClick={() => {
                setShowImportModal(true);
              }} 
              style={{ 
                fontSize: 15, 
                padding: '8px 18px',
                position: 'relative',
                zIndex: 1000,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              Import Resource
            </button>
          )}
        </div>
        <div className="pinned-resources-grid">
          {isLoadingPinnedResources ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a0aec0' }}>
              Loading pinned resources...
            </div>
          ) : pinnedResources.pdfs.length === 0 && pinnedResources.links.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a0aec0' }}>
              No pinned resources yet. Add some to keep them handy!
            </div>
          ) : (
            <>
              {pinnedResources.pdfs.map((pdf) => (
                <div key={`pdf-${pdf.id}`} className="pinned-resource-card pinned" onClick={() => handleResourceClick(pdf, 'pdf')}>
                  <div className="pinned-resource-title">
                    <span className="icon-span study-room-pinned-resource-pdf-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256" aria-hidden="true">
                        <g fill="#3b82f6" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10">
                          <g transform="scale(8.53333,8.53333)">
                            <path d="M24.707,8.793l-6.5,-6.5c-0.188,-0.188 -0.442,-0.293 -0.707,-0.293h-10.5c-1.105,0 -2,0.895 -2,2v22c0,1.105 0.895,2 2,2h16c1.105,0 2,-0.895 2,-2v-16.5c0,-0.265 -0.105,-0.519 -0.293,-0.707zM18,10c-0.552,0 -1,-0.448 -1,-1v-5.096l6.096,6.096z" />
                          </g>
                        </g>
                      </svg>
                    </span>
                    <span className="title-text" title={pdf.object_name || 'Untitled PDF'}>
                      {pdf.object_name || 'Untitled PDF'}
                    </span>
                  </div>
                  <div className="pinned-resource-actions">
                    <button
                      className="pinned-resource-pin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinResource(pdf.id, 'pdf');
                      }}
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              ))}

              {pinnedResources.links.map((link) => (
                <div key={`link-${link.id}`} className="pinned-resource-card pinned" onClick={() => handleResourceClick(link, 'link')}>
                  <div className="pinned-resource-title">
                    <span className="icon-span" style={{ fontSize: 28, color: '#10b981' }}>
                      <MessageCircle size={28} />
                    </span>
                    <span className="title-text" title={link.title || 'Untitled Link'}>
                      {link.title || 'Untitled Link'}
                    </span>
                  </div>
                  <div className="pinned-resource-actions">
                    <button
                      className="pinned-resource-pin-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnpinResource(link.id, 'link');
                      }}
                    >
                      Unpin
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
                        </div>
      {/* Import Modal */}
      {showImportModal && (
        <div className="study-room-import-modal-overlay">
          <div className="study-room-import-modal-content">
            {importStep === 'select' && (
              <>
                <div className="study-room-import-header">
                  <h3 className="study-room-import-modal-title">Import Resource</h3>
                  <p className="study-room-import-modal-description">Choose the type of resource to import:</p>
                </div>
                <div className="study-room-import-modal-buttons-grid">
                  {resourceTypes.map((rt) => (
                    <button
                      key={rt.key}
                      className={`study-room-import-modal-button ${selectedType === rt.key ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedType(rt.key);
                        setImportStep('input');
                      }}
                    >
                      {rt.icon}
                      {rt.label}
                    </button>
                  ))}
                </div>
                <button className="study-room-import-modal-cancel-button" onClick={() => setShowImportModal(false)}>Cancel</button>
              </>
            )}
            {importStep === 'input' && selectedType && (
              <>
                <div className="study-room-import-modal-header">
                  <button className="study-room-import-modal-back-button" onClick={() => { setImportStep('select'); setSelectedType(null); setImportValue(''); setImportFile(null); setImportLinkTitle(''); }}>← Back</button>
                  <h3 className="study-room-import-modal-title">{resourceTypes.find(rt => rt.key === selectedType)?.label}</h3>
                </div>
                {selectedType === 'pdf' && (
                  <div>
                    <label className="study-room-import-modal-file-upload">
                      <span className="study-room-import-modal-file-upload-text">Click to upload or drag & drop</span>
                      <span className="study-room-import-modal-file-upload-subtext">
                        PDF files only
                      </span>
                      <input
                        type="file"
                        className="study-room-import-modal-file-input"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setImportFile(e.target.files[0])}
                      />
                    </label>
                    {importFile && (
                      <div style={{
                        fontSize: '12px',
                        color: '#a0aec0',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <FileText size={14} />
                        {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                )}
                {selectedType === 'link' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Enter link title (e.g., 'Neuroscience Basics')"
                      value={importLinkTitle}
                      onChange={e => setImportLinkTitle(e.target.value)}
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                    />
                    <input
                      type="url"
                      placeholder="Paste a link (https://...)"
                      value={importValue}
                      onChange={e => setImportValue(e.target.value)}
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                    />
                  </div>
                )}
                <button
                  className="study-room-import-modal-action-button"
                  onClick={handleImportResource}
                  disabled={isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Timer & Tasks Panel (toggleable modal) */}
      {showPomodoro && <div className="pomodoro-overlay" />}
      {showPomodoro && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: 420,
          height: '100vh',
          background: 'rgba(28,28,38,0.98)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
          zIndex: 1002,
          padding: '32px 24px',
          overflowY: 'auto',
          borderLeft: '1.5px solid #23272f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideInRight 0.25s',
        }}>
          <button className="study-room-ghost-button" style={{ position: 'absolute', top: 18, right: 18, zIndex: 1003 }} onClick={() => setShowPomodoro(false)}>
            ×
          </button>
          <div style={{ width: '100%', maxWidth: 380 }}>
            {/* Pomodoro timer panel content (copy from previous focus-timer-panel) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: phaseMeta[phase].color }}>{phaseMeta[phase].icon}</span>
                <span style={{ color: phaseMeta[phase].color, fontWeight: 600, fontSize: 18 }}>{phaseMeta[phase].label}</span>
                <span style={{ color: '#a0aec0', fontSize: 15, marginLeft: 8 }}>{completedPomodoros} / {longBreakInterval}</span>
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: phaseMeta[phase].color, letterSpacing: 2, fontFamily: 'Courier New, monospace', marginBottom: 8 }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', borderRadius: 3, background: phaseMeta[phase].color, width: `${100 - (timeLeft / (phase === 'pomodoro' ? pomodoroTime * 60 : phase === 'break' ? breakTime * 60 : longBreakTime * 60)) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {isRunning ? (
                  <button className="pomodoro-btn" onClick={handlePause}><Pause size={18} />Pause</button>
                ) : (
                  <button className="pomodoro-btn" onClick={handleStart}><Play size={18} />Start</button>
                )}
                <button className="pomodoro-btn" onClick={handleReset}><RotateCcw size={18} />Reset</button>
                <button className="pomodoro-btn" onClick={handleSkip}>Skip</button>
                <button className="pomodoro-btn" onClick={() => setShowSettings(s => !s)}><Settings size={16} /></button>
              </div>
            </div>
            {showSettings && (
              <div className="pomodoro-settings" style={{ margin: '24px auto 0', maxWidth: 340, background: '#18181b', borderRadius: 16, border: '1px solid #23272f', color: '#fff', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Pomodoro Settings</h3>
                  <button className="pomodoro-btn" style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label>Focus Time (min)
                    <input type="number" min={1} max={120} value={pomodoroTime} onChange={handleSettingsChange(setPomodoroTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Short Break (min)
                    <input type="number" min={1} max={30} value={breakTime} onChange={handleSettingsChange(setBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break (min)
                    <input type="number" min={1} max={60} value={longBreakTime} onChange={handleSettingsChange(setLongBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break Interval
                    <input type="number" min={1} max={10} value={longBreakInterval} onChange={handleSettingsChange(setLongBreakInterval)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                </div>
              </div>
            )}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 12, textAlign: 'left' }}>Today's Focus Tasks</h3>
              <ul className="focus-tasks-list">
                {tasks.map(task => (
                  <li key={task.id} className={`focus-task-item${task.done ? ' checked' : ''}`}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                      <input
                        type="checkbox"
                        className="focus-task-checkbox"
                        checked={task.done}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <span className="focus-task-label">{task.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            </div>
        </div>
      )}
      
      {showOverlay && (
        <StudyRoomResourcePreview
          isLoading={isLoadingOverlay}
          overlayType={overlayType}
          overlayContent={overlayContent}
          onClose={closeOverlay}
        />
      )}
      
        </div>
    );
};

export default StudyRoom; 