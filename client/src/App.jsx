import { useEffect, useMemo, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth'; // 1. IMPORT THE AUTH SESSION MANAGER
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', text: 'Choose an image to upload.' });
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGallery = async () => {
    try {
      // 2. GET THE VIP WRISTBAND (TOKEN)
      const { tokens } = await fetchAuthSession(); 
      
      const res = await fetch(`${API_BASE_URL}/api/gallery`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken.toString()}` // 3. ATTACH TO REQUEST
        }
      });

      if (!res.ok) throw new Error('Gallery request failed');
      
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
      setStatus({ type: 'error', text: 'Could not load the gallery. Please try again.' });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadGallery = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        
        const res = await fetch(`${API_BASE_URL}/api/gallery`, {
          headers: {
            Authorization: `Bearer ${tokens.accessToken.toString()}`
          }
        });

        if (!res.ok) throw new Error('Gallery request failed');
        
        const data = await res.json();
        if (isMounted) setImages(data);
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
        if (isMounted) setStatus({ type: 'error', text: 'Could not load the gallery. Please try again.' });
      }
    };

    loadGallery();
    return () => { isMounted = false; };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null);
    if (selectedFile) setStatus({ type: 'info', text: `${selectedFile.name} is ready to upload.` });
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: 'error', text: 'Please choose an image file first.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'info', text: 'Requesting upload permission...' });

    try {
      // Grab the token before starting the upload sequence
      const { tokens } = await fetchAuthSession();
      const token = tokens.accessToken.toString();

      // Step A: Request URL (Securely)
      const res = await fetch(
        `${API_BASE_URL}/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`,
        {
          headers: { Authorization: `Bearer ${token}` } // Send token here
        }
      );
      const data = await res.json();

      if (!res.ok || !data.uploadUrl || !data.s3Key) throw new Error('Handshake failed');

      setStatus({ type: 'info', text: 'Uploading image...' });
      
      // Step B: Upload to S3 directly (S3 uses the Presigned URL, no Bearer token needed here!)
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('S3 upload failed');

      setStatus({ type: 'info', text: 'Saving image details...' });
      
      // Step C: Confirm Upload Metadata (Securely)
      const confirmRes = await fetch(`${API_BASE_URL}/api/confirm-upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Send token here
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          s3Key: data.s3Key,
        }),
      });

      if (!confirmRes.ok) throw new Error('Database registration failed');

      setStatus({ type: 'success', text: 'Upload complete. AI tags are processing.' });
      setFile(null);
      await fetchGallery();

      setTimeout(() => {
        fetchGallery();
        setStatus({ type: 'success', text: 'Gallery updated with AI tags.' });
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredImages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return images;

    return images.filter((img) => {
      const fileNameMatches = img.fileName?.toLowerCase().includes(term);
      const tagMatches = img.aiTags?.some((tag) => tag.toLowerCase().includes(term));
      return fileNameMatches || tagMatches;
    });
  }, [images, searchTerm]);

  const emptyMessage = searchTerm.trim() ? 'No results found.' : 'No images uploaded yet.';

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="app-shell">
          <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="eyebrow">AI-powered cloud album</p>
              <h1>Cloud Smart Gallery</h1>
            </div>
            <button onClick={signOut} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Sign Out
            </button>
          </header>

          <section className="upload-panel" aria-labelledby="upload-title">
            <div>
              <h2 id="upload-title">Upload Image</h2>
              <p className="panel-copy">Add a photo and let the gallery organize it with AI tags.</p>
            </div>

            <div className="upload-controls">
              <input type="file" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              <button type="button" onClick={handleUpload} disabled={isUploading}>
                {isUploading && <span className="spinner" aria-hidden="true" />}
                {isUploading ? 'Uploading...' : 'Upload to Cloud'}
              </button>
            </div>
            <p className={`status-message ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.text}</p>
          </section>

          <section className="gallery-tools" aria-label="Gallery search">
            <input type="text" placeholder="Search tags or file names..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </section>

          {filteredImages.length > 0 ? (
            <section className="gallery-grid" aria-label="Uploaded images">
              {filteredImages.map((img) => (
                <article key={img.id} className="image-card">
                  <img src={img.s3Url} alt={img.fileName} />
                  <div className="image-details">
                    <h3>{img.fileName}</h3>
                    <div className="tag-list" aria-label={`${img.fileName} tags`}>
                      {img.aiTags?.length > 0 ? (
                        img.aiTags.map((tag, i) => <span key={`${tag}-${i}`} className="tag">{tag}</span>)
                      ) : (
                        <span className="analyzing">Analyzing...</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="empty-state" aria-live="polite">
              <h2>{emptyMessage}</h2>
              <p>{searchTerm.trim() ? 'Try a different tag or file name.' : 'Your uploaded images will appear here.'}</p>
            </section>
          )}
        </main>
      )}
    </Authenticator>
  );
}

export default App;