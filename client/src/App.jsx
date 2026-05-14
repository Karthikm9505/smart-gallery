import { useState, useEffect } from 'react';

// Use environment variable from Vercel, default to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) setStatus('File Selected');
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please choose an image file first');
      return;
    }
    
    setStatus('Requesting security token...');
    try {
      // UPDATED: Used API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`);
      const data = await res.json();

      if (!data.uploadUrl || !data.s3Key) throw new Error("Handshake failed");

      setStatus('Uploading to S3...');
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file, 
      });

      if (uploadRes.ok) {
        setStatus('Saving to DynamoDB...');
        // UPDATED: Used API_BASE_URL
        const confirmRes = await fetch(`${API_BASE_URL}/api/confirm-upload`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type, 
            s3Key: data.s3Key    
          })
        });

        if (confirmRes.ok) {
          setStatus("Success! Processing tags...");
          fetchGallery(); 
          setFile(null);
          
          // Delayed refresh to catch the AI tags from Lambda
          setTimeout(() => {
            fetchGallery();
            setStatus("Gallery Updated with AI Tags!");
          }, 5000); 
        } else {
          throw new Error("DB registration failed");
        }
      } else {
        setStatus("S3 Upload Failed.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Pipeline failed.");
    }
  };

  const fetchGallery = async () => {
    try {
      // UPDATED: Used API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/gallery`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredImages = images.filter(img => {
    const term = searchTerm.toLowerCase();
    const fileNameMatches = img.fileName?.toLowerCase().includes(term);
    const tagMatches = img.aiTags?.some(tag => tag.toLowerCase().includes(term));
    return fileNameMatches || tagMatches; 
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1>Cloud Smart Gallery</h1>
      
      <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3>Upload Image</h3>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button onClick={handleUpload} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Upload to Cloud
        </button> 
        <p>Status: <strong>{status}</strong></p> 
      </div>

      <input 
        type="text" 
        placeholder="🔍 Search tags (e.g. Parrot, Nature)..." 
        style={{ padding: '12px', width: '100%', maxWidth: '400px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd' }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {filteredImages.map((img) => (
          <div key={img.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img src={img.s3Url} alt={img.fileName} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>{img.fileName}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {img.aiTags?.length > 0 ? (
                  img.aiTags.map((tag, i) => (
                    <span key={i} style={{ fontSize: '10px', background: '#e7f3ff', color: '#007bff', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>{tag}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#999' }}>Analyzing...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;