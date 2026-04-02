import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onProductClick, isSelected, handleToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="product-card-premium"
      onClick={() => onProductClick(product)}
      style={{ cursor: 'pointer', group: 'card' }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', background: '#f7fafc', marginBottom: '20px' }}>
        {/* Selection Overlay Button */}
        <button
          onClick={(e) => handleToggle(e, product)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
            color: isSelected ? 'white' : 'var(--primary)',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title={isSelected ? "Remove from Quote" : "Add to Quote"}
        >
          {isSelected ? '✓' : '+'}
        </button>

        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#f8f9fa',
                transition: 'transform 0.5s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 15,
                    fontSize: '24px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 15,
                    fontSize: '24px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  ›
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  zIndex: 5
                }}>
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: idx === currentImageIndex ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#cbd5e0', fontSize: '3rem'
          }}>
            📦
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          color: '#C5A059',
          fontSize: '0.8rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          {product.category.replace(' Lace', '')} SERIES
        </div>
        {/* Title Below Image */}
        <h3 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.4rem',
          color: '#1a202c',
          marginBottom: '0',
          fontWeight: 'normal'
        }}>
          {product.name}
        </h3>
      </div>
    </div>
  );
};

const ProductList = ({ products, onProductClick }) => {
  const { addToCart, cart, removeFromCart } = useCart();

  const isSelected = (product) => cart.some(item => item._id === product._id);

  const handleToggle = (e, product) => {
    e.stopPropagation();
    if (isSelected(product)) {
      removeFromCart(product._id);
    } else {
      addToCart(product);
    }
  };

  if (products.length === 0) {
    return (
      <div className="loading" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        margin: '48px 0',
        color: '#718096',
        textAlign: 'center',
        padding: '40px'
      }}>
        No products found in this category.
      </div>
    );
  }

  return (
    <div className="product-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '40px',
      padding: '20px 0'
    }}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onProductClick={onProductClick}
          isSelected={isSelected(product)}
          handleToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export default ProductList;

