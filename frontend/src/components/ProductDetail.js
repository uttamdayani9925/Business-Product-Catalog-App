import React, { useState, useEffect } from 'react';
import RatingForm from './RatingForm';
import { useCart } from '../context/CartContext';

const ProductDetail = ({ product, onBack, productServiceUrl, ratingsServiceUrl }) => {
  const [productDetails, setProductDetails] = useState(product);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductDetails();
    fetchRatings();

    // Refresh every 3 seconds to get updated ratings
    const interval = setInterval(() => {
      fetchProductDetails();
      fetchRatings();
    }, 3000);

    return () => clearInterval(interval);
  }, [product._id]);

  const fetchProductDetails = async () => {
    try {
      // Use relative URL - nginx proxies to product-service:5000
      const apiUrl = productServiceUrl ? `${productServiceUrl}/api/products/${product._id}` : `/api/products/${product._id}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.success) {
        setProductDetails(data.data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      // Use relative URL - nginx proxies to ratings-service:5001
      const apiUrl = ratingsServiceUrl ? `${ratingsServiceUrl}/api/ratings/product/${product._id}` : `/api/ratings/product/${product._id}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.success) {
        setRatings(data.data);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    fetchProductDetails();
    fetchRatings();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star active">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star active">★</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div>
      <button className="btn" onClick={onBack} style={{ marginBottom: '32px', background: '#6c757d', color: 'white' }}>
        ← Back to Products
      </button>

      <div className="product-card" style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff' }}>
        {productDetails.imageUrl ? (
          <img
            src={productDetails.imageUrl}
            alt={productDetails.name}
            className="product-card-image"
            style={{ height: '400px' }}
          />
        ) : (
          <div className="product-card-image" style={{
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a0aec0',
            fontSize: '5rem'
          }}>
            📦
          </div>
        )}
        <div className="product-card-content">
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{productDetails.name}</h2>
          <div className="product-price" style={{ fontSize: '2rem', marginBottom: '20px' }}>
            ${productDetails.price.toFixed(2)} <span style={{ fontSize: '1rem', color: '#718096' }}>/ meter</span>
          </div>

          {/* NEW FEATURE: Instant Quote Card */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📄 Instant Quote Card
              </h4>
              <span style={{ fontSize: '0.75rem', background: '#ebf8ff', color: '#3182ce', padding: '4px 8px', borderRadius: '99px', fontWeight: 'bold' }}>B2B EXCLUSIVE</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '16px' }}>
              Generate a professional specification card to share with your clients or team.
            </p>

            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)', border: '1px solid #cbd5e0', borderRadius: '8px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={productDetails.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{productDetails.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#718096' }}>SKU: LUX-{productDetails._id.slice(-6).toUpperCase()}</div>
              </div>
              <button
                onClick={() => {
                  const btn = document.getElementById('dl-btn');
                  const originalText = btn.innerText;
                  btn.innerText = 'Generating...';
                  btn.style.background = '#3182ce';
                  setTimeout(() => {
                    alert('Quote Card Generated! (Mock Download)');
                    btn.innerText = originalText;
                    btn.style.background = '#2b6cb0';
                  }, 1500);
                }}
                id="dl-btn"
                style={{
                  background: '#2b6cb0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s', fontSize: '0.9rem'
                }}
              >
                Download Card
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <button
              onClick={() => addToCart(productDetails)}
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '1.2rem', padding: '16px', background: '#d97706', border: 'none' }}
            >
              Add Quote Request
            </button>
            <a
              href={`https://wa.me/919876543210?text=Hi, I am interested in ${encodeURIComponent(productDetails.name)}`}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{
                background: '#25D366',
                color: 'white',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '1.1rem'
              }}
            >
              💬 WhatsApp
            </a>
          </div>
          <div className="rating" style={{ margin: '20px 0' }}>
            {productDetails.averageRating > 0 ? (
              <div className="rating-badge" style={{ fontSize: '1rem', padding: '6px 12px' }}>
                <div className="stars">{renderStars(productDetails.averageRating)}</div>
                <span>{productDetails.averageRating.toFixed(1)}</span>
              </div>
            ) : null}
            <span className="rating-count" style={{ fontSize: '0.9375rem' }}>
              ({ratings ? ratings.length : (productDetails.ratingsCount || 0)} {(ratings ? ratings.length : productDetails.ratingsCount) === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p style={{ marginBottom: '24px', lineHeight: '1.8', fontSize: '1.1rem', color: '#4a5568' }}>
            {productDetails.description}
          </p>
          <div className="product-category" style={{ fontSize: '0.875rem', marginTop: '16px' }}>
            {productDetails.category}
          </div>
        </div>
      </div>

      <RatingForm
        productId={product._id}
        onRatingSubmitted={handleRatingSubmitted}
        ratingsServiceUrl={ratingsServiceUrl}
      />

      <div className="rating-form" style={{ marginTop: '48px', maxWidth: '900px' }}>
        <h3 style={{ textAlign: 'center' }}>Customer Reviews ({ratings.length})</h3>
        {loading ? (
          <div className="loading" style={{ padding: '40px', color: '#718096' }}>Loading reviews...</div>
        ) : ratings.length === 0 ? (
          <p style={{ color: '#718096', fontSize: '1.1rem', textAlign: 'center', padding: '40px' }}>
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div>
            {ratings.map((rating) => (
              <div
                key={rating._id}
                style={{
                  padding: '20px',
                  marginBottom: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '3px solid #0d6efd'
                }}
              >
                <div className="rating" style={{ marginBottom: '12px' }}>
                  <div className="stars">{renderStars(rating.rating)}</div>
                  <span style={{ marginLeft: '12px', fontWeight: '600', color: '#1a202c' }}>
                    {rating.rating} out of 5
                  </span>
                </div>
                {rating.comment && (
                  <p style={{ marginBottom: '12px', color: '#4a5568', lineHeight: '1.6' }}>{rating.comment}</p>
                )}
                <div style={{ fontSize: '0.875rem', color: '#718096', fontWeight: '500' }}>
                  User: {rating.userId} • {new Date(rating.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

