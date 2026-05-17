import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession, signOut } from 'aws-amplify/auth'; 
import '../App.css'; // Ensure your CSS path is correct based on folder structure

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SmartGallery = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: 'info', text: 'Choose an image to upload.' });
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect this route: If someone tries to go to /app without being logged in, redirect them.
  useEffect(() => {
    fetchAuthSession().catch(() => {
      navigate('/login');
    });
  }, [navigate]);

  const fetchGallery = async () => {
    try {
      const { tokens } = await fetchAuthSession(); 
      const res = await fetch(`${API_BASE_URL}/api/gallery`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken.toString()}` 
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
      const { tokens } = await fetchAuthSession();
      const token = tokens.accessToken.toString();

      const res = await fetch(
        `${API_BASE_URL}/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();

      if (!res.ok || !data.uploadUrl || !data.s3Key) throw new Error('Handshake failed');

      setStatus({ type: 'info', text: 'Uploading image...' });
      
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('S3 upload failed');

      setStatus({ type: 'info', text: 'Saving image details...' });
      
      const confirmRes = await fetch(`${API_BASE_URL}/api/confirm-upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
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

  // Custom Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/'); // Redirect to Landing Page after logging out
    } catch (error) {
      console.error('Error signing out: ', error);
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

  const handleDownload = (url, fileName) => {
  const link = document.createElement('a');

  link.href = url;
  link.target = '_blank';
  link.setAttribute('download', fileName);

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};
  return (
    <main className="app-shell">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="eyebrow">AI-powered cloud album</p>
          <h1>Cloud Smart Gallery</h1>
        </div>
        {/* Updated Sign Out Button */}
        <button onClick={handleSignOut} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
               <div className="image-wrapper">
    <img src={img.s3Url} alt={img.fileName} />

    {/* 3 Dots Menu */}
    <div className="menu-container">
      <button className="menu-button">⋮</button>

      <div className="menu-dropdown">
        <button onClick={() => handleDownload(img.s3Url, img.fileName)}>
  Download
</button>

        {/* Future Delete Option */}
        {/* 
        <button onClick={() => handleDelete(img.id)}>
          Delete
        </button> 
        */}
      </div>
    </div>
  </div>
  
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
  );
};

export default SmartGallery;