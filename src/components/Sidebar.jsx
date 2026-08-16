import React from 'react';
import { FiPlus, FiSettings, FiLogOut, FiFileText, FiBookOpen, FiFile } from 'react-icons/fi';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import { Lock } from 'lucide-react';

/** Solid filled folder glyphs (FA) — use currentColor so sidebar hover/active styles apply */
const SidebarFolderIcon = ({ expanded, size, className = '' }) =>
    expanded ? (
        <FaFolderOpen className={className} size={size} aria-hidden={true} />
    ) : (
        <FaFolder className={className} size={size} aria-hidden={true} />
    );

const Sidebar = ({
    user,
    showDropdown,
    setShowDropdown,
    logout,
    navigate,
    location,
    folders,
    selectedFolder,
    activeView,
    expandedFolders,
    setShowNewFolderModal,
    handleFolderClick,
    toggleFolder,
    showNotification,
    activeFlyout,
    setActiveFlyout,
    showFoldersFlyout,
    setShowFoldersFlyout
}) => {
    // Constants for content limits
    const MAX_INLINE_ITEMS = 5;
    const MAX_INLINE_SUBFOLDERS = 3;
    const MAX_VISIBLE_FOLDERS = 8; // Maximum folders to show in main folders-list

    // Helper function to determine if content should be shown in flyout
    const shouldShowFlyout = (subfolders, items) => {
        const totalContent = (subfolders?.length || 0) + (items?.length || 0);
        const hasManySubfolders = (subfolders?.length || 0) > MAX_INLINE_SUBFOLDERS;
        const hasManyItems = (items?.length || 0) > MAX_INLINE_ITEMS;
        return totalContent > MAX_INLINE_ITEMS || hasManySubfolders || hasManyItems;
    };

    // Helper function to handle flyout mouse events
    const handleFlyoutMouseEnter = (folderId, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setActiveFlyout({ folderId, x: rect.right + 5, y: rect.top });
    };

    const handleFlyoutMouseLeave = () => {
        setActiveFlyout(null);
    };

    // Helper function to handle folders-list flyout
    const handleFoldersFlyoutMouseEnter = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setShowFoldersFlyout({ show: true, x: rect.left, y: rect.bottom + 5 });
    };

    const handleFoldersFlyoutMouseLeave = () => {
        setShowFoldersFlyout(false);
    };

    // Helper function to determine if folders-list should show flyout
    const shouldShowFoldersFlyout = () => {
        return folders.length > MAX_VISIBLE_FOLDERS;
    };

    // Function to render flyout content with recursive subfolder support
    const renderFlyoutContent = (folder, depth = 0) => {
        if (!folder) return null;

        return (
            <div className="flyout-content">
                {/* Render subfolders */}
                {folder.sub_folders && folder.sub_folders.map(subfolder => (
                    <div key={subfolder.id} className="flyout-subfolder">
                        <div 
                            className="flyout-folder-item"
                            onClick={(e) => handleFolderClick(subfolder.id, e)}
                            onMouseEnter={(e) => {
                                // If this subfolder has deeper content, show nested flyout
                                if (subfolder.sub_folders && subfolder.sub_folders.length > 0) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setActiveFlyout({ 
                                        folderId: subfolder.id, 
                                        x: rect.right + 5, 
                                        y: rect.top,
                                        depth: depth + 1
                                    });
                                }
                            }}
                            onMouseLeave={() => {
                                // Only clear if we're not hovering over a nested flyout
                                setTimeout(() => {
                                    if (activeFlyout && activeFlyout.folderId !== subfolder.id) {
                                        setActiveFlyout(null);
                                    }
                                }, 100);
                            }}
                        >
                            <SidebarFolderIcon
                                expanded={!!expandedFolders[subfolder.id]}
                                size={12}
                                className="flyout-folder-icon"
                            />
                            <span className="flyout-folder-name" title={subfolder.name}>
                                {subfolder.name}
                            </span>
                            {subfolder.sub_folders && subfolder.sub_folders.length > 0 && (
                                <span className="flyout-nested-indicator">▶</span>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Render items */}
                {folder.items && folder.items.map(item => (
                    <div key={item.id} className="flyout-item">
                        <div className="flyout-item__icon">
                            {item.type === 'document' && <FiFileText size={12} color="#888" />}
                            {item.type === 'deck' && <FiBookOpen size={12} color="#888" />}
                            {item.type === 'quiz' && <FiFile size={12} color="#888" />}
                        </div>
                        <span className="flyout-item-name" title={item.title || item.name || item.topic}>
                            {item.title || item.name || item.topic || 'Untitled'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // Recursive function to render subfolders with flyout after 1 level
    const renderSubfoldersRecursively = (subfolders, depth = 0) => {
        if (!subfolders || subfolders.length === 0) return null;

        // After 1 level of nesting, use flyout for deeper content
        const MAX_NESTING_DEPTH = 1;
        const useFlyoutForDepth = depth >= MAX_NESTING_DEPTH;

        return subfolders.map(subfolder => {
            const useFlyout = useFlyoutForDepth || shouldShowFlyout(subfolder.sub_folders, subfolder.items);
            
            return (
                <div key={subfolder.id} className="subfolder-item">
                    <div 
                        className={`folder-item subfolder ${selectedFolder?.id === subfolder.id && activeView === 'folder' ? 'active' : ''}`}
                        onClick={(e) => { console.log('Subfolder click:', subfolder.id); handleFolderClick(subfolder.id, e); }}
                        style={{ fontSize: '12px' }}
                        onMouseEnter={useFlyout ? (e) => handleFlyoutMouseEnter(subfolder.id, e) : undefined}
                        onMouseLeave={useFlyout ? handleFlyoutMouseLeave : undefined}
                    >
                        {!useFlyout && (
                            <button
                                className={`folder-expand-btn${expandedFolders[subfolder.id] ? ' expanded' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleFolder(subfolder.id, e); }}
                            >
                                <span className="material-symbols-outlined">keyboard_arrow_right</span>
                            </button>
                        )}
                        <SidebarFolderIcon
                            expanded={!!expandedFolders[subfolder.id]}
                            size={14}
                            className="folder-icon folder-icon-filled"
                        />
                        <span className="folder-name" title={subfolder.name}>
                            {subfolder.name.length > Math.max(8 - depth, 5) ? 
                                subfolder.name.slice(0, Math.max(6 - depth, 3)) + '...' : 
                                subfolder.name
                            }
                        </span>
                        {useFlyout && <span className="flyout-indicator">⋯</span>}
                    </div>
                    {!useFlyout && expandedFolders[subfolder.id] && (
                        <div className={`folder-contents expanded`}>
                            {/* Render items for this subfolder */}
                            {subfolder.items && subfolder.items.length > 0 && renderFolderItems(subfolder)}
                            
                            {/* Recursively render deeper subfolders (only if not at depth limit) */}
                            {!useFlyoutForDepth && renderSubfoldersRecursively(subfolder.sub_folders, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    // Function to render folders-list flyout content
    const renderFoldersListFlyout = () => {
        if (!showFoldersFlyout) return null;

        const visibleFolders = folders.slice(0, MAX_VISIBLE_FOLDERS);
        const hiddenFolders = folders.slice(MAX_VISIBLE_FOLDERS);

        return (
            <div className="folders-list-flyout">
                <div className="folders-list-flyout-header">
                    <span>All Folders ({folders.length})</span>
                </div>
                <div className="folders-list-flyout-content">
                    {folders.map(folder => (
                        <div 
                            key={folder.id} 
                            className={`folders-flyout-item ${selectedFolder?.id === folder.id && activeView === 'folder' ? 'active' : ''}`}
                            onClick={(e) => handleFolderClick(folder.id, e)}
                        >
                            <SidebarFolderIcon
                                expanded={!!expandedFolders[folder.id]}
                                size={16}
                                className="folders-flyout-icon"
                            />
                            <span className="folders-flyout-name" title={folder.name}>
                                {folder.name}
                            </span>
                            {expandedFolders[folder.id] && <span className="folders-flyout-expanded">▼</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    const renderFolderItems = (folder) => {
        if (!folder.items || folder.items.length === 0) return null;
        
        return folder.items.map(item => (
            <div key={item.id} className="folder-item-content">
                <div className="folder-item-content__icon">
                    {item.type === 'document' && <FiFileText size={14} color="#888" />}
                    {item.type === 'deck' && <FiBookOpen size={14} color="#888" />}
                    {item.type === 'quiz' && <FiFile size={14} color="#888" />}
                </div>
                <span className="item-name" title={item.title || item.name || item.topic}>
                    {(item.title || item.name || item.topic || 'Untitled').length > 15 
                        ? (item.title || item.name || item.topic || 'Untitled').slice(0, 12) + '...'
                        : (item.title || item.name || item.topic || 'Untitled')
                    }
                </span>
            </div>
        ));
    };

    const handleStudyGroupsClick = () => {
        if (showNotification) {
            showNotification('Coming Soon!');
        }
    };
    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-top">
                <div className="workspace-header">
                    <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                    {showDropdown && (
                        <div className="profile-dropdown">
                            <div className="dropdown-menu">
                                <button className="dropdown-item">
                                    <FiSettings className="dropdown-icon" />
                                    Settings
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="logout-button" onClick={logout}>
                                    <FiLogOut className="dropdown-icon" />
                                    Log out of NeuroNote
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="sidebar-content">
                <div className="sidebar-nav-items">
                    <div 
                        className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        <span className="material-symbols-outlined nav-icon">home</span>
                        <span>Home</span>
                    </div>
                    <div 
                        className={`nav-item ${location.pathname === '/night-owl-flashcards' ? 'active' : ''}`}
                        onClick={() => navigate('/night-owl-flashcards')}
                    >
                        <span className="material-symbols-outlined nav-icon">cards_stack</span>
                        <span>Flashcards</span>
                    </div>
                    <div 
                        className={`nav-item locked ${location.pathname === '/study-groups' ? 'active' : ''}`}
                        onClick={handleStudyGroupsClick}
                    >
                        <div className="nav-item-lock-overlay">
                            <Lock size={12} color="#ff6b6b" />
                        </div>
                        <span className="material-symbols-outlined nav-icon">group</span>
                        <span>Study Groups</span>
                    </div>
                </div>
                <div className="folders-section">
                    <div className="folders-header">
                        <h3>Folders</h3>
                        <button className="create-folder-btn" onClick={() => setShowNewFolderModal(true)}>
                            <FiPlus />
                        </button>
                    </div>
                    <div className="folders-list">
                        {(shouldShowFoldersFlyout() ? folders.slice(0, MAX_VISIBLE_FOLDERS) : folders).map((folder, index, visibleFolders) => (
                            <React.Fragment key={folder.id}>
                                <div 
                                    className={`folder-item ${selectedFolder?.id === folder.id && activeView === 'folder' ? 'active' : ''}`}
                                    onClick={(e) => handleFolderClick(folder.id, e)}
                                >
                                    <button 
                                        className={`folder-expand-btn ${expandedFolders[folder.id] ? 'expanded' : ''}`}
                                        onClick={(e) => toggleFolder(folder.id, e)}
                                    >
                                        <span className="material-symbols-outlined">keyboard_arrow_right</span>
                                    </button>
                                    <SidebarFolderIcon
                                        expanded={!!expandedFolders[folder.id]}
                                        size={20}
                                        className="folder-icon folder-icon-filled"
                                    />
                                    <span className="folder-name" title={folder.name}>{folder.name}</span>
                                </div>
                                {expandedFolders[folder.id] && (
                                    <div className={`folder-contents ${expandedFolders[folder.id] ? 'expanded' : ''}`}>
                                        {/* Render subfolders first, directly under folder-contents */}
                                        {folder.sub_folders && folder.sub_folders.map(subfolder => {
                                            const useFlyout = shouldShowFlyout(subfolder.sub_folders, subfolder.items);
                                            
                                            return (
                                                <div key={subfolder.id} className="subfolder-item">
                                                    <div 
                                                        className={`folder-item subfolder ${selectedFolder?.id === subfolder.id && activeView === 'folder' ? 'active' : ''}`}
                                                        onClick={(e) => { console.log('Subfolder click:', subfolder.id); handleFolderClick(subfolder.id, e); }}
                                                        style={{ fontSize: '12px' }}
                                                        onMouseEnter={useFlyout ? (e) => handleFlyoutMouseEnter(subfolder.id, e) : undefined}
                                                        onMouseLeave={useFlyout ? handleFlyoutMouseLeave : undefined}
                                                    >
                                                        {!useFlyout && (
                                                            <button
                                                                className={`folder-expand-btn${expandedFolders[subfolder.id] ? ' expanded' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); toggleFolder(subfolder.id, e); }}
                                                            >
                                                                <span className="material-symbols-outlined">keyboard_arrow_right</span>
                                                            </button>
                                                        )}
                                                        <SidebarFolderIcon
                                                            expanded={!!expandedFolders[subfolder.id]}
                                                            size={14}
                                                            className="folder-icon folder-icon-filled"
                                                        />
                                                        <span className="folder-name" title={subfolder.name}>
                                                            {subfolder.name.length > 10 ? subfolder.name.slice(0, 7) + '...' : subfolder.name}
                                                        </span>
                                                        {useFlyout && <span className="flyout-indicator">⋯</span>}
                                                    </div>
                                                    {!useFlyout && expandedFolders[subfolder.id] && (
                                                        <div className={`folder-contents expanded`}>
                                                            {/* Render items for this subfolder */}
                                                            {subfolder.items && subfolder.items.length > 0 && renderFolderItems(subfolder)}
                                                            
                                                            {/* Recursively render subfolders at any nesting level */}
                                                            {renderSubfoldersRecursively(subfolder.sub_folders)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {/* Render folder items (documents, decks, etc.) but do NOT show empty state in sidebar */}
                                        {folder.items && folder.items.length > 0 && renderFolderItems(folder)}
                                    </div>
                                )}
                                {index < visibleFolders.length - 1 && <div className="folder-separator" />}
                            </React.Fragment>
                        ))}
                        
                        {/* Show overflow indicator and flyout trigger */}
                        {shouldShowFoldersFlyout() && (
                            <div 
                                className="folders-overflow-indicator"
                                onMouseEnter={handleFoldersFlyoutMouseEnter}
                                onMouseLeave={handleFoldersFlyoutMouseLeave}
                            >
                                <span className="overflow-text">
                                    +{folders.length - MAX_VISIBLE_FOLDERS} more folders
                                </span>
                                <span className="overflow-icon">⋯</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Sidebar; 