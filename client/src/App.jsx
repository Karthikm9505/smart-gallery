import { useState, useEffect } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Moved inside the component

  // --- Handlers ---
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
      const res = await fetch(`http://localhost:5000/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`);
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
        const confirmRes = await fetch('http://localhost:5000/api/confirm-upload', {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type, 
            s3Key: data.s3Key    
          })
        });

        if (confirmRes.ok) {
          setStatus("Success! Tracked in DynamoDB.");
          fetchGallery(); // Refresh the list
          setFile(null);
          setTimeout(() => {
          fetchGallery();
          setStatus("Gallery Updated with AI Tags!");
  }, 5000); // 3000ms = 3 seconds
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
      const res = await fetch('http://localhost:5000/api/gallery');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- Search Logic ---
  // This runs automatically whenever 'searchTerm' or 'images' changes
  const filteredImages = images.filter(img => {
    const term = searchTerm.toLowerCase();
    const fileNameMatches = img.fileName?.toLowerCase().includes(term);
    const tagMatches = img.aiTags?.some(tag => tag.toLowerCase().includes(term));
    return fileNameMatches || tagMatches; 
  });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#333', fontSize: '2.5rem' }}>Cloud Smart Gallery</h1>
        <p style={{ color: '#666' }}>AI-Powered Image Discovery</p>
      </header>
      
      {/* Upload Section */}
      <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Upload New Media</h3>
        <input type="file" onChange={handleFileChange} accept="image/*" style={{ marginBottom: '10px' }} />
        <button 
          onClick={handleUpload} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          Upload to Cloud
        </button> 
        <p style={{ fontSize: '14px', marginTop: '15px' }}>Status: <span style={{ fontWeight: 'bold', color: status.includes('failed') ? 'red' : '#007bff'}}>{status}</span></p> 
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search tags (e.g. Parrot, Nature, Coffee)..." 
          style={{ 
            padding: '15px', 
            width: '100%', 
            maxWidth: '500px', 
            borderRadius: '8px', 
            border: '2px solid #ddd',
            fontSize: '16px',
            outline: 'none'
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Gallery Grid Section */}
      {filteredImages.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredImages.map((img) => (
            <div key={img.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img 
                src={img.displayUrl || img.s3Url} 
                alt={img.fileName} 
                style={{ width: '100%', height: '220px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '15px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.fileName}</p>
                
                {/* AI Tags Rendering */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {img.aiTags?.length > 0 ? (
                    img.aiTags.map((tag, i) => (
                      <span key={i} style={{ fontSize: '10px', background: '#e7f3ff', color: '#007bff', padding: '4px 8px', borderRadius: '20px', fontWeight: '600', textTransform: 'uppercase' }}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Analyzing...</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          <h3>No images found matching "{searchTerm}"</h3>
          <p>Try searching for a different tag or upload a new image.</p>
        </div>
      )}
    </div>
  );
}

export default App;