import React, { useState, useMemo } from 'react';
import { FiFileText, FiEdit2, FiPlus, FiUpload, FiGrid, FiList, FiShare2, FiFolderPlus, FiSearch, FiBell, FiClock, FiX, FiSave, FiFolder, FiFile, FiBookOpen, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import { formatDateForDisplay } from '../utils/dateUtils';
import './FolderView.css';

// Helper function to calculate word count
const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Helper function to format saved time
const formatSavedTime = (savedDate) => {
    if (!savedDate) return 'Never saved';
    
    const now = new Date();
    const saved = new Date(savedDate);
    const diffInMs = now - saved;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDateForDisplay(savedDate);
};

const FolderView = ({
    selectedFolder,
    viewMode,
    setViewMode,
    showNewItemDropdown,
    setShowNewItemDropdown,
    handleAddItem,
    handleDeckClick,
    handleFolderClick,
    handleQuizClick,
    handleContextMenu,
    getFolderItemCount,
    setShowNewSubfolderModal,
    setSubfolderParentId
}) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showReminders, setShowReminders] = useState(false);
    const [showCreateReminder, setShowCreateReminder] = useState(false);
    const [newReminder, setNewReminder] = useState({
        title: '',
        description: '',
        dueDate: '',
        dueTime: ''
    });
    
    // Add/remove body class when modal opens/closes
    React.useEffect(() => {
        if (showReminders) {
            document.body.classList.add('reminders-modal-open');
        } else {
            document.body.classList.remove('reminders-modal-open');
        }
        
        return () => {
            document.body.classList.remove('reminders-modal-open');
        };
    }, [showReminders]);
    
    // Mock reminders data - in real app, this would come from props or API
    const folderReminders = selectedFolder.reminders || [
        {
            id: 1,
            title: "Review study materials",
            description: "Go through chapter 5 notes before the exam",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            completed: false
        },
        {
            id: 2,
            title: "Complete assignment",
            description: "Finish the research paper draft",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            completed: true
        }
    ];
    
    // Helper function to format reminder dates
    const formatReminderDate = (date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const diffInMs = reminderDate - now;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInMs < 0) {
            return 'Overdue';
        } else if (diffInDays === 0) {
            return 'Today';
        } else if (diffInDays === 1) {
            return 'Tomorrow';
        } else if (diffInDays < 7) {
            return `In ${diffInDays} days`;
        } else {
            return formatDateForDisplay(date);
        }
    };

    // Helper functions for reminder management
    const handleCreateReminder = () => {
        if (newReminder.title.trim() && newReminder.dueDate) {
            // In a real app, this would make an API call
            console.log('Creating reminder:', newReminder);
            
            // Reset form
            setNewReminder({
                title: '',
                description: '',
                dueDate: '',
                dueTime: ''
            });
            setShowCreateReminder(false);
        }
    };

    const handleReminderToggle = (reminderId) => {
        // In a real app, this would make an API call
        console.log('Toggling reminder:', reminderId);
    };

    const handleReminderDelete = (reminderId) => {
        // In a real app, this would make an API call
        console.log('Deleting reminder:', reminderId);
    };
    
    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return selectedFolder.items || [];
        }
        
        const query = searchQuery.toLowerCase().trim();
        return (selectedFolder.items || []).filter(item => {
            const title = item.title || item.name || '';
            const topic = item.topic || '';
            return title.toLowerCase().includes(query) || 
                   topic.toLowerCase().includes(query);
        });
    }, [selectedFolder.items, searchQuery]);
    
    const handleCreateDocument = () => {
        // Create a new document and redirect to notes editor
        const newDocument = {
            id: Date.now(),
            title: 'Untitled Document',
            type: 'document',
            created_at: new Date().toISOString()
        };
        // Navigate to notes editor with document data and folderId
        navigate('/notes-editor', { state: { openNotes: true, document: newDocument, folderId: selectedFolder.id } });
    };
    if (!selectedFolder) return null;

    const renderFolderItems = (folder) => {
        const hasItems = Array.isArray(folder.items) && folder.items.length > 0;
        const hasSubfolders = Array.isArray(folder.sub_folders) && folder.sub_folders.length > 0;

        if (!hasItems && !hasSubfolders) {
            return (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">📁</div>
                        <h3>This folder is empty</h3>
                        <p>Create your first document, deck, or quiz to get started</p>
                        <div className="empty-state-actions">
                            <button 
                                className="empty-state-btn primary"
                                onClick={handleCreateDocument}
                            >
                                <FiFileText /> Create Document
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => {
                                    setSubfolderParentId(folder.id);
                                    setShowNewSubfolderModal(true);
                                }}
                            >
                                <FiFolder size={14} /> Create Subfolder
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => handleAddItem(folder.id, 'deck')}
                            >
                                <FiBookOpen size={14} /> Import Deck
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => handleAddItem(folder.id, 'quiz')}
                            >
                                <FiFile size={14} /> Import Quiz
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Show search results or no results message (for documents/quizzes/decks)
        if (filteredItems.length === 0 && searchQuery.trim() && hasItems) {
            return (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No items found</h3>
                        <p>No items match "{searchQuery}"</p>
                        <button 
                            className="empty-state-btn"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear search
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="folderview-items">
                {hasSubfolders && (
                    <div className="folderview-subfolders">
                        {folder.sub_folders.map(sf => (
                            <div 
                                key={sf.id} 
                                className="folder-item folder-item--subfolder"
                                onClick={(e) => handleFolderClick(sf.id, e)}
                                onContextMenu={(e) => handleContextMenu(e, 'folder', sf.id)}
                            >
                                <div className="folder-item__icon">
                                    <FiFolder size={16} />
                                </div>
                                <div className="folder-item__content">
                                    <h3 className="folder-item__title">{sf.name}</h3>
                                </div>
                                <div className="folder-item__right-section">
                                    <div className="subfolder-notification-badge">
                                        Reminders: {Math.floor(Math.random() * 5) + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredItems.map(item => (
                    <div 
                        key={item.id} 
                        className={`folder-item folder-item--${item.type}`}
                        onClick={(e) => {
                            if (item.type === 'document') {
                                // Navigate to notes editor with existing document, include folder id in state
                                navigate('/notes-editor', { state: { openNotes: true, document: { ...item, folder: selectedFolder.id } } });
                            } else if (item.type === 'deck') {
                                handleDeckClick(item.id, e);
                            } else if (item.type === 'quiz') {
                                handleQuizClick(item.id, e);
                            }
                        }}
                        onContextMenu={(e) => handleContextMenu(e, item.type, item.id)}
                    >
                        <div className="folder-item__icon">
                            {item.type === 'document' && <FiFileText size={16} />}
                            {item.type === 'deck' && <FiBookOpen size={16} />}
                            {item.type === 'quiz' && <FiFile size={16} />}
                        </div>
                        
                        <div className="folder-item__content">
                            <h3 className="folder-item__title">
                                {item.type === 'document' ? item.title : 
                                 item.type === 'deck' ? item.name : item.topic}
                            </h3>
                        </div>
                        
                        <div className="folder-item__right-section">
                            <div className="folder-item__meta">
                                {item.type === 'document' && (
                                    <>
                                        <span className="folder-item__meta-item meta-time">{formatSavedTime(item.saved)}</span>
                                        <span className="folder-item__meta-dot">•</span>
                                        <span className="folder-item__meta-item meta-words">{getWordCount(item.notes)} words</span>
                                    </>
                                )}
                                {item.type === 'deck' && (
                                    <>
                                        <span className="folder-item__meta-item meta-cards">{item.cardCount || 0} cards</span>
                                        <span className="folder-item__meta-dot">•</span>
                                        <span className="folder-item__meta-item meta-mastery">80% mastered</span>
                                    </>
                                )}
                                {item.type === 'quiz' && (
                                    <>
                                        <span className="folder-item__meta-item meta-questions">15 questions</span>
                                        <span className="folder-item__meta-dot">•</span>
                                        <span className="folder-item__meta-item meta-score">Score: 85%</span>
                                    </>
                                )}
                            </div>
                            
                            <div className="folder-item__actions">
                                <button 
                                    className="folder-item__action"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Share action
                                    }}
                                    title="Share"
                                >
                                    <FiShare2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="folder-view">
            <div className="folder-header">
                <div className="folder-header-top">
                    <div className="folder-info">
                        <div className="folder-title-section">
                            <div className="folder-title-with-icon">
                                <span className="folder-icon">📂</span>
                                <h2 className="folder-title">
                                    {Array.isArray(selectedFolder.ancestor_names) && selectedFolder.ancestor_names.length > 0
                                        ? `${selectedFolder.ancestor_names.join(' / ')} / ${selectedFolder.name}`
                                        : (selectedFolder.parent_name ? `${selectedFolder.parent_name} / ${selectedFolder.name}` : selectedFolder.name)
                                    }
                                </h2>
                            </div>
                            <p className="folder-subtitle">Categorized notes, all in one place.</p>
                        </div>
                    </div>
                    <div className="folder-actions">
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button
                                        className="search-clear"
                                        onClick={() => setSearchQuery('')}
                                        title="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    <div className="new-item-container">
                        <button 
                            className="new-item-btn"
                            onClick={() => setShowNewItemDropdown(!showNewItemDropdown)}
                        >
                            <FiPlus /> New
                        </button>
                        {showNewItemDropdown && (
                            <div className="new-item-dropdown">
                                <button onClick={handleCreateDocument}>
                                    <FiFileText /> Document
                                </button>
                                <button onClick={() => {
                                    setSubfolderParentId(selectedFolder.id);
                                    setShowNewSubfolderModal(true);
                                    setShowNewItemDropdown(false);
                                }}>
                                    <FiFolder size={14} /> Subfolder
                                </button>
                                <button onClick={() => handleAddItem(selectedFolder.id, 'deck')}>
                                    <FiBookOpen size={14} /> Import Deck
                                </button>
                                <button onClick={() => handleAddItem(selectedFolder.id, 'quiz')}>
                                    <FiFile size={14} /> Import Quiz
                                </button>
                                <button onClick={() => document.getElementById('file-upload').click()}>
                                    <FiUpload /> Upload File
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                </div>
                <div className="folder-stats">
                    <div className="folder-stats-grid">
                        <div className="folder-stat-item">
                            <div className="folder-stat-icon">📄</div>
                            <div className="folder-stat-content">
                                <div className="folder-stat-value">{getFolderItemCount(selectedFolder)}</div>
                                <div className="folder-stat-label">Documents</div>
                            </div>
                        </div>
                        <div className="folder-stat-item">
                            <div className="folder-stat-icon">⏰</div>
                            <div className="folder-stat-content">
                                <div className="folder-stat-value">2 days</div>
                                <div className="folder-stat-label">Recently Edited</div>
                            </div>
                        </div>
                        <div className="folder-stat-item">
                            <div className="folder-stat-icon">📝</div>
                            <div className="folder-stat-content">
                                <div className="folder-stat-value">482</div>
                                <div className="folder-stat-label">Avg. Words Per Note</div>
                            </div>
                        </div>
                        <div className="folder-stat-item">
                            <div className="folder-stat-icon">📌</div>
                            <div className="folder-stat-content">
                                <div className="folder-stat-value">
                                    <a
                                        href={`/notes/${selectedFolder.id ?? 'demo-folder'}/note/chemistry-midterm-review`}
                                        className="folder-stat-link"
                                    >
                                        Chemistry Midterm Review
                                    </a>
                                </div>
                                <div className="folder-stat-label">Most Active Note</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {renderFolderItems(selectedFolder)}
            
            {/* Reminders Modal */}
            {showReminders && (
                <div className="reminders-modal-overlay" onClick={() => {
                    document.body.classList.remove('reminders-modal-open');
                    setShowReminders(false);
                    setShowCreateReminder(false);
                }}>
                    <div className="reminders-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="reminders-modal-header">
                            <div className="reminders-header-content">
                                <h3>{showCreateReminder ? 'Create New Reminder' : 'Folder Reminders'}</h3>
                                {!showCreateReminder && <span className="reminders-count">{folderReminders.length} reminders</span>}
                            </div>
                            <div className="reminders-header-actions">
                                {!showCreateReminder && (
                                    <button 
                                        className="add-reminder-header-btn"
                                        onClick={() => setShowCreateReminder(true)}
                                    >
                                        <FiPlus /> Add Reminder
                                    </button>
                                )}
                                {showCreateReminder && (
                                    <>
                                        <button 
                                            className="cancel-btn-header"
                                            onClick={() => {
                                                setShowCreateReminder(false);
                                                setNewReminder({
                                                    title: '',
                                                    description: '',
                                                    dueDate: '',
                                                    dueTime: ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="save-reminder-btn-header"
                                            onClick={handleCreateReminder}
                                            disabled={!newReminder.title.trim() || !newReminder.dueDate}
                                        >
                                            <FiSave /> Create Reminder
                                        </button>
                                    </>
                                )}
                                {!showCreateReminder && (
                                    <button 
                                        className="reminders-close-btn"
                                        onClick={() => {
                                            document.body.classList.remove('reminders-modal-open');
                                            setShowReminders(false);
                                            setShowCreateReminder(false);
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="reminders-content">
                            {showCreateReminder ? (
                                <div className="create-reminder-form">
                                    <div className="form-fields">
                                        <div className="form-group">
                                            <label htmlFor="reminder-title">Title *</label>
                                            <input
                                                id="reminder-title"
                                                type="text"
                                                placeholder="Enter reminder title..."
                                                value={newReminder.title}
                                                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="reminder-description">Description</label>
                                            <textarea
                                                id="reminder-description"
                                                placeholder="Enter reminder description (optional)..."
                                                value={newReminder.description}
                                                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="reminder-date">Due Date *</label>
                                                <input
                                                    id="reminder-date"
                                                    type="date"
                                                    value={newReminder.dueDate}
                                                    onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="reminder-time">Due Time</label>
                                                <input
                                                    id="reminder-time"
                                                    type="time"
                                                    value={newReminder.dueTime}
                                                    onChange={(e) => setNewReminder({...newReminder, dueTime: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {folderReminders.length === 0 ? (
                                        <div className="reminders-empty">
                                            <div className="reminders-empty-icon">🔔</div>
                                            <h4>No reminders set</h4>
                                            <p>Create your first reminder to stay on track with this folder's tasks.</p>
                                            <button 
                                                className="add-reminder-btn"
                                                onClick={() => setShowCreateReminder(true)}
                                            >
                                                <FiPlus /> Add Your First Reminder
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="reminders-list">
                                            {folderReminders.map(reminder => (
                                                <div 
                                                    key={reminder.id} 
                                                    className={`reminder-item ${reminder.completed ? 'completed' : ''}`}
                                                >
                                                    <div className="reminder-checkbox">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={reminder.completed}
                                                            onChange={() => handleReminderToggle(reminder.id)}
                                                        />
                                                    </div>
                                                    <div className="reminder-content">
                                                        <div className="reminder-header">
                                                            <h4 className="reminder-title">{reminder.title}</h4>
                                                            <div className="reminder-actions">
                                                                <span className={`reminder-date ${reminder.completed ? 'completed' : ''}`}>
                                                                    <FiClock size={14} />
                                                                    {formatReminderDate(reminder.dueDate)}
                                                                </span>
                                                                <button 
                                                                    className="delete-reminder-btn"
                                                                    onClick={() => handleReminderDelete(reminder.id)}
                                                                    title="Delete reminder"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {reminder.description && (
                                                            <p className="reminder-description">{reminder.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolderView; 