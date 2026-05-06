import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Link, useParams } from 'react-router-dom'
import './App.css'

const API = 'http://localhost:8080/reactLaravelMicrosite/backend/public/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('sbl_admin_token') }
function setToken(t) { localStorage.setItem('sbl_admin_token', t) }
function clearToken() { localStorage.removeItem('sbl_admin_token') }

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    'Accept': 'application/json',
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-main">Startup Bangladesh</span>
          <span className="logo-sub">Newsroom</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">News</Link>
        </nav>
      </div>
    </header>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ article }) {
  return (
    <Link to={`/news/${article.slug}`} className="news-card">
      <div className="card-image-wrap">
        {article.featured_image
          ? <img src={article.featured_image} alt={article.title} className="card-img" />
          : <div className="card-img-placeholder"><span>SBL</span></div>
        }
      </div>
      <div className="card-body">
        <time className="card-date">{formatDate(article.published_at)}</time>
        <h2 className="card-title">{article.title}</h2>
        <span className="card-read-more">Read more →</span>
      </div>
    </Link>
  )
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function Newsroom({ news, loading, pagination, onPageChange }) {
  return (
    <main className="newsroom">
      <section className="newsroom-hero">
        <p className="hero-eyebrow">Official Press &amp; Media</p>
        <h1 className="hero-title">Latest News</h1>
        <div className="hero-line" />
      </section>

      {loading && (
        <div className="loading-wrap">
          <div className="spinner" />
          <p>Loading news…</p>
        </div>
      )}

      {!loading && news.length === 0 && (
        <p className="empty-state">No news articles yet.</p>
      )}

      <div className="news-grid">
        {news.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pagination.current_page === 1}
            onClick={() => onPageChange(pagination.current_page - 1)}
          >
            ← Prev
          </button>

          {[...Array(pagination.last_page)].map((_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${pagination.current_page === i + 1 ? 'active' : ''}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => onPageChange(pagination.current_page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  )
}

function ArticleDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/news/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => { setArticle(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [slug])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (error) return <div className="loading-wrap"><p>Article not found. <button className="btn-link" onClick={() => navigate('/')}>Back to Newsroom</button></p></div>

  return (
    <main className="article-detail">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Newsroom</button>
      {article.featured_image && (
        <div className="article-hero-img-wrap">
          <img src={article.featured_image} alt={article.title} className="article-hero-img" />
        </div>
      )}
      <div className="article-content-wrap">
        <time className="article-date">{formatDate(article.published_at)}</time>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-divider" />
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </main>
  )
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate('/admin')
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      setToken(data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo">SBL</span>
          <p className="login-subtitle">Admin Portal</p>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label className="field-label">Email</label>
            <input type="email" className="field-input" placeholder="admin@startupbangladesh.vc"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input type="password" className="field-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}

function AdminPortal() {
  const navigate = useNavigate()

  // ── Single article form state ──────────────────────────────────
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [publishedAt, setPublishedAt] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  )
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  // ── Bulk import state ──────────────────────────────────────────
  const [importFile, setImportFile] = useState(null)
  const [importStatus, setImportStatus] = useState(null)
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    if (!getToken()) navigate('/admin/login')
  }, [navigate])

  const handleLogout = async () => {
    try {
      await fetch(`${API}/admin/logout`, { method: 'POST', headers: authHeaders() })
    } finally {
      clearToken()
      navigate('/admin/login')
    }
  }

  // ── Single article submit ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    try {
      const res = await fetch(`${API}/admin/news`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title, slug, content,
          featured_image: imageUrl || null,
          published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).flat().join(' '))
        throw new Error(data.message || 'Upload failed')
      }
      setStatus({ type: 'success', msg: `"${data.title}" posted successfully!` })
      setTitle(''); setContent(''); setImageUrl('')
      setPublishedAt(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16))
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  // ── Bulk import submit ─────────────────────────────────────────
  const handleImport = async () => {
    if (!importFile) return
    setImportLoading(true)
    setImportStatus(null)

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const res = await fetch(`${API}/admin/import`, {
        method: 'POST',
        headers: {
          // NOTE: No Content-Type here — browser sets it automatically with multipart boundary
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json',
        },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Import failed')
      setImportStatus({
        type: 'success',
        msg: `✓ ${data.imported} articles imported, ${data.skipped} skipped (duplicates).`
      })
      setImportFile(null)
      // Reset the file input visually
      const fileInput = document.getElementById('import-file')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setImportStatus({ type: 'error', msg: err.message })
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <span className="admin-topbar-title">Admin Portal — Startup Bangladesh</span>
        <div className="admin-topbar-actions">
          <Link to="/" className="admin-nav-link" target="_blank">View Site ↗</Link>
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="admin-content">

        {/* ── Section 1: Post Single Article ── */}
        <h1 className="admin-heading">Post a News Article</h1>
        <p className="admin-subheading">Fill in the details below. You can backdate articles when migrating old news.</p>

        {status && <div className={`form-banner ${status.type}`}>{status.msg}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Title *</label>
            <input type="text" className="field-input"
              placeholder="e.g. Shark Tank Bangladesh: Meet the Sharks"
              value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-row two-col">
            <div className="field">
              <label className="field-label">Featured Image URL</label>
              <input type="url" className="field-input"
                placeholder="https://example.com/image.jpg"
                value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Publish Date *</label>
              <input type="datetime-local" className="field-input"
                value={publishedAt} onChange={e => setPublishedAt(e.target.value)} required />
              <span className="field-hint">Set a past date to backdate migrated articles</span>
            </div>
          </div>
          {imageUrl && (
            <div className="image-preview">
              <span className="field-label">Preview</span>
              <img src={imageUrl} alt="preview" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
          <div className="field">
            <label className="field-label">Content * <span className="field-hint">(HTML supported)</span></label>
            <textarea className="field-input field-textarea"
              placeholder="Write your article content here. HTML tags like <b>, <a>, <p> are supported."
              value={content} onChange={e => setContent(e.target.value)} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Article'}
            </button>
          </div>
        </form>

        {/* ── Section 2: Bulk Import ── */}
        <div className="import-section">
          <h2 className="admin-heading" style={{ fontSize: '1.4rem' }}>Bulk Import News</h2>
          <p className="admin-subheading">
            Upload a <strong>JSON</strong> file exported from WordPress, or an <strong>Excel / CSV</strong> file from the old site.
            Duplicate articles are skipped automatically based on slug.
          </p>

          <div className="import-how">
            <div className="import-how-item">
              <span className="import-how-badge">WordPress → JSON</span>
              <span className="import-how-text">
                Go to <code>localhost:8080/wordpress/wp-json/wp/v2/posts?per_page=100&_embed</code> → Save page as <code>.json</code> → Upload here
              </span>
            </div>
            <div className="import-how-item">
              <span className="import-how-badge">Old Site → Excel/CSV</span>
              <span className="import-how-text">
                Use the Excel sheet with columns: <code>title, date, slug, content, featured_image_url</code>
              </span>
            </div>
          </div>

          {importStatus && (
            <div className={`form-banner ${importStatus.type}`}>{importStatus.msg}</div>
          )}

          <div className="import-drop-area">
            <input
              type="file"
              id="import-file"
              accept=".json,.csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => setImportFile(e.target.files[0])}
            />
            <label htmlFor="import-file" className="import-label">
              {importFile
                ? `📄 ${importFile.name}`
                : '📂 Click to choose file — JSON, CSV, or Excel'}
            </label>
            <button
              className="btn-primary"
              onClick={handleImport}
              disabled={!importFile || importLoading}
            >
              {importLoading ? 'Importing…' : 'Import Now'}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function App() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)

  const fetchNews = (page = 1) => {
    setLoading(true)
    fetch(`${API}/news?page=${page}`)
      .then(r => r.json())
      .then(data => {
        setNews(data.data)           // paginate() wraps in .data
        setPagination({
          current_page: data.current_page,
          last_page:    data.last_page,
          total:        data.total,
        })
        setLoading(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
  fetch(`${API}/news?page=1`)
    .then(r => r.json())
    .then(data => {
      setNews(data.data)
      setPagination({
        current_page: data.current_page,
        last_page:    data.last_page,
        total:        data.total,
      })
      setLoading(false)
    })
    .catch(() => setLoading(false))
}, [])

  return (
    <Routes>
      <Route path="/" element={<><Header /><Newsroom news={news} loading={loading} pagination={pagination} onPageChange={fetchNews} /></>} />
      <Route path="/news/:slug" element={<><Header /><ArticleDetail /></>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPortal />} />
    </Routes>
  )
}

export default App