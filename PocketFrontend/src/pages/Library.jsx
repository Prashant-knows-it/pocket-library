import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PdfSummaryModal from '../components/PdfSummaryModal';
import PdfChatModal from '../components/PdfChatModal';

export default function Library() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // PDF Summary Modal State
  const [summaryModal, setSummaryModal] = useState({
    isOpen: false,
    summary: '',
    loading: false,
    fileName: ''
  });

  // PDF Chat Modal State
  const [chatModal, setChatModal] = useState({
    isOpen: false,
    fileId: null,
    fileName: ''
  });

  // Fetch user's files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Check if user is authenticated
      const token = api.getAuthToken();
      if (!token) {
        setError('Please login to view your library');
        setFiles([]);
        setLoading(false);
        return;
      }

      // Fetch files from API
      const userFiles = await api.getAllFiles();

      // Successfully fetched files - clear any errors
      setError(null);
      setFiles(Array.isArray(userFiles) ? userFiles : []);

    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch files';
      console.error('Error fetching files:', err);

      // Only set error if it's a real error (not just empty list)
      if (errorMsg && !errorMsg.includes('empty')) {
        setError(errorMsg);
      } else {
        setError(null); // Clear error for empty list
      }

      // If unauthorized/forbidden, clear files and show error
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Access denied') ||
        errorMsg.includes('login') || errorMsg.includes('Forbidden')) {
        setFiles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    if (!fileType.includes('pdf') && !fileType.includes('epub') &&
      !fileName.endsWith('.pdf') && !fileName.endsWith('.epub')) {
      setError('Please upload a PDF or EPUB file');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload the file
      const uploadedFile = await api.uploadFile(file);

      // Reset the file input
      e.target.value = '';

      // Refresh the file list to show the new file
      await fetchFiles();

      // Show success message
      alert('File uploaded successfully!');
    } catch (err) {
      const errorMsg = err.message || 'Failed to upload file';
      setError(errorMsg);
      console.error('Error uploading file:', err);
      // Reset the file input on error too
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  // Handler for file deletion
  const handleDeleteFile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setError(null);
      await api.deleteFile(id);
      // Refresh the file list
      await fetchFiles();
      alert('File deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  // Handler for file download with JWT authentication
  const handleDownload = async (id) => {
    try {
      const token = api.getAuthToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(api.downloadFile(id), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';

      if (contentDisposition) {
        // Handle Content-Disposition header format: attachment; filename="file.pdf"
        // Try to match quoted filename: filename="value"
        let filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

        if (!filenameMatch) {
          // Try unquoted: filename=value
          filenameMatch = contentDisposition.match(/filename=([^;,\n\r]+)/i);
        }

        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].trim();
          // Remove any surrounding quotes if still present
          filename = filename.replace(/^["']+|["']+$/g, '');
          // Clean up: remove extra spaces and underscores (but keep the extension)
          // Replace multiple underscores with single underscore, but preserve extension
          const extensionMatch = filename.match(/(\.[^.]+)$/);
          const extension = extensionMatch ? extensionMatch[1] : '';
          const nameWithoutExt = extension ? filename.slice(0, -extension.length) : filename;
          filename = nameWithoutExt.replace(/_{2,}/g, '_').replace(/\s+/g, ' ').trim() + extension;
        }
      }

      // Fallback: use content type to determine extension
      if (filename === 'download' || !filename.includes('.')) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('pdf')) {
          filename = 'file.pdf';
        } else if (contentType.includes('epub')) {
          filename = 'file.epub';
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to download file');
      console.error('Error downloading file:', err);
    }
  };

  // Handler for file view (opens PDF in new tab with JWT authentication)
  const handleView = async (id) => {
    try {
      const token = api.getAuthToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Fetch PDF with Authorization header (secure - no token in URL)
      const response = await fetch(api.viewFile(id), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to view file');
      }

      // Create blob URL and open in new tab
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');

      // Clean up blob URL after window is closed (optional cleanup)
      if (newWindow) {
        newWindow.addEventListener('beforeunload', () => {
          window.URL.revokeObjectURL(blobUrl);
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to view file');
      console.error('Error viewing file:', err);
    }
  };

  // Handler for PDF Summarize
  const handleSummarize = async (file) => {
    setSummaryModal({
      isOpen: true,
      summary: '',
      loading: true,
      fileName: file.fileName
    });

    try {
      const result = await api.summarizePdf(file.id);
      setSummaryModal(prev => ({
        ...prev,
        summary: result.summary,
        loading: false
      }));
    } catch (err) {
      setSummaryModal(prev => ({
        ...prev,
        summary: `Error: ${err.message || 'Failed to generate summary'}`,
        loading: false
      }));
    }
  };

  // Handler for PDF Chat
  const handleChatOpen = (file) => {
    setChatModal({
      isOpen: true,
      fileId: file.id,
      fileName: file.fileName
    });
  };

  const handleChatSend = async (fileId, messages) => {
    const result = await api.chatWithPdf(fileId, messages);
    return result.response;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Welcome to Your Library!</h1>
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-btn">
            {uploading ? (
              <>
                <span className="upload-spinner">⏳</span> Uploading...
              </>
            ) : (
              <>
                <span className="upload-icon">📁</span> Upload Books
              </>
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.epub"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading your library...</p>
        </div>
      ) : (
        <div className="book-list">
          {files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No books uploaded yet.</p>
              <p className="empty-hint">Click "Upload Books" above to get started!</p>
            </div>
          ) : (
            <ul className="file-list">
              {files.map((file) => (
                <li key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      {file.fileType && file.fileType.includes('pdf') ? '📄' : '📖'}
                    </div>
                    <div className="file-details-content">
                      <h3>{file.title || file.fileName}</h3>
                      {file.author && <p className="file-author">by {file.author}</p>}
                      <div className="file-meta">
                        <span className="file-type">{file.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.fileSize)}</span>
                        {file.pages && (
                          <>
                            <span>•</span>
                            <span>{file.pages} pages</span>
                          </>
                        )}
                      </div>
                      <p className="upload-date">
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    {file.fileType && file.fileType.includes('pdf') && (
                      <>
                        <button
                          onClick={() => handleView(file.id)}
                          className="btn-view"
                          title="View PDF in browser"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleSummarize(file)}
                          className="btn-summarize"
                          title="Generate AI summary"
                        >
                          📝 Summarize
                        </button>
                        <button
                          onClick={() => handleChatOpen(file)}
                          className="btn-chat"
                          title="Chat with PDF"
                        >
                          💬 Chat
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="btn-download"
                      title="Download file"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="btn-delete"
                      title="Delete file"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* PDF Summary Modal */}
      <PdfSummaryModal
        isOpen={summaryModal.isOpen}
        onClose={() => setSummaryModal({ ...summaryModal, isOpen: false })}
        summary={summaryModal.summary}
        loading={summaryModal.loading}
        fileName={summaryModal.fileName}
      />

      {/* PDF Chat Modal */}
      <PdfChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ ...chatModal, isOpen: false })}
        fileId={chatModal.fileId}
        fileName={chatModal.fileName}
        onSendMessage={handleChatSend}
      />
    </div>
  );
}
