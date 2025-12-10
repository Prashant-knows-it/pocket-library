import React, { useState } from 'react';

export default function PdfSummaryModal({ isOpen, onClose, summary, loading, fileName }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pdf-summary-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📝 PDF Summary</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {fileName && <p className="summary-filename">📄 {fileName}</p>}

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Generating summary with AI...</p>
                            <p className="loading-hint">This may take a moment</p>
                        </div>
                    ) : (
                        <div className="summary-content">
                            {summary ? (
                                <pre className="summary-text">{summary}</pre>
                            ) : (
                                <p className="error-text">No summary available</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {!loading && summary && (
                        <button className="btn-copy" onClick={handleCopy}>
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    )}
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
