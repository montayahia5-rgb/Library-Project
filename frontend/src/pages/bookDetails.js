import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./bookDetails.css";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Book data:', data);
        setBook(data);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await fetch(book.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = book.file_url.split('/').pop() || `${book.title}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!book) return <p>Loading...</p>;

  // Construct the full image URL
  const imageUrl = book.image_url 
    ? `http://localhost:3001/uploads/${book.image_url}`
    : null;

  return (
    <div className="book-details">
      {/* Book Image */}
      {imageUrl && (
        <div className="book-image-container">
          <img 
            src={imageUrl} 
            alt={book.title}
            className="book-image"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
          {imageError && (
            <div className="image-error-message">
              <p>⚠️ Image not available</p>
            </div>
          )}
        </div>
      )}

      <h2>{book.title}</h2>
      <p><b>Author:</b> {book.author}</p>

      {book.category && <p><b>Category:</b> {book.category}</p>}

      {book.description && (
        <p className="description">{book.description}</p>
      )}

      <div className="button-group">
        {/* READ */}
        {book.file_url && (
          <a href={book.file_url} target="_blank" rel="noreferrer">
            <button className="read-btn">📖 Read</button>
          </a>
        )}

        {/* DOWNLOAD */}
        {book.file_url && (
          <button onClick={handleDownload} className="download-btn">
            ⬇️ Download
          </button>
        )}
      </div>
    </div>
  );
}

export default BookDetails;