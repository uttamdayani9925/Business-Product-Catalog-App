import React from 'react';
import { useCart } from '../context/CartContext';

const ProductList = ({ products, onProductClick }) => {
  const { addToCart, cart, removeFromCart } = useCart(); // addToCart acts as toggle/add, cart is inquiry list

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
        <div
          key={product._id}
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
                background: isSelected(product) ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
                color: isSelected(product) ? 'white' : 'var(--primary)',
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
              title={isSelected(product) ? "Remove from Quote" : "Add to Quote"}
            >
              {isSelected(product) ? '✓' : '+'}
            </button>

            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              />
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
      ))}
    </div>
  );
};

export default ProductList;
