import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./bookDetails.css";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Book data:', data);
        setBook(data);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!book || !book.file_url) return;
    
    try {
      let fileUrl = book.file_url;
      if (fileUrl && !fileUrl.startsWith('http')) {
        fileUrl = `http://localhost:3001/${fileUrl}`;
      }
      
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = fileUrl.split('/').pop() || `${book.title}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  if (!book) return <p>Loading...</p>;

  // Use full URL
  const imageUrl = `http://localhost:3001/uploads/${book.image_url}`;

  return (
    <div className="book-details">
      <div className="book-image-container">
        <img 
          src={imageUrl}
          alt={book.title}
          className="book-image"
          crossOrigin="anonymous"
          onError={() => {
            console.error('Image failed to load:', imageUrl);
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', imageUrl);
            setImageError(false);
            setImageLoading(false);
          }}
        />
        {imageError && (
          <div className="image-error-message">
            <p>⚠️ Image not available</p>
            <p style={{fontSize: '12px'}}>URL: {imageUrl}</p>
            <p style={{fontSize: '11px', color: 'blue'}}>
              <a href={imageUrl} target="_blank" rel="noreferrer">Click here to open image directly</a>
            </p>
          </div>
        )}
      </div>

      <h2>{book.title}</h2>
      <p><b>Author:</b> {book.author}</p>

      {book.category && <p><b>Category:</b> {book.category}</p>}

      {book.description && (
        <p className="description">{book.description}</p>
      )}

      <div className="button-group">
        {book.file_url && (
          <a 
            href={book.file_url.startsWith('http') ? book.file_url : `http://localhost:3001/${book.file_url}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <button className="read-btn">📖 Read</button>
          </a>
        )}

  
      </div>
    </div>
  );
}

export default BookDetails;