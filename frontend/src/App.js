import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import CartDrawer from './components/CartDrawer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import AdminDashboard from './components/AdminDashboard';
import ContrastLab from './components/ContrastLab';
import ContactPage from './components/ContactPage';
import VoiceSearch from './components/VoiceSearch';
import HomePage from './components/HomePage';

import mockData from './data/mockProducts.json';

const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || '';
const RATINGS_SERVICE_URL = process.env.REACT_APP_RATINGS_SERVICE_URL || '';

function App() {
  return (
    <CartProvider>
      <MainLayout />
    </CartProvider>
  );
}

const MainLayout = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); // home, catalog, flab (fabric lab), contact, admin, login, signup
  const [user, setUser] = useState(null); // Auth User
  const [token, setToken] = useState(localStorage.getItem('token')); // Auth Token
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* New Tab State */
  const [activeCategory, setActiveCategory] = useState('Cotton Lace');

  const { toggleCart, cartCount } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fix: Ensure we don't duplicate /api/products if it's already in the env var
      // But safest is to assume base URL and append endpoint
      const baseUrl = PRODUCT_SERVICE_URL.includes('/api/products')
        ? PRODUCT_SERVICE_URL
        : `${PRODUCT_SERVICE_URL}/api/products`;

      const apiUrl = `${baseUrl}?limit=1000&sort=createdAt&order=asc`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        if (filteredProducts.length === 0) setFilteredProducts(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.warn('Backend unreachable, switching to Demo Mode (Mock Data):', err);
      // Fallback to Mock Data for Netlify/Demo
      if (mockData && mockData.success) {
        setProducts(mockData.data);
        if (filteredProducts.length === 0) setFilteredProducts(mockData.data);
        setError(null);
      } else {
        setError('Failed to load products (Demo Mode)');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for admin route on load
    if (window.location.pathname === '/admin') {
      setCurrentPage('admin');
    }

    fetchProducts();
    // Refresh products every 5 seconds
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
    fetchProducts();
  };

  // Navigation
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    setFilteredProducts([]); // Clear search filters so fresh products load
    window.scrollTo(0, 0);
  };

  const handleVoiceSearch = (term) => {
    setCurrentPage('catalog'); // Switch to catalog on search
    setSelectedProduct(null);
    if (!term) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
      if (filtered.length === 0) alert('No laces found matching "' + term + '"');
    }
  };

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPage('home');
  };

  const renderContent = () => {
    if (currentPage === 'home') return <HomePage onNavigate={handleNavigate} />;
    if (currentPage === 'flab') return <ContrastLab />;
    if (currentPage === 'contact') return <ContactPage />;
    if (currentPage === 'login') return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />;
    if (currentPage === 'signup') return <SignupPage onLogin={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />;

    if (currentPage === 'admin') {
      if (!token) return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />;
      return <AdminDashboard productServiceUrl={PRODUCT_SERVICE_URL} />;
    }

    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackToList}
          productServiceUrl={PRODUCT_SERVICE_URL}
          ratingsServiceUrl={RATINGS_SERVICE_URL}
        />
      );
    }

    // Catalog View (Default for 'catalog')
    return (
      <>
        <div className="section-header" style={{ textAlign: 'center', margin: '40px 0' }}>
          <h2>Our Premium Collections</h2>
          <p style={{ maxWidth: '600px', margin: '10px auto', color: '#666' }}>
            Discover our curated collection. Select a category below.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
          {['Cotton Lace', 'Polyester Lace', 'Exclusive Zari & Others'].map((cat) => (
            <button
              key={cat}
              className={`btn ${activeCategory === cat ? 'active-tab' : ''}`}
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                color: activeCategory === cat ? 'white' : 'var(--primary)',
                border: '2px solid var(--primary)',
                padding: '10px 24px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="section-title">
          <h2>{activeCategory}</h2>
        </div>

        <ProductList
          products={(filteredProducts.length > 0 ? filteredProducts : products).filter(p => {
            if (activeCategory === 'Cotton Lace') return p.category === 'Cotton Lace';
            if (activeCategory === 'Polyester Lace') return p.category === 'Polyester Lace';
            return p.category !== 'Cotton Lace' && p.category !== 'Polyester Lace';
          })}
          onProductClick={handleProductClick}
        />
      </>
    );
  };

  return (
    <div className="container">
      {/* Navigation Bar */}
      <nav>
        <div style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
          LUXE LACES
        </div>
        <button
          className={`btn ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigate('home')}
        >
          Home
        </button>
        <button
          className={`btn ${currentPage === 'catalog' ? 'active' : ''}`}
          onClick={() => handleNavigate('catalog')}
        >
          Catalog
        </button>
        <button
          className={`btn ${currentPage === 'flab' ? 'active' : ''}`}
          onClick={() => handleNavigate('flab')}
        >
          Lace Lab
        </button>
        <button
          className={`btn ${currentPage === 'contact' ? 'active' : ''}`}
          onClick={() => handleNavigate('contact')}
        >
          Partners
        </button>
        {token && (
          <button className="btn" onClick={handleLogout} style={{ color: '#ef4444' }}>Logout</button>
        )}

        {/* Cart Icon */}
        <button className="btn" onClick={toggleCart} style={{ position: 'relative' }}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-5px',
              background: 'var(--primary)', color: 'white',
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <CartDrawer />

      {/* Show Header only on non-home pages to render content correctly */}
      {currentPage !== 'home' && (
        <div className="header" style={{ borderBottom: '2px solid var(--primary)', padding: '2rem 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--secondary)', letterSpacing: '1px' }}>Luxe Laces</h1>
          <p style={{ fontStyle: 'italic', color: '#718096' }}>Premium Manufacturer & Wholesaler</p>
        </div>
      )}

      {error && currentPage === 'catalog' && <div className="error">{error}</div>}

      {(loading && products.length === 0 && currentPage === 'catalog') ? (
        <div className="loading">Loading products...</div>
      ) : (
        renderContent()
      )}

      {/* Floating Voice Search Button */}
      <VoiceSearch onNavigate={handleNavigate} onSearch={handleVoiceSearch} />
    </div>
  );
};

export default App;
