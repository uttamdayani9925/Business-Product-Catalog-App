import React, { useState, useEffect } from 'react';
import { ZoomIn, Grid, Layers, MousePointer2, Wand2 } from 'lucide-react';

const ContrastLab = () => {
    const [laces, setLaces] = useState([]);
    const [selectedLace, setSelectedLace] = useState(null);
    const [viewMode, setViewMode] = useState('single'); // 'single' or 'quad'

    // AI Recolor State
    const [activeLaceColor, setActiveLaceColor] = useState(null); // null means original
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch Premium Laces
    useEffect(() => {
        const fetchLaces = async () => {
            try {
                const baseUrl = process.env.REACT_APP_PRODUCT_SERVICE_URL || '/api';
                const response = await fetch(`${baseUrl}/products?limit=200`);
                const data = await response.json();
                if (data.success && data.data) {
                    // Filter ONLY for the exclusive Lace Lab category
                    const labLaces = data.data.filter(p => p.category === 'Lace Lab Exclusive');
                    setLaces(labLaces);
                    if (labLaces.length > 0) setSelectedLace(labLaces[0]);
                }
            } catch (err) {
                console.error("Failed to load laces", err);
            }
        };
        fetchLaces();
    }, []);

    // AI Recolor Colors (Curated Palette)
    const colorPalette = [
        { id: 1, color: '#000000', name: 'Midnight Black' },
        { id: 2, color: '#ffffff', name: 'Pure White' },
        { id: 3, color: '#dc2626', name: 'Royal Red' },
        { id: 4, color: '#1d4ed8', name: 'Sapphire Blue' },
        { id: 5, color: '#047857', name: 'Emerald Green' },
        { id: 6, color: '#d97706', name: 'Antique Gold' },
        { id: 7, color: '#db2777', name: 'Hot Pink' },
        { id: 8, color: '#7c3aed', name: 'Majestic Purple' },
    ];

    const applyAIColor = (color) => {
        setIsProcessing(true);
        setTimeout(() => {
            setActiveLaceColor(color);
            setIsProcessing(false);
        }, 800); // Simulate AI processing time
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fafaf9', padding: '24px', fontFamily: '"Lato", sans-serif' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', color: '#b45309', marginBottom: '8px' }}>Texture Contrast Lab</h1>
                    <p style={{ color: '#78716c' }}>AI-Powered Lace Visualization Studio</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>

                    {/* LEFT PANEL: Asset Library */}
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #e7e5e4', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontWeight: 'bold', color: '#44403c', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={20} color="#d97706" /> Lace Collection
                        </h3>
                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                            {laces.map(lace => (
                                <div
                                    key={lace._id}
                                    onClick={() => { setSelectedLace(lace); setActiveLaceColor(null); }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedLace?._id === lace._id ? '2px solid #f59e0b' : '2px solid transparent',
                                        background: selectedLace?._id === lace._id ? '#fffbeb' : 'transparent',
                                        marginBottom: '8px'
                                    }}
                                    onMouseOver={(e) => { if (selectedLace?._id !== lace._id) e.currentTarget.style.background = '#fafaf9'; }}
                                    onMouseOut={(e) => { if (selectedLace?._id !== lace._id) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ aspectRatio: '4/3', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#e5e5e5' }}>
                                        <img
                                            src={lace.imageUrl}
                                            alt={lace.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#57534e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {lace.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: The Lab */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Toolbar */}
                        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #e7e5e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => setViewMode('single')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: '500',
                                        background: viewMode === 'single' ? '#d97706' : 'transparent',
                                        color: viewMode === 'single' ? 'white' : '#57534e',
                                        border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                >
                                    <ZoomIn size={16} /> Focus View
                                </button>
                                <button
                                    onClick={() => setViewMode('quad')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: '500',
                                        background: viewMode === 'quad' ? '#d97706' : 'transparent',
                                        color: viewMode === 'quad' ? 'white' : '#57534e',
                                        border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                >
                                    <Grid size={16} /> Quad Compare
                                </button>
                            </div>

                            {/* Artificial Intelligence Color Picker */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '10px' }}>
                                    <Wand2 size={16} color="#7c3aed" />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', background: 'linear-gradient(to right, #7c3aed, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Recolor</span>
                                </div>

                                {/* Reset Button */}
                                <button
                                    onClick={() => setActiveLaceColor(null)}
                                    title="Original Color"
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'conic-gradient(red, orange, yellow, green, blue, indigo, violet)',
                                        border: activeLaceColor === null ? '2px solid #2563eb' : '2px solid transparent',
                                        cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />

                                {colorPalette.map(paint => (
                                    <button
                                        key={paint.id}
                                        onClick={() => applyAIColor(paint.color)}
                                        title={paint.name}
                                        style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: paint.color,
                                            border: activeLaceColor === paint.color ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                            cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transform: activeLaceColor === paint.color ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'transform 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Visualization Area */}
                        {selectedLace ? (
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e7e5e4', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#f5f5f4' }}>

                                {isProcessing && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(255,255,255,0.7)',
                                        backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Wand2 size={48} className="spin-slow" color="#7c3aed" />
                                        <p style={{ marginTop: '16px', fontWeight: 'bold', color: '#7c3aed' }}>AI Processing...</p>
                                    </div>
                                )}

                                {viewMode === 'single' ? (
                                    (() => {
                                        return (
                                            <div style={{
                                                position: 'relative', width: '100%', height: '550px',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                                borderRadius: '8px', overflow: 'hidden', border: '4px solid white',
                                                background: '#333' // Dark background for contrast
                                            }}>
                                                {/* Base Image Layer */}
                                                <div
                                                    style={{
                                                        position: 'absolute', inset: 0,
                                                        backgroundImage: `url(${selectedLace.imageUrl})`,
                                                        backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                                                        // If coloring, make grayscale first for better tinting
                                                        filter: activeLaceColor ? 'grayscale(100%) brightness(1.1)' : 'none',
                                                        transition: 'all 0.5s ease-in-out'
                                                    }}
                                                />

                                                {/* Color Tint Overlay Layer */}
                                                {activeLaceColor && (
                                                    <div
                                                        style={{
                                                            position: 'absolute', inset: 0,
                                                            backgroundColor: activeLaceColor,
                                                            mixBlendMode: 'multiply', // Blends color onto the white parts of the lace
                                                            opacity: 0.85,
                                                            transition: 'background-color 0.5s ease'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    /* Quad Grid View (Auto-generates variants) */
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', height: '550px' }}>
                                        {/* Original */}
                                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#333' }}>
                                            <img src={selectedLace.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Original" />
                                            <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Original</span>
                                        </div>

                                        {/* AI Variants */}
                                        {[colorPalette[2], colorPalette[5], colorPalette[3]].map((variant, i) => (
                                            <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#333' }}>
                                                {/* Base Grayscale */}
                                                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${selectedLace.imageUrl})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'grayscale(100%) brightness(1.2)' }} />
                                                {/* Color Blend Layer (No Mask needed for JPG Textures) */}
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    backgroundColor: variant.color,
                                                    mixBlendMode: 'multiply',
                                                    opacity: 0.85,
                                                    transition: 'background-color 0.5s ease'
                                                }} />
                                                <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                    AI {variant.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}>
                                <MousePointer2 size={48} style={{ marginBottom: '16px', animation: 'bounce 1s infinite' }} />
                                <p style={{ fontSize: '1.25rem' }}>Select a lace to visualize</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(-10%); } 50% { transform: translateY(0); } }
                .spin-slow { animation: spin 3s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Removed old fabricOptions in favor of dynamic AI recoloring
export default ContrastLab;
