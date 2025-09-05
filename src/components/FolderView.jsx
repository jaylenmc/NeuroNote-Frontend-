import React from 'react';
import { FiFileText, FiEdit2, FiPlus, FiUpload, FiGrid, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import deckIcon from '../assets/deck.svg';
import testIcon from '../assets/test.svg';
import { formatDateForDisplay } from '../utils/dateUtils';
import './FolderView.css';

const FolderView = ({
    selectedFolder,
    viewMode,
    setViewMode,
    showNewItemDropdown,
    setShowNewItemDropdown,
    handleAddItem,
    handleDeckClick,
    handleQuizClick,
    handleContextMenu,
    getFolderItemCount
}) => {
    const navigate = useNavigate();
    
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
        if (!folder.items || folder.items.length === 0) {
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
                                onClick={() => handleAddItem(folder.id, 'deck')}
                            >
                                <img src={deckIcon} alt="deck" /> Import Deck
                            </button>
                            <button 
                                className="empty-state-btn"
                                onClick={() => handleAddItem(folder.id, 'quiz')}
                            >
                                <img src={testIcon} alt="quiz" /> Import Quiz
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="folderview-items">
                {folder.items.map(item => (
                    <div 
                        key={item.id} 
                        className={`folderview-item-card ${item.type}`}
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
                        <div className="card-header">
                            <div className="card-icon">
                                {item.type === 'document' && <FiFileText />}
                                {item.type === 'deck' && <img src={deckIcon} alt="deck" />}
                                {item.type === 'quiz' && <img src={testIcon} alt="quiz" />}
                            </div>
                            <div className="card-actions">
                                <button 
                                    className="card-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Edit action
                                    }}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="card-action-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Share action
                                    }}
                                    title="Share"
                                >
                                    🔗
                                </button>
                                <button 
                                    className="card-action-btn delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Delete action
                                    }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <h4 className="card-title">
                                {item.type === 'document' ? item.title : 
                                 item.type === 'deck' ? item.name : item.topic}
                            </h4>
                            {item.type === 'document' && (
                                <p className="card-preview">
                                    "This is a preview of the document content. It shows the first few lines to give you a quick overview of what's inside..."
                                </p>
                            )}
                            {item.type === 'deck' && (
                                <p className="card-preview">
                                    Study deck with {item.cardCount || 0} flashcards covering key concepts and definitions.
                                </p>
                            )}
                            {item.type === 'quiz' && (
                                <p className="card-preview">
                                    Quiz on {item.subject} with multiple choice and short answer questions.
                                </p>
                            )}
                        </div>
                        <div className="card-footer">
                            {item.type === 'document' && (
                                <div className="card-metadata">
                                    <span className="metadata-item">Last edited 2 days ago</span>
                                    <span className="metadata-separator">•</span>
                                    <span className="metadata-item">Word count: 524</span>
                                </div>
                            )}
                            {item.type === 'deck' && (
                                <div className="card-metadata">
                                    <span className="metadata-item">{item.cardCount || 0} cards</span>
                                    <span className="metadata-separator">•</span>
                                    <span className="metadata-item">Last studied 1 day ago</span>
                                </div>
                            )}
                            {item.type === 'quiz' && (
                                <div className="card-metadata">
                                    <span className="metadata-item">15 questions</span>
                                    <span className="metadata-separator">•</span>
                                    <span className="metadata-item">Last taken 3 days ago</span>
                                </div>
                            )}
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
                                <h2 className="folder-title">{selectedFolder.name}</h2>
                            </div>
                            <p className="folder-subtitle">Categorized notes, all in one place.</p>
                        </div>
                    </div>
                    <div className="folder-actions">
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
                                <button onClick={() => handleAddItem(selectedFolder.id, 'deck')}>
                                    <img src={deckIcon} alt="deck" /> Import Deck
                                </button>
                                <button onClick={() => handleAddItem(selectedFolder.id, 'quiz')}>
                                    <img src={testIcon} alt="quiz" /> Import Quiz
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
                                <div className="folder-stat-value">1,247</div>
                                <div className="folder-stat-label">Words Written</div>
                            </div>
                        </div>
                        <div className="folder-stat-item">
                            <div className="folder-stat-icon">👥</div>
                            <div className="folder-stat-content">
                                <div className="folder-stat-value">3</div>
                                <div className="folder-stat-label">Collaborators</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {renderFolderItems(selectedFolder)}
        </div>
    );
};

export default FolderView; 