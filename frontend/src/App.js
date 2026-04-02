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

const PRODUCT_SERVICE_URL = '/api/products';
const RATINGS_SERVICE_URL = '/api/ratings';

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
  const [searchQuery, setSearchQuery] = useState('');

  const { toggleCart, cartCount } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = `${PRODUCT_SERVICE_URL}/?limit=1000&sort=createdAt&order=asc`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(null); // Silent fail on homepage to avoid ugly banner if backend sleeping
      console.error('Error fetching products:', err);
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
    setSearchQuery('');
    window.scrollTo(0, 0);
  };

  const handleSearch = (term) => {
    const query = term?.toLowerCase().trim() || '';
    setSearchQuery(query);
    setCurrentPage('catalog');
    setSelectedProduct(null);

    if (!query) {
      setFilteredProducts([]); // [] means show original product list with cat filters
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
      if (filtered.length === 0) alert('No laces found matching "' + query + '"');
    }
  };

  const handleVoiceSearch = (term) => {
    handleSearch(term);
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
            Discover our curated collection. Find your perfect lace below.
          </p>
        </div>

        {/* Catalog Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 40px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search our catalog by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            style={{
              width: '100%',
              padding: '16px 50px 16px 20px',
              borderRadius: '40px',
              border: '2px solid #eee',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: '#fff'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 6px 20px rgba(197,160,89,0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#eee'; e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.4rem'
            }}
          >
            🔍
          </button>
        </div>

        {/* Tab Buttons with Scroll Arrows */}
        <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto 40px', display: 'flex', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={() => document.getElementById('category-scroll').scrollBy({ left: -200, behavior: 'smooth' })}
            style={{ position: 'absolute', left: '-50px', zIndex: 10, fontSize: '1.5rem', background: 'transparent' }}
          >
            ‹
          </button>

          <div
            id="category-scroll"
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '15px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '10px 0',
              scrollBehavior: 'smooth',
              width: '100%'
            }}>
            {['Cotton Lace', 'Polyester Lace', 'GPO Catalog', 'Bridal Lehengas', 'Designer Sarees', 'Fashion Kurtis & Tops'].map((cat) => (
              <button
                key={cat}
                className={`btn ${activeCategory === cat ? 'active-tab' : ''}`}
                style={{
                  background: activeCategory === cat ? 'var(--secondary)' : 'var(--white)',
                  color: activeCategory === cat ? 'white' : 'var(--secondary)',
                  border: '1px solid #ddd',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  borderRadius: '30px',
                  minWidth: 'max-content',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
                onClick={() => {
                  setActiveCategory(cat);
                  setFilteredProducts([]);
                  setSearchQuery('');
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            className="btn"
            onClick={() => document.getElementById('category-scroll').scrollBy({ left: 200, behavior: 'smooth' })}
            style={{ position: 'absolute', right: '-50px', zIndex: 10, fontSize: '1.5rem', background: 'transparent' }}
          >
            ›
          </button>
        </div>

        <div className="section-title">
          <h2>{searchQuery ? `Showing results for "${searchQuery}"` : activeCategory}</h2>
        </div>

        <ProductList
          products={searchQuery ? filteredProducts : (products.filter(p => {
            if (activeCategory === 'Cotton Lace') return p.category === 'Cotton Lace';
            if (activeCategory === 'Polyester Lace') return p.category === 'Polyester Lace';
            if (activeCategory === 'GPO Catalog') return p.category === 'GPO Catalog';
            if (activeCategory === 'Bridal Lehengas') return p.category === 'Bridal Lehengas';
            if (activeCategory === 'Designer Sarees') return p.category === 'Designer Sarees';
            if (activeCategory === 'Fashion Kurtis & Tops') return p.category === 'Fashion Kurtis & Tops';
            return false;
          }))}
          onProductClick={handleProductClick}
        />
      </>
    );
  };

  return (
    <div className="container">
      {/* Navigation Bar */}
      <nav style={{ justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setCurrentPage('home')}>
          <span>✨</span> LUXE LACES
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {token && (
            <button className="btn" onClick={handleLogout} style={{ color: '#ef4444', padding: '10px' }}>Logout</button>
          )}

          {/* Cart Icon */}
          <button className="btn" onClick={toggleCart} style={{ position: 'relative', padding: '10px' }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: 'var(--primary)', color: 'white',
                borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
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
