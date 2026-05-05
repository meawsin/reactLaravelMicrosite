import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

// --- PUBLIC NEWSROOM COMPONENT ---
const Newsroom = ({ news, loading }) => (
  <div>
    <h1>Startup Bangladesh Newsroom</h1>
    {loading && <p>Fetching the latest news...</p>}
    {news.map(article => (
      <div key={article.id} style={{ border: '1px solid #ddd', marginBottom: '20px', padding: '15px' }}>
        {/* Show image if the URL is not empty */}
        {article.featured_image && (
          <img 
            src={article.featured_image} 
            alt={article.title} 
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} 
          />
        )}
        <h2>{article.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    ))}
  </div>
);

// --- SECRET ADMIN UPLOADER ---
const AdminUpload = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // New state for image

  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('http://localhost:8080/backend/public/api/news-upload', {
      method: 'POST',

      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        featured_image: imageUrl, // Send the image URL to Laravel
        slug: title.toLowerCase().replace(/ /g, '-') 
      })
    })
    .then(() => {
      alert("News Uploaded Successfully!");
      window.location.href = "/"; // Force refresh to see new data
    });
  };

  return (
    <div style={{ padding: '20px', border: '2px solid green' }}>
      <h1>ADMIN PORTAL</h1>
      <form onSubmit={handleSubmit}>
        <input style={{width: '100%', marginBottom: '10px'}} placeholder="Title" onChange={e => setTitle(e.target.value)} required />
        <input style={{width: '100%', marginBottom: '10px'}} placeholder="Featured Image URL (e.g. https://...)" onChange={e => setImageUrl(e.target.value)} />
        <textarea style={{width: '100%', height: '200px'}} placeholder="Content (HTML allowed)" onChange={e => setContent(e.target.value)} required />
        <button type="submit">Post News</button>
      </form>
    </div>
  );
};

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/backend/public/api/news')
      .then(res => res.json())
      .then(data => { setNews(data); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Routes>
        <Route path="/" element={<Newsroom news={news} loading={loading} />} />
        <Route path="/admin-portal-sbl-2026" element={<AdminUpload />} />
      </Routes>
    </div>
  )
}

export default App