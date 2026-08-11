import StudyRoomPdfViewer from './StudyRoomPdfViewer';
import './StudyRoomResourcePreview.css';

const getYouTubeEmbedUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    const videoId = parsed.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.pathname.startsWith('/embed/')) {
      return url;
    }
  } catch {
    // Fall through to legacy replacement.
  }
  return url.replace('watch?v=', 'embed/');
};

const isYouTubeLink = (url) =>
  url?.includes('youtube.com') || url?.includes('youtu.be');

function StudyRoomResourcePreview({ isLoading, overlayType, overlayContent, onClose }) {
  return (
    <div className="study-room-resource-preview">
      <div className="study-room-resource-preview-panel">
        <div className="study-room-resource-preview-header">
          <h3 className="study-room-resource-preview-title">
            {overlayType === 'link' && (overlayContent?.title || 'Link')}
            {overlayType === 'pdf' && (overlayContent?.object_name || 'PDF Viewer')}
          </h3>
          <div className="study-room-resource-preview-header-actions">
            {overlayType === 'link' && overlayContent?.link && (
              <a
                href={overlayContent.link}
                target="_blank"
                rel="noopener noreferrer"
                className="study-room-resource-preview-open-link"
              >
                Open in new tab
              </a>
            )}
            <button
              type="button"
              className="study-room-resource-preview-close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="study-room-resource-preview-loading">
            <div className="study-room-resource-preview-spinner" />
            <p>Loading content...</p>
          </div>
        ) : (
          <div className="study-room-resource-preview-body">
            {overlayType === 'link' && overlayContent && (
              <div className="study-room-resource-preview-link">
                {isYouTubeLink(overlayContent.link) ? (
                  <div className="study-room-resource-preview-frame">
                    <iframe
                      src={getYouTubeEmbedUrl(overlayContent.link)}
                      title={overlayContent.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="study-room-resource-preview-frame">
                    <iframe
                      src={overlayContent.link}
                      title={overlayContent.title}
                    />
                  </div>
                )}
              </div>
            )}

            {overlayType === 'pdf' && overlayContent && (
              <div className="study-room-resource-preview-pdf">
                {overlayContent.file_url ? (
                  <div className="study-room-resource-preview-frame study-room-resource-preview-frame--pdf">
                    <StudyRoomPdfViewer
                      fileUrl={overlayContent.file_url}
                      title={overlayContent.object_name}
                    />
                  </div>
                ) : (
                  <div className="study-room-resource-preview-empty">
                    <p>Unable to load PDF preview.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyRoomResourcePreview;
