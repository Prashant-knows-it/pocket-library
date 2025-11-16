import React, { useEffect, useState } from 'react';

export default function Recommendations() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/books');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError('Error loading recommendations. Try again.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  return (
    <section className="recommendations">
      <div className="rec-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>AI Recommendations</h2>
          <p>Hand-picked for you by PocketLibrary's recommendation engine</p>
        </div>
        <button onClick={fetchBooks} disabled={loading} className="rec-refresh-btn">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="rec-error">{error}</div>}

      <div className="rec-grid">
        {loading ? (
          <div className="rec-loading">Loading...</div>
        ) : (
          books.map((book, idx) => (
            <article key={idx} className="rec-card">
              <div className="rec-body">
                <h3>{book.bookTitle}</h3>
                <p className="muted">{book.authorName}</p>
                <span className="rec-genre">{book.genre}</span>
                <p className="rec-desc">{book.description}</p>
                <div className="rec-meta">Pages: {book.numberOfPages}</div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
