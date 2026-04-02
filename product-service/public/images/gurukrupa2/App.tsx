import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Products } from './pages/Products';
import { Process } from './pages/Process';
import { Certifications } from './pages/Certifications';
import { Global } from './pages/Global';
import { Contact } from './pages/Contact';
import { SEO } from './components/SEO';

const App: React.FC = () => {
  return (
    <Router>
      <SEO />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/process" element={<Process />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/global" element={<Global />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;