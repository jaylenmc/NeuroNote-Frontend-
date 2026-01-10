import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSave, FiGlobe, FiTag, FiX, FiList, FiMaximize2, FiMinimize2, FiGrid } from 'react-icons/fi';
import { FaListOl } from 'react-icons/fa';
import api from '../api/axios';
import './NotesEditorPage.css';

const NotesEditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [noteTitle, setNoteTitle] = useState('Untitled Note');
  const [noteTags, setNoteTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showTableContextMenu, setShowTableContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const contentRef = useRef(null);

  // Set content programmatically only when content changes from outside (e.g., loading a doc)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // Handle clicks outside context menu
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTableContextMenu]);

  // Load document if editing
  useEffect(() => {
    const doc = location.state?.document;
    if (doc && doc.id && doc.folder) {
      setCurrentDocumentId(doc.id);
      setCurrentFolderId(doc.folder);
      // Fetch document details from backend
      api.get(`/documents/notes/${doc.folder}/${doc.id}/`).then(response => {
        const d = response.data;
        setNoteTitle(d.title || 'Untitled Note');
        setContent(d.notes || '');
        setNoteTags(d.tag ? [d.tag.title] : []);
        setIsPublished(!!d.published);
      }).catch(err => {
        // fallback to state if backend fails
        setNoteTitle(doc.title || 'Untitled Note');
        setContent(doc.notes || '');
        setNoteTags(doc.tag ? [doc.tag.title] : []);
        setIsPublished(!!doc.published);
      });
    } else if (doc && doc.folder) {
      setCurrentFolderId(doc.folder);
    } else if (location.state?.folderId) {
      setCurrentFolderId(location.state.folderId);
    }
  }, [location.state]);

  // Formatting functions
  const formatText = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    contentRef.current && setContent(contentRef.current.innerHTML);
  };

  // Table functions
  const insertTable = () => {
    const table = createTableHTML(tableRows, tableCols);
    console.log('Inserting table:', table);
    
    // Focus the content area first
    if (contentRef.current) {
      contentRef.current.focus();
      
      // Try multiple methods to insert the table
      try {
        // Method 1: execCommand
        const success = document.execCommand('insertHTML', false, table);
        console.log('execCommand success:', success);
        
        if (!success) {
          // Method 2: Direct DOM manipulation
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = table;
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild);
            }
            range.insertNode(fragment);
            selection.removeAllRanges();
          } else {
            // Method 3: Append to content
            contentRef.current.innerHTML += table;
          }
        }
        
        // Update content state
        setContent(contentRef.current.innerHTML);
        setShowTableModal(false);
      } catch (error) {
        console.error('Error inserting table:', error);
        // Fallback: append to content
        contentRef.current.innerHTML += table;
        setContent(contentRef.current.innerHTML);
        setShowTableModal(false);
      }
    }
  };

  const createTableHTML = (rows, cols) => {
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; min-height: 100px;">';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        const isHeader = i === 0;
        const tag = isHeader ? 'th' : 'td';
        tableHTML += `<${tag} style="border: 1px solid #ddd; padding: 8px; text-align: left; width: ${100/cols}%; min-height: 30px; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; white-space: normal; ${isHeader ? 'font-weight: bold;' : ''}" contenteditable="true">&nbsp;</${tag}>`;
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    return tableHTML;
  };

  const addTableRow = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const table = range.commonAncestorContainer.closest('table');
      if (table) {
        const tbody = table.querySelector('tbody') || table;
        const lastRow = tbody.querySelector('tr:last-child');
        if (lastRow) {
          const newRow = lastRow.cloneNode(true);
          // Clear cell content and make them editable
          const cells = newRow.querySelectorAll('td, th');
          cells.forEach((cell) => {
            cell.innerHTML = '&nbsp;';
            cell.setAttribute('contenteditable', 'true');
          });
          tbody.appendChild(newRow);
          contentRef.current && setContent(contentRef.current.innerHTML);
        }
      }
    }
  };

  const addTableColumn = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const table = range.commonAncestorContainer.closest('table');
      if (table) {
        const rows = table.querySelectorAll('tr');
        const colIndex = rows[0].children.length;
        
        // Update existing cells to have equal width
        rows.forEach((row) => {
          const cells = Array.from(row.children);
          const newWidth = `${100 / (cells.length + 1)}%`;
          cells.forEach(cell => {
            cell.style.width = newWidth;
          });
        });

        rows.forEach((row, rowIndex) => {
          const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
          cell.style.textAlign = 'left';
          cell.style.width = `${100 / (row.children.length + 1)}%`;
          cell.style.minHeight = '30px';
          cell.style.wordWrap = 'break-word';
          cell.style.wordBreak = 'break-word';
          cell.style.overflowWrap = 'break-word';
          cell.style.whiteSpace = 'normal';
          cell.setAttribute('contenteditable', 'true');
          cell.innerHTML = '&nbsp;';
          
          if (rowIndex === 0) {
            cell.style.fontWeight = 'bold';
          }
          row.appendChild(cell);
        });
        
        contentRef.current && setContent(contentRef.current.innerHTML);
      }
    }
  };

  const deleteTable = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const table = range.commonAncestorContainer.closest('table');
      if (table) {
        table.remove();
        contentRef.current && setContent(contentRef.current.innerHTML);
      }
    }
    setShowTableContextMenu(false);
  };

  const handleTableContextMenu = (e) => {
    const table = e.target.closest('table');
    if (table) {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowTableContextMenu(true);
    }
  };

  const handleClickOutside = (e) => {
    if (showTableContextMenu && !e.target.closest('.table-context-menu')) {
      setShowTableContextMenu(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the content area entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          img.style.margin = '10px 0';
          img.style.borderRadius = '8px';
          img.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          
          // Insert image at cursor position or at the end
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
          } else if (contentRef.current) {
            contentRef.current.appendChild(img);
          }
          
          // Update content state
          if (contentRef.current) {
            setContent(contentRef.current.innerHTML);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags([newTag.trim()]); // Only allow one tag
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    // Call the tag delete endpoint if we have a document ID
    if (currentDocumentId) {
      // Find the tag ID from the backend response
      api.get(`/documents/notes/${currentFolderId}/${currentDocumentId}/`).then(response => {
        const doc = response.data;
        if (doc.tag) {
          const tagId = doc.tag.id;
          api.delete(`/documents/notes/tags/del/${currentDocumentId}/${tagId}/`).then(() => {
            setNoteTags([]); // Remove the tag from state after successful deletion
          }).catch(error => {
            console.error('Error deleting tag:', error);
          });
        } else {
          setNoteTags([]); // No tag to delete, just update state
        }
      }).catch(error => {
        console.error('Error fetching document for tag deletion:', error);
        setNoteTags([]); // Fallback to just updating state
      });
    } else {
      setNoteTags([]); // No document ID, just update state
    }
  };

  // Save (create or update)
  const handleSave = async (publishedOverride = null) => {
    setIsSaving(true);
    try {
      const documentData = {
        title: noteTitle || 'Untitled Note',
        notes: content,
        folder_id: currentFolderId,
        is_published: publishedOverride !== null ? publishedOverride : isPublished,
        tag: noteTags.length > 0 ? noteTags[0] : ''
      };
      console.log('Document Data:', documentData);
      let response = null;
      if (currentDocumentId) {
        response = await api.put(`/documents/notes/update/${currentDocumentId}/`, documentData);
        } else {
        response = await api.post('/documents/notes/', documentData);
      }
      if (response && response.status === 200) {
        const savedDoc = response.data;
        setCurrentDocumentId(savedDoc.id);
        setCurrentFolderId(savedDoc.folder);
        setNoteTitle(savedDoc.title || 'Untitled Note');
        setContent(savedDoc.notes || '');
        setNoteTags(savedDoc.tag ? [savedDoc.tag.title] : []);
        setIsPublished(!!savedDoc.published);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish toggle
  const handlePublish = async () => {
    const newPublished = !isPublished;
    await handleSave(newPublished);
    // setIsPublished will be updated after save from backend response
  };

  const handleExit = async () => {
    const folderId = currentFolderId || location.state?.document?.folder;
    if (folderId) {
      try {
        const docsResponse = await api.get(`/documents/notes/${folderId}/`);
        const documents = docsResponse.data || [];
        navigate(`/dashboard/folder/${folderId}`, { state: { documents } });
      } catch (err) {
        navigate(`/dashboard/folder/${folderId}`);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className={`notes-editor-rebuilt ${isFullscreen ? 'fullscreen' : ''}`}>  
        <div className="notes-header">
            <div className="title-section">
            <input
              type="text"
              value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
              className="notes-title-input"
              placeholder="Untitled Note"
                title={noteTitle}
              />
             {noteTags.length > 0 && (
               <div className="single-tag">
                 <span className="tag-dot">•</span>
                 <span className="tag-text">{noteTags[0]}</span>
                 <button onClick={() => handleRemoveTag(noteTags[0])}><FiX /></button>
               </div>
             )}
             {noteTags.length === 0 && (
               <button className="add-single-tag-btn" onClick={() => setShowTagInput(true)}>
                 <FiTag /> Add Tag
               </button>
             )}
             {showTagInput && (
                <input
                  type="text"
                  value={newTag}
                 onChange={e => setNewTag(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') handleAddTag();
                   else if (e.key === 'Escape') { setShowTagInput(false); setNewTag(''); }
                 }}
                 onBlur={() => { setShowTagInput(false); setNewTag(''); }}
                 className="single-tag-input"
                  placeholder="Add tag..."
                  autoFocus
                />
              )}
            </div>
            <div className="notes-actions">
              <button className={`publish-btn ${isPublished ? 'published' : ''}`} onClick={handlePublish} style={isPublished ? { minWidth: 140, width: 140, maxWidth: 140 } : {}}>
                <FiGlobe size={22} style={{marginRight: 6}} />{isPublished ? 'Published' : 'Publish'}
            </button>
              <button className="save-btn" onClick={() => handleSave()} disabled={isSaving}>
                <FiSave size={22} style={{marginRight: 6}} />{isSaving ? 'Saving...' : 'Save'}
            </button>
              <button className="exit-btn" onClick={handleExit}>
                <FiX size={22} />
              </button>
            </div>
          </div>
      <div className="notes-formatting-toolbar">
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h1>')} title="Heading 1"><span>H1</span></button>
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h2>')} title="Heading 2"><span>H2</span></button>
        <button className="format-btn" onClick={() => formatText('formatBlock', '<h3>')} title="Heading 3"><span>H3</span></button>
        <div className="format-divider"></div>
        <button className="format-btn" onClick={() => formatText('bold')} title="Bold"><span style={{fontWeight:'bold'}}>B</span></button>
        <button className="format-btn" onClick={() => formatText('italic')} title="Italic"><span style={{fontStyle:'italic'}}>I</span></button>
        <div className="format-divider"></div>
        <button className="format-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List"><FiList size={16} /></button>
        <button className="format-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List"><FaListOl size={16} /></button>
        <div className="format-divider"></div>
        <button className="format-btn" onClick={() => {
          console.log('Table button clicked');
          setShowTableModal(true);
        }} title="Insert Table"><FiGrid size={16} /></button>
        <button className="format-btn" onClick={() => {
          console.log('Test table button clicked');
          const testTable = createTableHTML(2, 2);
          if (contentRef.current) {
            contentRef.current.innerHTML += testTable;
            setContent(contentRef.current.innerHTML);
          }
        }} title="Test Table">T</button>
        <div className="formatting-toolbar-right">
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Export handler */}} title="Export">Export</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: PDF handler */}} title="Export as PDF">PDF</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Markdown handler */}} title="Export as Markdown">Markdown</button>
          <button className="toolbar-action-btn" onClick={() => {/* TODO: Cards handler */}} title="Create Cards">Cards</button>
          <button className="fullscreen-btn" onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            </button>
          </div>
        </div>
      <div className="notes-content-area" style={{position: 'relative'}}>
        {!content && !isFocused && (
          <span className="notes-placeholder">
            Start typing notes... Use the toolbar above to format your text.
          </span>
        )}
        <div
          ref={contentRef}
          contentEditable={true}
          className={`notes-content-editable ${isDragOver ? 'drag-over' : ''}`}
          onInput={e => setContent(e.currentTarget.innerHTML)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onContextMenu={handleTableContextMenu}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          suppressContentEditableWarning={true}
          style={{ minHeight: 300 }}
        />
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className="modal-overlay" onClick={() => {
          console.log('Modal overlay clicked');
          setShowTableModal(false);
        }}>
          <div className="modal-content" onClick={e => {
            console.log('Modal content clicked');
            e.stopPropagation();
          }}>
            <div className="modal-header">
              <h3>Insert Table</h3>
              <button className="modal-close" onClick={() => setShowTableModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-size-controls">
                <div className="size-control">
                  <label>Rows:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={e => setTableRows(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="size-control">
                  <label>Columns:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={e => setTableCols(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="table-preview">
                <div className="preview-label">Preview:</div>
                <div dangerouslySetInnerHTML={{ __html: createTableHTML(tableRows, tableCols) }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTableModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={insertTable}>
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Context Menu */}
      {showTableContextMenu && (
        <div 
          className="table-context-menu" 
          style={{ 
            display: 'block',
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1002
          }}
        >
          <button onClick={() => {
            addTableRow();
            setShowTableContextMenu(false);
          }}>Add Row</button>
          <button onClick={() => {
            addTableColumn();
            setShowTableContextMenu(false);
          }}>Add Column</button>
          <button onClick={deleteTable}>Delete Table</button>
        </div>
      )}
    </div>
  );
};

export default NotesEditorPage; 