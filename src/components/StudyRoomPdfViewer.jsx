import { useEffect, useRef, useState } from 'react';
import './StudyRoomPdfViewer.css';

const VIEWER_PATH = '/study-room-pdf-viewer/web/viewer.html';

function StudyRoomPdfViewer({ fileUrl, title }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const blobUrlRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const loadPdf = async () => {
      if (!fileUrl) {
        setError('Missing PDF URL.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to download PDF.');
        }

        const blob = await response.blob();
        if (isCancelled) {
          return;
        }

        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        const nextBlobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = nextBlobUrl;
        setBlobUrl(nextBlobUrl);
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to load PDF.');
          setBlobUrl(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="study-room-pdf-viewer-loading">
        <div className="study-room-pdf-viewer-spinner" />
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="study-room-pdf-viewer-error">
        <p>{error || 'Unable to load PDF preview.'}</p>
      </div>
    );
  }

  const viewerSrc = `${VIEWER_PATH}?file=${encodeURIComponent(blobUrl)}`;

  return (
    <iframe
      className="study-room-pdf-viewer-iframe"
      src={viewerSrc}
      title={title || 'PDF Viewer'}
    />
  );
}

export default StudyRoomPdfViewer;
