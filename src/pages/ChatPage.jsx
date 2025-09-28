import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiMic, FiPaperclip, FiClock, FiBookmark, FiSettings, FiTrash2 } from 'react-icons/fi';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            content: "Hello! I'm your AI-powered study assistant. How can I help you today?",
            type: 'ai',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            avatar: '🤖'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState('Biology');
    const [currentFocus, setCurrentFocus] = useState('Chapter 3: Cell Biology');
    const [pinnedNotes, setPinnedNotes] = useState([
        { id: 1, title: "Biology Chapter 3", type: "document", icon: "📚" },
        { id: 2, title: "Cell Structure Notes", type: "file", icon: "📄" },
        { id: 3, title: "Mitosis Process", type: "link", icon: "🔗" }
    ]);
    const [isStudyMode, setIsStudyMode] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            content: input,
            type: 'user',
            timestamp: new Date().toISOString(),
            avatar: '👤'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const token = sessionStorage.getItem('jwt_token');
            const response = await fetch('http://127.0.0.1:8000/api/tutor/notetaker/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    prompt: input.trim()
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            const aiMessage = {
                id: Date.now() + 1,
                content: data.Message,
                type: 'ai',
                timestamp: new Date().toISOString(),
                avatar: '🤖'
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                content: 'Sorry, I encountered an error. Please try again.',
                type: 'ai',
                timestamp: new Date().toISOString(),
                avatar: '🤖'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
    };

    const handleClearChat = () => {
        setMessages([{
            id: Date.now(),
            content: "Hello! I'm your AI-powered study assistant. How can I help you today?",
            type: 'ai',
            timestamp: new Date().toISOString(),
            avatar: '🤖'
        }]);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatMessage = (content) => {
        return content.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const quickPrompts = [
        { title: "Summarize this note", icon: "📘", prompt: "Can you summarize the key points of this note..." },
        { title: "Explain a flashcard", icon: "❓", prompt: "Can you explain this flashcard concept in detail..." },
        { title: "Make a 5-question quiz", icon: "🧪", prompt: "Create a 5-question quiz based on..." }
    ];

    const quickActions = [
        { 
            title: "Summarize my notes", 
            icon: "📚", 
            prompt: "Please summarize my notes and highlight the key concepts" 
        },
        { 
            title: "Make flashcards from this text", 
            icon: "✍️", 
            prompt: "Create flashcards from this text with questions and answers" 
        },
        { 
            title: "Test me with a quiz", 
            icon: "🎯", 
            prompt: "Create a quiz to test my understanding of this material" 
        }
    ];

    const studyModeActions = [
        { 
            title: "Explain this concept", 
            icon: "🧠", 
            prompt: "Please explain this concept in detail with examples" 
        },
        { 
            title: "Create study questions", 
            icon: "❓", 
            prompt: "Generate study questions to help me understand this topic" 
        },
        { 
            title: "Review key points", 
            icon: "📝", 
            prompt: "Help me review the key points and important details" 
        }
    ];

    const getCurrentQuickActions = () => {
        return isStudyMode ? studyModeActions : quickActions;
    };

    const handlePromptClick = (prompt) => {
        setInput(prompt.prompt);
        inputRef.current?.focus();
    };

    const handleQuickActionClick = (action) => {
        setInput(action.prompt);
        inputRef.current?.focus();
    };

    const handlePinNote = () => {
        // This would typically open a modal to select resources from Study Room
        // For now, we'll add a placeholder function
        console.log('Open pin resource modal');
    };

    const handleUnpinNote = (noteId) => {
        setPinnedNotes(prev => prev.filter(note => note.id !== noteId));
    };

    const handlePinnedNoteClick = (note) => {
        // This would typically reference the pinned note in the chat
        const referenceText = `Please reference my pinned note: "${note.title}"`;
        setInput(referenceText);
        inputRef.current?.focus();
    };

    const handleStudyModeToggle = () => {
        setIsStudyMode(prev => !prev);
    };

    return (
        <div className="chat-page">
            {/* Left Sidebar */}
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">
                        <span className="chat-emoji">💬</span>
                        Ask NeuroNote
                    </h2>
                    <p className="sidebar-subtitle">Your AI study assistant – ready to help with notes, flashcards, and problem solving.</p>
                </div>
                
                <div className="sidebar-actions">
                    <button 
                        className="sidebar-action-btn"
                        onClick={() => navigate('/study-room')}
                    >
                        <FiArrowLeft />
                        Back to Study Room
                    </button>
                    <button 
                        className="sidebar-action-btn"
                        onClick={() => navigate('/study-room/decks')}
                    >
                        📚 Flashcards
                    </button>
                    <button 
                        className="sidebar-action-btn"
                        onClick={() => navigate('/quiz')}
                    >
                        🧪 Quiz Battle
                    </button>
                    <button 
                        className="sidebar-action-btn"
                        onClick={() => navigate('/focus')}
                    >
                        🎯 Focus Mode
                    </button>
                    <button 
                        className="sidebar-action-btn"
                        onClick={handleClearChat}
                    >
                        <FiTrash2 />
                        Clear Chat
                    </button>
                </div>

                {/* Quick Prompts Section */}
                <div className="sidebar-section">
                    <h4 style={{ color: '#B0B0B0', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 1rem 0' }}>Quick Prompts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {quickPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                className="sidebar-action-btn"
                                onClick={() => handlePromptClick(prompt)}
                                style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }}
                            >
                                {prompt.icon} {prompt.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pinned Notes Section */}
                <div className="chat-pinned-section">
                    <div className="chat-pinned-header">
                        <h4 className="chat-pinned-title">Pinned Notes</h4>
                        <button 
                            className="chat-pinned-add-btn"
                            onClick={handlePinNote}
                        >
                            + Add
                        </button>
                    </div>
                    
                    <div className="chat-pinned-list">
                        {pinnedNotes.length === 0 ? (
                            <div className="chat-pinned-empty">
                                No pinned notes yet
                            </div>
                        ) : (
                            pinnedNotes.map((note) => (
                                <div 
                                    key={note.id} 
                                    className="chat-pinned-item"
                                    onClick={() => handlePinnedNoteClick(note)}
                                >
                                    <span className="chat-pinned-item-icon">{note.icon}</span>
                                    <span className="chat-pinned-item-text">{note.title}</span>
                                    <button 
                                        className="chat-pinned-item-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnpinNote(note.id);
                                        }}
                                        title="Remove pinned note"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Study Mode Toggle */}
                <div className="chat-study-mode-section">
                    <button 
                        className={`chat-study-mode-toggle ${isStudyMode ? 'active' : ''}`}
                        onClick={handleStudyModeToggle}
                    >
                        <span className="chat-study-mode-icon">
                            {isStudyMode ? '🎯' : '📚'}
                        </span>
                        <span>
                            {isStudyMode ? 'Exit Study Mode' : 'Enter Study Mode'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {/* Middle Section - Chat Interface Card */}
                <div className="chat-interface-card">
                <div className="messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.type}`}>
                            <div className="message-label">
                                {message.type === 'ai' ? 'NeuroNote' : 'You'}
                            </div>
                            <div className="message-container">
                                <div className="message-avatar">
                                    {message.type === 'ai' ? '🧠' : '👤'}
                                </div>
                                <div className="message-bubble">
                                    <div className="message-content">
                                        {formatMessage(message.content)}
                                    </div>
                                    <div className="message-timestamp">
                                        {formatTime(message.timestamp)}
                                    </div>
                                    <div className="message-actions">
                                        <button 
                                            className="message-action-btn"
                                            onClick={() => handleCopy(message.content)}
                                            title="Copy message"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="message ai">
                            <div className="message-label">NeuroNote</div>
                            <div className="message-container">
                                <div className="message-avatar">🧠</div>
                                <div className="message-bubble">
                                    <div className="typing-indicator">
                                        <span>AI is thinking</span>
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Bottom Section - Input Bar Card */}
            <div className="input-bar-card">
                <div className="input-container">
                    <div className="input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="message-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            rows="1"
                        />
                        <div className="input-actions">
                            <button className="input-action-btn" title="Attach file">
                                <FiPaperclip />
                            </button>
                            <button className="input-action-btn" title="Voice input">
                                <FiMic />
                            </button>
                            <button 
                                className="send-button"
                                onClick={handleSend}
                                disabled={!input.trim()}
                                title="Send message"
                            >
                                <FiSend />
                            </button>
                        </div>
                    </div>
                    <div className="input-helper">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="quick-actions">
                        {getCurrentQuickActions().map((action, index) => (
                            <button
                                key={index}
                                className="quick-action-btn"
                                onClick={() => handleQuickActionClick(action)}
                            >
                                <span>{action.icon}</span>
                                <span>{action.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            </div>
        </div>
    );
};

export default ChatPage; 