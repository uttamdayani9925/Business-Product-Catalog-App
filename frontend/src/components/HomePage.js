import React, { useEffect, useState } from 'react';

const HomePage = ({ onNavigate }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => setOffset(window.pageYOffset);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="homepage">
            {/* Hero Section */}
            <div className="hero-section" style={{
                height: '90vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="hero-bg" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: '#1a1a1a', // Simple dark background
                }}></div>

                <div className="hero-content" style={{ position: 'relative', zIndex: 2, padding: '20px' }}>
                    <h1 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '4.5rem',
                        marginBottom: '1rem',
                        animation: 'fadeInUp 1s ease-out'
                    }}>
                        Luxe Laces
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        letterSpacing: '2px',
                        marginBottom: '3rem',
                        animation: 'fadeInUp 1s ease-out 0.3s backwards'
                    }}>
                        PREMIUM MANUFACTURER & WHOLESALER
                    </p>
                    <button
                        onClick={() => onNavigate('catalog')}
                        style={{
                            background: 'transparent',
                            border: '2px solid #C5A059',
                            color: '#C5A059',
                            padding: '16px 40px',
                            fontSize: '1rem',
                            letterSpacing: '2px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            animation: 'fadeInUp 1s ease-out 0.6s backwards'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#C5A059';
                            e.target.style.color = 'black';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = '#C5A059';
                        }}
                    >
                        Explore Collections
                    </button>
                </div>
            </div>

            {/* About Section */}
            <section style={{ padding: '80px 20px', background: '#FAFAFA', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '20px', color: '#1a202c' }}>
                        The Art of Elegance
                    </h2>
                    <div style={{ width: '60px', height: '3px', background: '#C5A059', margin: '0 auto 30px' }}></div>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}>
                        At Luxe Laces, we craft more than just fabric; we weave tradition with contemporary design.
                        Specializing in high-quality Cotton and Polyester laces, our collections are designed for
                        designers who demand perfection. From intricate Zari work to durable everyday series,
                        experience the finest craftsmanship in every thread.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '80px 20px', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

                    <div className="feature-card" style={{ padding: '30px', border: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
                        <h3 style={{ marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>Premium Quality</h3>
                        <p style={{ color: '#718096' }}>Sourced from the finest materials to ensure durability and a luxurious feel.</p>
                    </div>

                    <div className="feature-card" style={{ padding: '30px', border: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎨</div>
                        <h3 style={{ marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>Exclusive Designs</h3>
                        <p style={{ color: '#718096' }}>Unique patterns updated seasonally to keep your creations ahead of the trend.</p>
                    </div>

                    <div className="feature-card" style={{ padding: '30px', border: '1px solid #eee', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
                        <h3 style={{ marginBottom: '15px', fontFamily: '"Playfair Display", serif' }}>B2B Partner</h3>
                        <p style={{ color: '#718096' }}>Dedicated wholesale support with competitive pricing for bulk orders.</p>
                    </div>

                </div>
            </section>

            {/* Future Expansions: Coming Soon */}
            <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '10px' }}>Our Future Expansions</h2>
                    <p style={{ color: '#666', marginBottom: '50px' }}>We are expanding into premium ethnic wear. Coming soon to our platform.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                        {/* Card 1 */}
                        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
                                alt="Bridal Lehengas"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                            />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px' }}>
                                <h3 style={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', marginBottom: '10px' }}>Bridal Lehengas</h3>
                                <span style={{ color: '#C5A059', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', borderRadius: '4px', alignSelf: 'flex-start' }}>Coming Soon</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                            <img
                                src="/images/designer_saree.jpg"
                                alt="Designer Sarees"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                            />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px' }}>
                                <h3 style={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', marginBottom: '10px' }}>Designer Sarees</h3>
                                <span style={{ color: '#C5A059', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', borderRadius: '4px', alignSelf: 'flex-start' }}>Coming Soon</span>
                            </div>
                        </div>

                        {/* Card 3 - Textile Fashion Kurti */}
                        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                            <img
                                src="/images/fashion_kurti.png"
                                alt="Fashion Kurtis"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', objectPosition: 'top' }}
                            />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px' }}>
                                <h3 style={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.8rem', marginBottom: '10px' }}>Fashion Kurtis & Tops</h3>
                                <span style={{ color: '#C5A059', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', background: 'rgba(0,0,0,0.8)', padding: '5px 15px', borderRadius: '4px', alignSelf: 'flex-start' }}>Coming Soon</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Founder's Corner & Blog */}
            <section style={{ padding: '80px 20px', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Founder */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center', marginBottom: '100px' }}>
                        <div style={{ flex: '1 1 400px', position: 'relative' }}>
                            <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', overflow: 'hidden', borderRadius: '50% 0 50% 0', boxShadow: '20px 20px 0 #f7fafc' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                                    alt="Uttam Dayani"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <div style={{ flex: '1 1 500px' }}>
                            <h4 style={{ color: '#C5A059', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>The Visionary</h4>
                            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', marginBottom: '30px', color: '#1a202c' }}>Uttam Dayani</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '20px' }}>
                                "Laces are not just an accessory; they are the soul of a garment. My journey began with a simple mission: to bridge the gap between traditional craftsmanship and modern design needs."
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}>
                                Today, Luxe Laces stands as a testament to quality, innovation, and trust. We don't just sell laces; we partner with you to create masterpieces.
                            </p>
                        </div>
                    </div>

                    {/* Blog Section */}
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '10px' }}>Textile Talk</h2>
                        <p style={{ color: '#666' }}>Insights from the world of fashion manufacturing.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {[
                            { title: "2026 Lace Trends", img: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=500&q=80", date: "Jan 15, 2026" },
                            { title: "Sustainable Cotton", img: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=500&q=80", date: "Jan 10, 2026" },
                            { title: "Digital Manufacturing", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80", date: "Jan 05, 2026" }
                        ].map((post, i) => (
                            <div key={i} style={{ group: 'blog' }}>
                                <div style={{ height: '250px', overflow: 'hidden', borderRadius: '8px', marginBottom: '20px' }}>
                                    <img
                                        src={post.img}
                                        alt={post.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                    />
                                </div>
                                <span style={{ color: '#C5A059', fontSize: '0.8rem', fontWeight: 'bold' }}>{post.date}</span>
                                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', margin: '10px 0', cursor: 'pointer' }}>{post.title}</h3>
                                <button
                                    onClick={() => alert('Full article coming soon!')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        color: '#1a202c',
                                        textDecoration: 'none',
                                        borderBottom: '1px solid black',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Read Article
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section style={{ padding: '100px 20px', background: '#1a202c', color: 'white', textAlign: 'center' }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', marginBottom: '30px', color: '#fff' }}>Ready to Collaborate?</h2>
                <button
                    onClick={() => onNavigate('contact')}
                    style={{
                        background: '#C5A059',
                        border: 'none',
                        color: 'black',
                        padding: '18px 48px',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        borderRadius: '4px'
                    }}
                >
                    CONTACT US
                </button>
            </section>

            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default HomePage;
