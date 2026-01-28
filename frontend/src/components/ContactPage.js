import React, { useState } from 'react';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = `Hello, I have an inquiry.\n\nName: ${formData.name}\nEmail: ${formData.email}\nRequirement: ${formData.message}`;
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/919979504265?text=${encodedText}`, '_blank');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="container">
            <div className="section-header">
                <h2>Contact & Partnerships</h2>
                <p>Get in touch for bulk lace orders or inquire about our partner businesses.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                {/* Contact Form */}
                <div className="rating-form" style={{ margin: 0 }}>
                    <h3>Send us an Inquiry</h3>
                    {submitted ? (
                        <div className="success">Redirecting to WhatsApp...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Business Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email / WhatsApp No.</label>
                                <input type="text" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Requirement</label>
                                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#25D366', borderColor: '#25D366' }}>
                                Send via WhatsApp
                            </button>
                        </form>
                    )}
                </div>

                {/* Contact Info */}
                <div style={{ padding: '32px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
                    <h3>Get in Touch</h3>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <strong style={{ color: 'var(--primary)' }}>📍 Head Office</strong>
                            <p>Office - 2, Diamond bouse, Ring Road, Surat, 395006.</p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--primary)' }}>📞 WhatsApp</strong>
                            <p>+91 9979504265</p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--primary)' }}>📧 Email</strong>
                            <p>gurukrupaexportinternational@gmail.com</p>
                        </div>

                        <a href="https://wa.me/919979504265" target="_blank" rel="noreferrer" className="btn" style={{ background: '#25D366', marginTop: '12px', justifyContent: 'center' }}>
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Future Divisions */}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '60px' }}>
                <div className="section-header">
                    <h2>Our Future Expansions</h2>
                    <p>We are expanding into premium ethnic wear. Coming soon to our platform.</p>
                </div>

                <div className="product-grid" style={{ marginBottom: '0' }}>
                    {[
                        { title: "Bridal Lehengas", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" },
                        { title: "Designer Sarees", img: "/images/designer_saree.jpg" },
                        { title: "Fashion Kurtis & Tops", img: "/images/fashion_kurti.png" }
                    ].map((div, i) => (
                        <div key={i} className="product-card" style={{ cursor: 'default' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={div.img} alt={div.title} className="product-card-image" style={{ filter: 'grayscale(100%) opacity(0.8)' }} />
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.4)', color: 'white',
                                    fontSize: '1.5rem', fontFamily: 'Playfair Display', fontWeight: 'bold'
                                }}>
                                    Coming Soon
                                </div>
                            </div>
                            <div className="product-card-content" style={{ padding: '16px' }}>
                                <h3 style={{ margin: 0 }}>{div.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
