import React, { useState, useEffect } from 'react';
import RatingForm from './RatingForm';
import { useCart } from '../context/CartContext';

const PREMIUM_COLORS = [
  { name: 'Royal Gold', hex: '#C5A059' },
  { name: 'Crimson Red', hex: '#9B1B30' },
  { name: 'Emerald Green', hex: '#046307' },
  { name: 'Midnight Black', hex: '#1A1C1E' },
  { name: 'Ivory White', hex: '#F5F0E8', border: '#c8c0b0' },
  { name: 'Royal Blue', hex: '#1a3a6b' },
];

const ProductDetail = ({ product, onBack, productServiceUrl, ratingsServiceUrl }) => {
  const [productDetails, setProductDetails] = useState(product);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const { addToCart } = useCart();

  const images =
    productDetails.images && productDetails.images.length > 0
      ? productDetails.images
      : productDetails.imageUrl
        ? [productDetails.imageUrl]
        : [];

  useEffect(() => {
    setCurrentImageIndex(0);
    fetchProductDetails();
    fetchRatings();
    const interval = setInterval(() => {
      fetchProductDetails();
      fetchRatings();
    }, 5000);
    return () => clearInterval(interval);
  }, [product._id]);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${productServiceUrl}/${product._id}`);
      const data = await res.json();
      if (data.success) setProductDetails(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ratingsServiceUrl}/product/${product._id}`);
      const data = await res.json();
      if (data.success) setRatings(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < full ? 'active' : ''}`}>
          {i < full ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  const prevImage = () => setCurrentImageIndex(p => (p === 0 ? images.length - 1 : p - 1));
  const nextImage = () => setCurrentImageIndex(p => (p === images.length - 1 ? 0 : p + 1));

  return (
    <div className="product-detail-wrapper">
      {/* Back Button */}
      <button onClick={onBack} className="back-btn">
        ← Back to Products
      </button>

      {/* Main Split Layout */}
      <div className="product-detail-grid">

        {/* ── LEFT COLUMN: Square Image Slider ── */}
        <div className="image-slider-column">
          <div className="image-container">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${productDetails.name} - view ${currentImageIndex + 1}`}
                  className="product-image"
                />

                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="nav-arrow left">‹</button>
                    <button onClick={nextImage} className="nav-arrow right">›</button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image">📦</div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`thumb-btn ${idx === currentImageIndex ? 'active' : ''}`}
                >
                  <img src={img} alt={`thumb ${idx + 1}`} className="thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Product Details ── */}
        <div className="product-info-column">
          <div className="category-badge">
            {productDetails.category}
          </div>

          <h1 className="product-title-large">
            {productDetails.name}
          </h1>

          <div className="rating-row">
            <div className="star-rating">{renderStars(productDetails.averageRating || 0)}</div>
            {productDetails.averageRating > 0 && (
              <span className="rating-num">
                {productDetails.averageRating.toFixed(1)}
              </span>
            )}
            <span className="review-count">
              ({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="price-tag">
            ${productDetails.price.toFixed(2)}
            <span className="price-unit">/ unit</span>
          </div>

          {/* ── Color Selection ── */}
          <div className="color-section">
            <div className="color-header">
              <h4 className="color-title">Available Colors</h4>
              <span className="color-badge">
                {PREMIUM_COLORS[selectedColor].name}
              </span>
            </div>
            <div className="color-swatches">
              {PREMIUM_COLORS.map((color, idx) => (
                <button
                  key={idx}
                  title={color.name}
                  onClick={() => setSelectedColor(idx)}
                  className={`color-swatch ${idx === selectedColor ? 'active' : ''}`}
                  style={{ background: color.hex }}
                />
              ))}
            </div>
          </div>

          <p className="product-description">
            {productDetails.description}
          </p>

          <div className="action-buttons">
            <button onClick={() => addToCart(productDetails)} className="add-to-cart-btn">
              Add to Quote
            </button>
            <a
              href={`https://wa.me/919979504265?text=Inquiry for ${encodeURIComponent(productDetails.name)}`}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-btn"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* Instant Quote Card */}
          <div className="quote-card-container">
            <div className="quote-card-header">
              <h4>📄 Instant Quote Card</h4>
              <span className="b2b-badge">B2B EXCLUSIVE</span>
            </div>
            <div className="quote-card-content">
              <div className="quote-image-preview">
                <img src={images[0] || '/placeholder.png'} alt="preview" />
              </div>
              <div className="quote-text">
                <div className="quote-name">{productDetails.name}</div>
                <div className="quote-sku">SKU: LUX-{productDetails._id.slice(-6).toUpperCase()}</div>
              </div>
              <button onClick={() => alert('Quote card feature coming soon!')} className="download-btn">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="reviews-section">
        <RatingForm
          productId={product._id}
          onRatingSubmitted={() => { fetchProductDetails(); fetchRatings(); }}
          ratingsServiceUrl={ratingsServiceUrl}
        />

        <div className="reviews-list">
          <h3 className="reviews-title">
            Customer Reviews ({ratings.length})
          </h3>
          {loading ? (
            <div className="loading">Loading reviews...</div>
          ) : ratings.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          ) : (
            ratings.map(r => (
              <div key={r._id} className="review-item">
                <div className="review-rating">
                  <div className="stars">{renderStars(r.rating)}</div>
                  <span className="rating-text">{r.rating}/5</span>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
                <div className="review-meta">
                  {r.userId} • {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
