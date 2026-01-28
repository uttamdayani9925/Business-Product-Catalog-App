import React from 'react';
import { useInquiry } from '../context/CartContext';

const InquiryDrawer = () => {
    const { inquiryItems, isInquiryOpen, toggleInquiryDrawer, removeItem } = useInquiry();
    const [formData, setFormData] = React.useState({ name: '', business: '', message: '' });

    if (!isInquiryOpen) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsAppInquiry = () => {
        if (inquiryItems.length === 0) return;

        // Construct message
        let message = `*New Product Inquiry*\n\n`;
        message += `*Name:* ${formData.name || 'N/A'}\n`;
        message += `*Business:* ${formData.business || 'N/A'}\n`;
        if (formData.message) message += `*Message:* ${formData.message}\n`;
        message += `\n*Selected Products:* \n`;

        inquiryItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name} (${item.category})\n`;
        });
        message += `\nPlease let me know the availability and pricing.`;

        const encodedMessage = encodeURIComponent(message);
        // Replace with actual business number
        const phoneNumber = '9979504265';
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={toggleInquiryDrawer}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 999
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100%', maxWidth: '400px',
                background: 'white', zIndex: 1000,
                boxShadow: '-5px 0 20px rgba(0,0,0,0.1)',
                padding: '24px',
                display: 'flex', flexDirection: 'column',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif' }}>Inquiry List ({inquiryItems.length})</h2>
                    <button onClick={toggleInquiryDrawer} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    {inquiryItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                            <p>No items selected.</p>
                            <p style={{ fontSize: '0.9rem' }}>Browse the catalog and select items to request a quote.</p>
                        </div>
                    ) : (
                        inquiryItems.map(item => (
                            <div key={item._id} style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                                <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', fontFamily: '"Playfair Display", serif' }}>{item.name}</h4>
                                    <p style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.category}</p>
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        style={{
                                            color: '#ef4444',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            marginTop: '4px',
                                            padding: 0
                                        }}
                                    >Remove</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Inquiry Form Fields */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>Contact Details</h4>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name *"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                    />
                    <input
                        type="text"
                        name="business"
                        placeholder="Business Name (Optional)"
                        value={formData.business}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                    />
                    <textarea
                        name="message"
                        placeholder="Additional Message..."
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="3"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', fontFamily: 'inherit' }}
                    />
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: 'auto' }}>
                    <button
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '1rem',
                            background: '#25D366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: (inquiryItems.length === 0 || !formData.name) ? 'not-allowed' : 'pointer',
                            opacity: (inquiryItems.length === 0 || !formData.name) ? 0.7 : 1
                        }}
                        onClick={handleWhatsAppInquiry}
                        disabled={inquiryItems.length === 0 || !formData.name}
                    >
                        <span>Request Quote on WhatsApp</span>
                    </button>
                    {!formData.name && inquiryItems.length > 0 && (
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', marginTop: '10px' }}>
                            Please enter your name to proceed.
                        </p>
                    )}
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>
                        We will respond with pricing and availability instantly.
                    </p>
                </div>
            </div>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </>
    );
};

// Export as CartDrawer for backward compatibility during refactor
export default InquiryDrawer;
