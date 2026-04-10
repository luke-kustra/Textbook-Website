import { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './StartUpClub Logo.png'

const MAJORS = [
  { label: 'Computer Science', query: 'computer science programming textbook' },
  { label: 'Mathematics', query: 'calculus linear algebra discrete math textbook' },
  { label: 'Physics', query: 'university physics textbook classical mechanics' },
  { label: 'Chemistry', query: 'general chemistry textbook organic chemistry' },
  { label: 'Biology', query: 'cell biology molecular biology genetics textbook' },
  { label: 'Engineering', query: 'electrical engineering circuits signals textbook' },
  { label: 'Economics', query: 'principles economics microeconomics textbook' },
  { label: 'Psychology', query: 'introduction psychology textbook cognitive' },
]

function BookRow({ major, onBookClick, rowRef, onSeeAll }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(major.query)}&limit=12`
        )
        const data = await res.json()
        const withCovers = (data.docs || []).filter(b => b.cover_i)
        setBooks(withCovers)
      } catch {
        setBooks([])
      }
      setLoading(false)
    }
    fetchBooks()
  }, [major.query])

  const getCoverUrl = (coverId) =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null

  const displayedBooks = books.slice(0, 5)

  if (!loading && books.length === 0) return null

  return (
    <div className="book-row" ref={rowRef}>
      <div className="row-header">
        <h3 className="row-title">{major.label}</h3>
        {books.length > 5 && (
          <button className="expand-btn" onClick={() => onSeeAll(major)}>
            See All
          </button>
        )}
      </div>
      {loading ? (
        <p className="status">Loading...</p>
      ) : (
        <div className="row-grid">
          {displayedBooks.map(book => (
            <div key={book.key} className="shelf-card" onClick={() => onBookClick(book)}>
              <div className="shelf-cover">
                {getCoverUrl(book.cover_i) ? (
                  <img src={getCoverUrl(book.cover_i)} alt={book.title} />
                ) : (
                  <div className="no-cover">No Cover</div>
                )}
              </div>
              <p className="shelf-title">{book.title}</p>
              <p className="shelf-author">{book.author_name?.[0] || 'Unknown'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MajorPage({ major, onBookClick, onBack }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(major.query)}&limit=100`
        )
        const data = await res.json()
        const withCovers = (data.docs || []).filter(b => b.cover_i)
        setBooks(withCovers)
      } catch {
        setBooks([])
      }
      setLoading(false)
    }
    fetchBooks()
  }, [major.query])

  const getCoverUrl = (coverId) =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null

  return (
    <div className="major-page">
      <div className="major-dashboard">
        <h2 className="major-dashboard-title">{major.label}</h2>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
      <p className="major-subtitle">Full Library</p>
      {loading ? (
        <p className="status">Loading full library...</p>
      ) : books.length === 0 ? (
        <p className="status">No books found.</p>
      ) : (
        <div className="results-grid">
          {books.map(book => (
            <div key={book.key} className="book-card" onClick={() => onBookClick(book)}>
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
    </div>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sortOrder, setSortOrder] = useState('none')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [hoveredRecent, setHoveredRecent] = useState(null)
  const [selectedMajor, setSelectedMajor] = useState(null)

  const rowRefs = useRef({})

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed')
    if (stored) setRecentlyViewed(JSON.parse(stored))
  }, [])

  const addToRecentlyViewed = (book) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(b => b.key !== book.key)
      const updated = [book, ...filtered].slice(0, 10)
      localStorage.setItem('recentlyViewed', JSON.stringify(updated))
      return updated
    })
  }

  const removeFromRecentlyViewed = (e, bookKey) => {
    e.stopPropagation()
    setRecentlyViewed(prev => {
      const updated = prev.filter(b => b.key !== bookKey)
      localStorage.setItem('recentlyViewed', JSON.stringify(updated))
      return updated
    })
  }

  const clearRecentlyViewed = () => {
    setRecentlyViewed([])
    localStorage.removeItem('recentlyViewed')
  }

  const openBook = (book) => {
    addToRecentlyViewed(book)
    setSelectedBook(book)
  }

  const searchBooks = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setSelectedBook(null)
    setSortOrder('none')
    setSubjectFilter('')
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

  const handleMajorFilter = (majorLabel) => {
    if (!majorLabel) return
    const el = rowRefs.current[majorLabel]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getCoverUrl = (coverId, size = 'M') =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null

  const allSubjects = [...new Set(
    results.flatMap(book => book.subject?.slice(0, 3) || [])
  )].slice(0, 20)

  let displayedResults = [...results]

  if (subjectFilter) {
    displayedResults = displayedResults.filter(book =>
      book.subject?.some(s => s === subjectFilter)
    )
  }

  if (sortOrder === 'newest') {
    displayedResults.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0))
  } else if (sortOrder === 'oldest') {
    displayedResults.sort((a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0))
  }

  if (selectedMajor && !selectedBook) {
    return (
      <div className="app">
        <header>
          <div className="header-brand" onClick={() => { setSelectedMajor(null); setSearched(false); setResults([]) }}>
            <img src={logo} alt="Logo" className="header-logo" />
            <h1>TextbookFinder</h1>
          </div>
        </header>
        <main>
          <MajorPage
            major={selectedMajor}
            onBookClick={openBook}
            onBack={() => setSelectedMajor(null)}
          />
        </main>
      </div>
    )
  }

  if (selectedBook) {
    return (
      <div className="app">
        <header>
          <div className="header-brand" onClick={() => { setSelectedBook(null); setSearched(false); setResults([]) }}>
            <img src={logo} alt="Logo" className="header-logo" />
            <h1>TextbookFinder</h1>
          </div>
        </header>
        <main className="book-detail">
          <button className="back-btn" onClick={() => setSelectedBook(null)}>
            Back to results
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
                View on Open Library
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
        <div className="header-brand" onClick={() => { setSearched(false); setResults([]) }}>
          <img src={logo} alt="Logo" className="header-logo" />
          <h1>TextbookFinder</h1>
        </div>
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
          <>
            <div className="hero-section">
              <h2>Find Free Textbooks</h2>
              <p>Search millions of books from Open Library</p>
            </div>

            <div className="major-filter-bar">
              <label className="major-filter-label">Filter by Major</label>
              <select
                defaultValue=""
                onChange={(e) => handleMajorFilter(e.target.value)}
              >
                <option value="" disabled>Select a major...</option>
                {MAJORS.map(m => (
                  <option key={m.label} value={m.label}>{m.label}</option>
                ))}
              </select>
            </div>

            {recentlyViewed.length > 0 && (
              <div className="book-row">
                <div className="row-header">
                  <h3 className="row-title">Recently Viewed</h3>
                  <button className="clear-all-btn" onClick={clearRecentlyViewed}>
                    Clear All
                  </button>
                </div>
                <div className="row-grid">
                  {recentlyViewed.slice(0, 5).map(book => (
                    <div
                      key={book.key}
                      className="shelf-card recent-card"
                      onClick={() => openBook(book)}
                      onMouseEnter={() => setHoveredRecent(book.key)}
                      onMouseLeave={() => setHoveredRecent(null)}
                    >
                      <div className="shelf-cover">
                        {getCoverUrl(book.cover_i) ? (
                          <img src={getCoverUrl(book.cover_i)} alt={book.title} />
                        ) : (
                          <div className="no-cover">No Cover</div>
                        )}
                        {hoveredRecent === book.key && (
                          <button
                            className="remove-btn"
                            onClick={(e) => removeFromRecentlyViewed(e, book.key)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="shelf-title">{book.title}</p>
                      <p className="shelf-author">{book.author_name?.[0] || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {MAJORS.map(major => (
              <BookRow
                key={major.label}
                major={major}
                onBookClick={openBook}
                rowRef={el => rowRefs.current[major.label] = el}
                onSeeAll={(m) => setSelectedMajor(m)}
              />
            ))}
          </>
        )}

        {loading && <p className="status">Searching...</p>}

        {searched && !loading && results.length === 0 && (
          <p className="status">No results found.</p>
        )}

        {results.length > 0 && (
          <>
            <div className="filter-bar">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="none">Sort: Default</option>
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="">Filter by Subject</option>
                {allSubjects.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
              {(sortOrder !== 'none' || subjectFilter) && (
                <button onClick={() => { setSortOrder('none'); setSubjectFilter('') }}>
                  Clear Filters
                </button>
              )}
            </div>

            <p className="status">{displayedResults.length} result{displayedResults.length !== 1 ? 's' : ''}</p>

            <div className="results-grid">
              {displayedResults.map((book) => (
                <div key={book.key} className="book-card" onClick={() => openBook(book)}>
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
          </>
        )}
      </main>
    </div>
  )
}

export default App
