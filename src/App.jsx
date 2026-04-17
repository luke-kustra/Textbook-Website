import { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './StartUpClub Logo.png'

const MAJORS = [
  { label: 'Computer Science', query: 'programming software', fallback: 'computer science' },
  { label: 'Mathematics', query: 'mathematics calculus', fallback: 'algebra geometry' },
  { label: 'Physics', query: 'physics science', fallback: 'mechanics thermodynamics' },
  { label: 'Chemistry', query: 'chemistry science', fallback: 'organic chemistry' },
  { label: 'Biology', query: 'biology science', fallback: 'genetics evolution' },
  { label: 'Engineering', query: 'engineering design', fallback: 'electrical mechanical' },
  { label: 'Economics', query: 'economics finance', fallback: 'microeconomics macroeconomics' },
  { label: 'Psychology', query: 'psychology behavior', fallback: 'cognitive psychology' },
]

function BookGraphic() {
  return (
    <svg className="book-graphic" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
      <rect className="book-back" x="10" y="8" width="52" height="68" rx="4" />
      <rect className="book-page1" x="14" y="5" width="48" height="68" rx="3" />
      <rect className="book-page2" x="18" y="2" width="48" height="68" rx="3" />
      <rect className="book-front" x="12" y="10" width="50" height="68" rx="4" />
      <rect className="book-spine" x="12" y="10" width="6" height="68" rx="2" />
      <line className="book-line" x1="24" y1="28" x2="56" y2="28" strokeWidth="2.5" strokeLinecap="round" />
      <line className="book-line" x1="24" y1="38" x2="56" y2="38" strokeWidth="2.5" strokeLinecap="round" />
      <line className="book-line" x1="24" y1="48" x2="48" y2="48" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-cover shimmer" />
      <div className="skeleton-line shimmer" style={{ width: '90%' }} />
      <div className="skeleton-line shimmer" style={{ width: '60%' }} />
    </div>
  )
}

function StarRating({ rating }) {
  if (!rating) return null
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <div className="star-rating">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(empty)}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  )
}

function BookmarkBtn({ book, favorites, onToggle }) {
  const isSaved = favorites.some(f => f.key === book.key)
  return (
    <button
      className={`bookmark-btn ${isSaved ? 'saved' : ''}`}
      onClick={(e) => { e.stopPropagation(); onToggle(book) }}
      title={isSaved ? 'Remove from My List' : 'Add to My List'}
    >
      {isSaved ? '★' : '☆'}
    </button>
  )
}

function ScrollRow({ books, loading, onBookClick, favorites, onToggleFavorite, skeletonCount = 8, rankNumbers = false }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows)
    updateArrows()
    return () => el.removeEventListener('scroll', updateArrows)
  }, [books])

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 500, behavior: 'smooth' })
  }

  const getCoverUrl = (coverId) =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null

  return (
    <div className="scroll-row-wrapper">
      <div className={`scroll-fade left ${canScrollLeft ? 'visible' : ''}`} onClick={() => canScrollLeft && scroll(-1)}>
        <span className="scroll-chevron">&#8249;</span>
      </div>
      <div className="scroll-row" ref={scrollRef}>
        {loading
          ? Array(skeletonCount).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : books.map((book, index) => (
            <div key={book.key} className={`shelf-card ${rankNumbers ? 'top10-card' : ''}`} onClick={() => onBookClick(book)}>
              {rankNumbers && <div className="top10-rank">{index + 1}</div>}
              <div className="shelf-cover">
                {getCoverUrl(book.cover_i) ? (
                  <img src={getCoverUrl(book.cover_i)} alt={book.title} />
                ) : (
                  <div className="no-cover">No Cover</div>
                )}
                <BookmarkBtn book={book} favorites={favorites} onToggle={onToggleFavorite} />
              </div>
              <p className="shelf-title">{book.title}</p>
              <p className="shelf-author">{book.author_name?.[0] || 'Unknown'}</p>
              {book.ratings_average && <StarRating rating={book.ratings_average} />}
            </div>
          ))
        }
      </div>
      <div className={`scroll-fade right ${canScrollRight && !loading ? 'visible' : ''}`} onClick={() => canScrollRight && scroll(1)}>
        <span className="scroll-chevron">&#8250;</span>
      </div>
    </div>
  )
}

function Top10Row({ onBookClick, favorites, onToggleFavorite }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=textbook&sort=rating&limit=30`)
        const data = await res.json()
        const withCovers = (data.docs || []).filter(b => b.cover_i).slice(0, 10)
        setBooks(withCovers)
      } catch {
        setBooks([])
      }
      setLoading(false)
    }
    fetchTop()
  }, [])

  if (!loading && books.length === 0) return null

  return (
    <div className="book-row">
      <div className="row-header">
        <h3 className="row-title top10-title">Top 10 Textbooks</h3>
      </div>
      <ScrollRow books={books} loading={loading} onBookClick={onBookClick} favorites={favorites} onToggleFavorite={onToggleFavorite} rankNumbers={true} />
    </div>
  )
}

function BookRow({ major, onBookClick, rowRef, onSeeAll, favorites, onToggleFavorite }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(major.query)}&limit=30`)
        let data = await res.json()
        let withCovers = (data.docs || []).filter(b => b.cover_i)
        if (withCovers.length < 3 && major.fallback) {
          res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(major.fallback)}&limit=30`)
          data = await res.json()
          withCovers = (data.docs || []).filter(b => b.cover_i)
        }
        setBooks(withCovers)
      } catch {
        setBooks([])
      }
      setLoading(false)
    }
    fetchBooks()
  }, [major.query])

  if (!loading && books.length === 0) return null

  return (
    <div className="book-row" ref={rowRef}>
      <div className="row-header">
        <h3 className="row-title">{major.label} {!loading && <span className="row-count">({books.length})</span>}</h3>
        {!loading && books.length > 0 && (
          <button className="expand-btn" onClick={() => onSeeAll(major)}>See All</button>
        )}
      </div>
      <ScrollRow books={books} loading={loading} onBookClick={onBookClick} favorites={favorites} onToggleFavorite={onToggleFavorite} />
    </div>
  )
}

function MajorPage({ major, onBookClick, onBack, favorites, onToggleFavorite }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(major.query)}&limit=100`)
        const data = await res.json()
        setBooks((data.docs || []).filter(b => b.cover_i))
      } catch {
        setBooks([])
      }
      setLoading(false)
    }
    fetchBooks()
  }, [major.query])

  const getCoverUrl = (coverId) => coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null

  return (
    <div className="major-page">
      <div className="major-dashboard">
        <h2 className="major-dashboard-title">{major.label}</h2>
        <button className="back-btn" onClick={onBack}>Back</button>
      </div>
      <p className="major-subtitle">Full Library</p>
      {loading ? (
        <div className="results-grid">{Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : books.length === 0 ? (
        <p className="status">No books found.</p>
      ) : (
        <div className="results-grid">
          {books.map(book => (
            <div key={book.key} className="book-card" onClick={() => onBookClick(book)}>
              <div className="card-cover">
                {getCoverUrl(book.cover_i) ? <img src={getCoverUrl(book.cover_i)} alt={book.title} /> : <div className="no-cover">No Cover</div>}
                <BookmarkBtn book={book} favorites={favorites} onToggle={onToggleFavorite} />
              </div>
              <div className="card-info">
                <h3>{book.title}</h3>
                <p className="author">{book.author_name?.slice(0, 2).join(', ') || 'Unknown'}</p>
                {book.first_publish_year && <p className="year">{book.first_publish_year}</p>}
                {book.ratings_average && <StarRating rating={book.ratings_average} />}
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
  const [description, setDescription] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const rowRefs = useRef({})
  const myListRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed')
    if (stored) setRecentlyViewed(JSON.parse(stored))
    const storedFavs = localStorage.getItem('favorites')
    if (storedFavs) setFavorites(JSON.parse(storedFavs))
    const storedHistory = localStorage.getItem('searchHistory')
    if (storedHistory) setSearchHistory(JSON.parse(storedHistory))
  }, [])

  useEffect(() => {
    const handleClick = (e) => { if (!e.target.closest('.search-wrapper')) setShowHistory(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!selectedBook) return
    setDescription('')
    setDownloadUrl(null)
    setPdfLoading(false)
    fetch(`https://openlibrary.org${selectedBook.key}.json`)
      .then(res => res.json())
      .then(data => {
        const desc = data.description
        setDescription(typeof desc === 'string' ? desc : desc?.value || '')
      })
      .catch(() => {})
    if (selectedBook.ia?.length > 0) {
      setPdfLoading(true)
      fetch(`http://localhost:5000/api/download?ia=${selectedBook.ia[0]}`)
        .then(res => res.json())
        .then(data => setDownloadUrl(data.downloadUrl ?? null))
        .catch(() => setDownloadUrl(null))
        .finally(() => setPdfLoading(false))
    }
  }, [selectedBook])

  const toggleFavorite = (book) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.key === book.key)
      const updated = exists ? prev.filter(f => f.key !== book.key) : [book, ...prev]
      localStorage.setItem('favorites', JSON.stringify(updated))
      return updated
    })
  }

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

  const addToHistory = (q) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== q)
      const updated = [q, ...filtered].slice(0, 5)
      localStorage.setItem('searchHistory', JSON.stringify(updated))
      return updated
    })
  }

  const removeFromHistory = (e, q) => {
    e.stopPropagation()
    setSearchHistory(prev => {
      const updated = prev.filter(h => h !== q)
      localStorage.setItem('searchHistory', JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const openBook = (book) => {
    addToRecentlyViewed(book)
    setSelectedBook(book)
  }

  const searchBooks = async (e, overrideQuery) => {
    if (e) e.preventDefault()
    const q = overrideQuery || query
    if (!q.trim()) return
    setShowHistory(false)
    addToHistory(q.trim())
    setLoading(true)
    setSearched(true)
    setSelectedBook(null)
    setSortOrder('none')
    setSubjectFilter('')
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`)
      const data = await res.json()
      setResults(data.docs || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleHistoryClick = (q) => { setQuery(q); searchBooks(null, q) }

  const handleMajorFilter = (majorLabel) => {
    if (!majorLabel) return
    const el = rowRefs.current[majorLabel]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToMyList = () => {
    if (myListRef.current) myListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getCoverUrl = (coverId, size = 'M') =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null

  const allSubjects = [...new Set(results.flatMap(book => book.subject?.slice(0, 3) || []))].slice(0, 20)

  let displayedResults = [...results]
  if (subjectFilter) displayedResults = displayedResults.filter(book => book.subject?.some(s => s === subjectFilter))
  if (sortOrder === 'newest') displayedResults.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0))
  else if (sortOrder === 'oldest') displayedResults.sort((a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0))

  const HeaderBar = ({ onHome }) => (
    <header>
      <div className="header-inner">
        <div className="header-brand" onClick={onHome}>
          <img src={logo} alt="Logo" className="header-logo" />
          <h1>TextbookFinder</h1>
        </div>
        <button className="header-mylist-btn" onClick={scrollToMyList}>
          ★ My List {favorites.length > 0 && <span>({favorites.length})</span>}
        </button>
      </div>
    </header>
  )

  if (selectedMajor && !selectedBook) {
    return (
      <div className="app">
        <HeaderBar onHome={() => { setSelectedMajor(null); setSearched(false); setResults([]) }} />
        <main>
          <MajorPage major={selectedMajor} onBookClick={openBook} onBack={() => setSelectedMajor(null)} favorites={favorites} onToggleFavorite={toggleFavorite} />
        </main>
      </div>
    )
  }

  if (selectedBook) {
    const isSaved = favorites.some(f => f.key === selectedBook.key)
    return (
      <div className="app">
        <HeaderBar onHome={() => { setSelectedBook(null); setSearched(false); setResults([]) }} />
        <main className="book-detail">
          <button className="back-btn" onClick={() => setSelectedBook(null)}>Back to results</button>
          <div className="detail-layout">
            <div className="detail-cover">
              {getCoverUrl(selectedBook.cover_i) ? <img src={getCoverUrl(selectedBook.cover_i, 'L')} alt={selectedBook.title} /> : <div className="no-cover-large">No Cover</div>}
              <button className={`detail-bookmark-btn ${isSaved ? 'saved' : ''}`} onClick={() => toggleFavorite(selectedBook)}>
                {isSaved ? '★ Saved to My List' : '☆ Add to My List'}
              </button>
            </div>
            <div className="detail-info">
              <h2>{selectedBook.title}</h2>
              <p className="author">{selectedBook.author_name?.join(', ') || 'Unknown Author'}</p>
              {selectedBook.ratings_average && <StarRating rating={selectedBook.ratings_average} />}
              {selectedBook.first_publish_year && <p className="meta">First published: {selectedBook.first_publish_year}</p>}
              {selectedBook.publisher && <p className="meta">Publisher: {selectedBook.publisher.slice(0, 3).join(', ')}</p>}
              {selectedBook.subject && (
                <div className="subjects">
                  <p className="meta-label">Subjects:</p>
                  <div className="tag-list">{selectedBook.subject.slice(0, 8).map((s, i) => <span key={i} className="tag">{s}</span>)}</div>
                </div>
              )}
              {selectedBook.isbn && <p className="meta">ISBN: {selectedBook.isbn[0]}</p>}
              {description && <p className="meta description">{description}</p>}
              {pdfLoading && <p className="meta">Checking PDF availability...</p>}
              {!pdfLoading && selectedBook.ia?.length > 0 && (downloadUrl ? <a className="download-btn" href={downloadUrl} target="_blank" rel="noopener noreferrer">Download PDF</a> : <p className="meta">No PDF available</p>)}
              <a className="open-library-link" href={`https://openlibrary.org${selectedBook.key}`} target="_blank" rel="noopener noreferrer">View on Open Library</a>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <HeaderBar onHome={() => { setSearched(false); setResults([]) }} />

      <main>
        <div className="search-wrapper">
          <form className="search-form" onSubmit={searchBooks}>
            <input
              type="text"
              placeholder="Search for textbooks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          {showHistory && searchHistory.length > 0 && (
            <div className="history-dropdown">
              <div className="history-header">
                <span>Recent Searches</span>
                <button className="history-clear-all" onClick={clearHistory}>Clear All</button>
              </div>
              {searchHistory.map((q, i) => (
                <div key={i} className="history-item" onClick={() => handleHistoryClick(q)}>
                  <span className="history-icon">&#128269;</span>
                  <span className="history-text">{q}</span>
                  <button className="history-remove" onClick={(e) => removeFromHistory(e, q)}>&#10005;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!searched && (
          <>
            <div className="hero-section">
              <BookGraphic />
              <div className="hero-text">
                <h2>Find Free Textbooks</h2>
                <p>Search millions of books from Open Library</p>
              </div>
              <BookGraphic />
            </div>

            <div className="major-filter-bar">
              <label className="major-filter-label">Filter by Major</label>
              <select defaultValue="" onChange={(e) => handleMajorFilter(e.target.value)}>
                <option value="" disabled>Select a major...</option>
                {MAJORS.map(m => <option key={m.label} value={m.label}>{m.label}</option>)}
              </select>
            </div>

            {recentlyViewed.length > 0 && (
              <div className="book-row">
                <div className="row-header">
                  <h3 className="row-title">Recently Viewed <span className="row-count">({recentlyViewed.length})</span></h3>
                  <button className="clear-all-btn" onClick={clearRecentlyViewed}>Clear All</button>
                </div>
                <div className="scroll-row-wrapper">
                  <div className="scroll-row">
                    {recentlyViewed.map(book => (
                      <div key={book.key} className="shelf-card recent-card" onClick={() => openBook(book)} onMouseEnter={() => setHoveredRecent(book.key)} onMouseLeave={() => setHoveredRecent(null)}>
                        <div className="shelf-cover">
                          {getCoverUrl(book.cover_i) ? <img src={getCoverUrl(book.cover_i)} alt={book.title} /> : <div className="no-cover">No Cover</div>}
                          {hoveredRecent === book.key && <button className="remove-btn" onClick={(e) => removeFromRecentlyViewed(e, book.key)}>Remove</button>}
                        </div>
                        <p className="shelf-title">{book.title}</p>
                        <p className="shelf-author">{book.author_name?.[0] || 'Unknown'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Top10Row onBookClick={openBook} favorites={favorites} onToggleFavorite={toggleFavorite} />

            {MAJORS.map(major => (
              <BookRow key={major.label} major={major} onBookClick={openBook} rowRef={el => rowRefs.current[major.label] = el} onSeeAll={(m) => setSelectedMajor(m)} favorites={favorites} onToggleFavorite={toggleFavorite} />
            ))}

            <div className="book-row" ref={myListRef}>
              <div className="row-header">
                <h3 className="row-title">My List <span className="row-count">({favorites.length})</span></h3>
              </div>
              {favorites.length === 0 ? (
                <p className="my-list-empty">Books you save will appear here. Click ☆ on any book to add it.</p>
              ) : (
                <ScrollRow books={favorites} loading={false} onBookClick={openBook} favorites={favorites} onToggleFavorite={toggleFavorite} />
              )}
            </div>
          </>
        )}

        {loading && <p className="status">Searching...</p>}
        {searched && !loading && results.length === 0 && <p className="status">No results found.</p>}

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
                {allSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
              {(sortOrder !== 'none' || subjectFilter) && (
                <button onClick={() => { setSortOrder('none'); setSubjectFilter('') }}>Clear Filters</button>
              )}
            </div>
            <p className="status">{displayedResults.length} result{displayedResults.length !== 1 ? 's' : ''}</p>
            <div className="results-grid">
              {displayedResults.map((book) => (
                <div key={book.key} className="book-card" onClick={() => openBook(book)}>
                  <div className="card-cover">
                    {getCoverUrl(book.cover_i) ? <img src={getCoverUrl(book.cover_i)} alt={book.title} /> : <div className="no-cover">No Cover</div>}
                    <BookmarkBtn book={book} favorites={favorites} onToggle={toggleFavorite} />
                  </div>
                  <div className="card-info">
                    <h3>{book.title}</h3>
                    <p className="author">{book.author_name?.slice(0, 2).join(', ') || 'Unknown'}</p>
                    {book.first_publish_year && <p className="year">{book.first_publish_year}</p>}
                    {book.ratings_average && <StarRating rating={book.ratings_average} />}
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
