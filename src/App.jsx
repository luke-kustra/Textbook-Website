import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchBooks = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setSelectedBook(null)
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      )
      const data = await res.json()
      setResults(data.docs || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const getCoverUrl = (coverId, size = 'M') =>
    coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : null

  if (selectedBook) {
    return (
      <div className="app">
        <header>
          <h1 onClick={() => { setSelectedBook(null); setSearched(false); setResults([]) }}>
            TextbookFinder
          </h1>
        </header>
        <main className="book-detail">
          <button className="back-btn" onClick={() => setSelectedBook(null)}>
            &larr; Back to results
          </button>
          <div className="detail-layout">
            <div className="detail-cover">
              {getCoverUrl(selectedBook.cover_i) ? (
                <img src={getCoverUrl(selectedBook.cover_i, 'L')} alt={selectedBook.title} />
              ) : (
                <div className="no-cover-large">No Cover</div>
              )}
            </div>
            <div className="detail-info">
              <h2>{selectedBook.title}</h2>
              <p className="author">
                {selectedBook.author_name?.join(', ') || 'Unknown Author'}
              </p>
              {selectedBook.first_publish_year && (
                <p className="meta">First published: {selectedBook.first_publish_year}</p>
              )}
              {selectedBook.publisher && (
                <p className="meta">Publisher: {selectedBook.publisher.slice(0, 3).join(', ')}</p>
              )}
              {selectedBook.subject && (
                <div className="subjects">
                  <p className="meta-label">Subjects:</p>
                  <div className="tag-list">
                    {selectedBook.subject.slice(0, 8).map((s, i) => (
                      <span key={i} className="tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBook.isbn && (
                <p className="meta">ISBN: {selectedBook.isbn[0]}</p>
              )}
              <a
                className="open-library-link"
                href={`https://openlibrary.org${selectedBook.key}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Open Library &rarr;
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1 onClick={() => { setSearched(false); setResults([]) }}>
          TextbookFinder
        </h1>
      </header>

      <main>
        <form className="search-form" onSubmit={searchBooks}>
          <input
            type="text"
            placeholder="Search for textbooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {!searched && (
          <div className="hero-section">
            <h2>Find Free Textbooks</h2>
            <p>Search millions of books from Open Library</p>
          </div>
        )}

        {loading && <p className="status">Searching...</p>}

        {searched && !loading && results.length === 0 && (
          <p className="status">No results found.</p>
        )}

        {results.length > 0 && (
          <div className="results-grid">
            {results.map((book) => (
              <div
                key={book.key}
                className="book-card"
                onClick={() => setSelectedBook(book)}
              >
                <div className="card-cover">
                  {getCoverUrl(book.cover_i) ? (
                    <img src={getCoverUrl(book.cover_i)} alt={book.title} />
                  ) : (
                    <div className="no-cover">No Cover</div>
                  )}
                </div>
                <div className="card-info">
                  <h3>{book.title}</h3>
                  <p className="author">
                    {book.author_name?.slice(0, 2).join(', ') || 'Unknown'}
                  </p>
                  {book.first_publish_year && (
                    <p className="year">{book.first_publish_year}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
