import React, { useState } from 'react';

const AdminDashboard = ({ productServiceUrl }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Cotton Lace',
        imageUrl: ''
    });
    const [message, setMessage] = useState(null);
    const [stats, setStats] = useState({ totalProducts: 0, categories: 0, inquiries: 12 });

    // Fetch stats on mount
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = productServiceUrl ? `${productServiceUrl}/api/products?limit=1000` : '/api/products?limit=1000';
                const res = await fetch(apiUrl);
                const data = await res.json();
                if (data.success) {
                    const products = data.data;
                    const uniqueCategories = new Set(products.map(p => p.category)).size;
                    setStats({
                        totalProducts: products.length,
                        categories: uniqueCategories,
                        inquiries: 12 // Simulated for now
                    });
                }
            } catch (e) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
    }, [productServiceUrl]);

    const handleSubmit = async (e) => {
        // ... (existing submit logic, maybe refresh stats on success)
        e.preventDefault();
        try {
            const apiUrl = productServiceUrl ? `${productServiceUrl}/api/products` : '/api/products';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Product added successfully!' });
                setFormData({ name: '', description: '', price: '', category: 'Cotton Lace', imageUrl: '' });
                // Re-fetch stats would be ideal, but simple increment works for demo
                setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to add product' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Connection error' });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setMessage({ type: 'info', text: 'Uploading image...' });
            const apiUrl = productServiceUrl ? `${productServiceUrl}/api/upload` : '/api/upload';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: uploadData
            });

            const data = await response.json();
            if (data.success) {
                setFormData({ ...formData, imageUrl: data.imageUrl });
                setMessage({ type: 'success', text: 'Image uploaded successfully!' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Upload failed' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Upload connection failed' });
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <div className="section-header">
                <h2>Admin Dashboard</h2>
                <p>Overview of your business performance.</p>
            </div>

            {/* Analytics Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px', marginBottom: '40px', maxWidth: '1000px', margin: '0 auto 40px'
            }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '3rem', color: '#C5A059', margin: 0 }}>{stats.totalProducts}</h3>
                    <p style={{ color: '#718096', margin: '10px 0 0' }}>Total Products</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '3rem', color: '#C5A059', margin: 0 }}>{stats.categories}</h3>
                    <p style={{ color: '#718096', margin: '10px 0 0' }}>Active Categories</p>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '3rem', color: '#C5A059', margin: 0 }}>{stats.inquiries}</h3>
                    <p style={{ color: '#718096', margin: '10px 0 0' }}>Pending Inquiries</p>
                </div>
            </div>

            <div className="rating-form" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ fontFamily: '"Playfair Display", serif', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                    Add New Product
                </h3>
                {message && (
                    <div className={message.type} style={{ textAlign: 'center', padding: '10px', margin: '10px 0', borderRadius: '4px', background: message.type === 'success' ? '#def7ec' : message.type === 'info' ? '#e0f2fe' : '#fde8e8', color: message.type === 'success' ? '#03543f' : message.type === 'info' ? '#0369a1' : '#9b1c1c' }}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Cotton Lace">Cotton Lace</option>
                            <option value="Zari Lace">Zari Lace</option>
                            <option value="Crochet Lace">Crochet Lace</option>
                            <option value="Polyester Lace">Polyester Lace</option>
                            <option value="Dyeable Lace">Dyeable Lace</option>
                        </select>
                    </div>

                    {/* Image Upload Section */}
                    <div className="form-group">
                        <label>Product Image</label>
                        <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ marginBottom: '10px' }}
                            />
                            {formData.imageUrl && (
                                <div style={{ marginTop: '10px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'green' }}>✓ Image uploaded</p>
                                    <img src={formData.imageUrl} alt="Preview" style={{ height: '60px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                            )}
                        </div>
                        <input type="hidden" required value={formData.imageUrl} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Product</button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
