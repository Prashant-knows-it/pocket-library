import React, { useState, useEffect, useRef } from 'react';

export default function PdfChatModal({ isOpen, onClose, fileId, fileName, onSendMessage }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMessage = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            // Call the parent's send message handler
            const response = await onSendMessage(fileId, [...messages, userMessage]);

            const aiMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: `Error: ${error.message || 'Failed to get response'}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        if (window.confirm('Clear conversation history?')) {
            setMessages([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pdf-chat-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>💬 Chat with PDF</h2>
                        {fileName && <p className="chat-filename">📄 {fileName}</p>}
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body chat-body">
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="chat-empty-state">
                                <p>👋 Ask me anything about this PDF!</p>
                                <p className="chat-hint">I'll answer based on the document content</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.role}`}>
                                    <div className="message-bubble">
                                        <div className="message-icon">
                                            {msg.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div className="message-content">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="message-bubble">
                                    <div className="message-icon">🤖</div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask a question about this PDF..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button
                            className="btn-send"
                            onClick={handleSend}
                            disabled={loading || !inputValue.trim()}
                        >
                            {loading ? '⏳' : '📤'}
                        </button>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={handleClear} disabled={messages.length === 0}>
                        🗑️ Clear
                    </button>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
