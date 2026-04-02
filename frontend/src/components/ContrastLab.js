import React, { useState, useEffect, useRef } from 'react';
import { Layers, Palette, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const hexToColorName = {
    '#FF0000': 'red', '#0047AB': 'royal blue', '#00FF00': 'green',
    '#FF69B4': 'hot pink', '#000000': 'black', '#FF4500': 'orange',
    '#FFD700': 'gold'
};

const ContrastLab = () => {
    const [laces, setLaces] = useState([]);
    const [selectedLace, setSelectedLace] = useState(null);
    const [dyeColor, setDyeColor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [aiImage, setAiImage] = useState(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Fetch Base Textures
    useEffect(() => {
        const fetchLaces = async () => {
            try {
                const response = await fetch('/api/products/?limit=200');
                const data = await response.json();
                if (data.success && data.data) {
                    const labLaces = data.data.filter(p => p.category === 'Lace Lab Exclusive');

                    // Fixed order mapping based on image ID (e.g., '160.jpg')
                    const requiredOrder = [
                        '160', '80', '20', '18', '15', '32', '35', '43', '41', '48',
                        '53', '58', '62', '63', '70', '74', '151', '82', '76', '78',
                        '117', '150'
                    ];

                    const sortedLaces = [];
                    const remainingLaces = [];

                    // Sort exact matches first
                    requiredOrder.forEach(idStr => {
                        // Assuming the image URL or name ends with or contains the ID (e.g., '160.jpg')
                        const match = labLaces.find(lace => lace.imageUrl.includes(`/${idStr}.`));
                        if (match) {
                            sortedLaces.push(match);
                        }
                    });

                    // Add all others that weren't in the exact list
                    labLaces.forEach(lace => {
                        if (!sortedLaces.some(sorted => sorted._id === lace._id)) {
                            remainingLaces.push(lace);
                        }
                    });

                    // Combine them
                    const finalOrder = [...sortedLaces, ...remainingLaces];

                    setLaces(finalOrder);
                    if (finalOrder.length > 0) setSelectedLace(finalOrder[0]);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLaces();
    }, []);

    // PRO QUALITY COLOR REPLACEMENT ENGINE
    // This ignores the white/gray background and only shades the lace fibers
    useEffect(() => {
        if (!selectedLace || !dyeColor) {
            setResultImage(null);
            return;
        }

        const applyDye = async () => {
            setIsProcessing(true);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = selectedLace.imageUrl;

            img.onload = () => {
                // Ensure reasonable processing size for speed while maintaining extreme quality
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.floor(height * (MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                // Parse Target Color
                const rDye = parseInt(dyeColor.slice(1, 3), 16);
                const gDye = parseInt(dyeColor.slice(3, 5), 16);
                const bDye = parseInt(dyeColor.slice(5, 7), 16);


                const hex = dyeColor ? dyeColor.replace('#', '') : 'ffffff';
                const tR = parseInt(hex.substring(0, 2), 16);
                const tG = parseInt(hex.substring(2, 4), 16);
                const tB = parseInt(hex.substring(4, 6), 16);

                // --- DEAD-SIMPLE CHROMA & LUMA SEGMENTATION ---
                // This reliably isolates colored/dark lace from light/neutral backgrounds.

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const diff = max - min; // Chroma/Color Intensity
                    const brightness = (r + g + b) / 3;

                    // A pixel is background if it has very low color intensity (gray/white) 
                    // AND it is relatively bright.
                    let laceAmount = 1;

                    if (diff < 15 && brightness > 190) {
                        laceAmount = 0; // 100% Background - Do not touch
                    } else if (diff < 35 && brightness > 170) {
                        // Edge blending (Anti-aliasing)
                        laceAmount = (diff - 15) / 20;
                    }

                    if (laceAmount > 0) {
                        // It's lace! Apply Photoshop-style "Multiply" blend
                        const luminance = (r * 0.299 + g * 0.587 + b * 0.114);

                        // Multiply formula: (TargetColor * Luminance) / 255
                        const dyedR = (tR * luminance) / 255;
                        const dyedG = (tG * luminance) / 255;
                        const dyedB = (tB * luminance) / 255;

                        // Blend smoothly at the edges
                        data[i] = (dyedR * laceAmount) + (r * (1 - laceAmount));
                        data[i + 1] = (dyedG * laceAmount) + (g * (1 - laceAmount));
                        data[i + 2] = (dyedB * laceAmount) + (b * (1 - laceAmount));
                    }
                    // Background pixels are left completely unmodified!
                }

                ctx.putImageData(imageData, 0, 0);
                setResultImage(canvas.toDataURL('image/jpeg', 0.95)); // Faster, smaller base64
                setIsProcessing(false);
            };
        };

        applyDye();
    }, [selectedLace, dyeColor]);

    // Clear AI image when changing lace or color
    useEffect(() => { setAiImage(null); }, [selectedLace, dyeColor]);

    const generateWithAI = async () => {
        if (!dyeColor) return;
        setIsAiGenerating(true);
        setAiImage(null);
        try {
            const colorName = hexToColorName[dyeColor?.toUpperCase()] || dyeColor;

            // Convert current lace to Base64 to 'upload' it to the backend
            let imageBase64 = null;
            if (selectedLace?.imageUrl) {
                try {
                    // Fetch image and compress to ensure it's under 200KB for NVIDIA API
                    const scaledImg = new Image();
                    scaledImg.crossOrigin = "anonymous";
                    scaledImg.src = selectedLace.imageUrl;

                    imageBase64 = await new Promise((resolve) => {
                        scaledImg.onload = () => {
                            const canvas = document.createElement('canvas');
                            const size = 512; // Standard AI reference size
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(scaledImg, 0, 0, size, size);
                            resolve(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        scaledImg.onerror = () => resolve(null);
                    });
                } catch (err) {
                    console.error("Image scaling failed:", err);
                }
            }

            const res = await fetch('/api/ai/generate-lace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    color: colorName,
                    pattern: selectedLace?.name || 'lace',
                    imageBase64: imageBase64
                })
            });
            const data = await res.json();
            if (data.success && data.imageUrl) setAiImage(data.imageUrl);
            else alert('AI generation failed. Please try again.');
        } catch (e) {
            console.error(e);
            alert('AI generation failed. Please check your connection.');
        } finally {
            setIsAiGenerating(false);
        }
    };

    const colors = [
        { name: 'Pure Red', hex: '#FF0000' }, // Target: The Image 2 Red
        { name: 'Royal Blue', hex: '#0047AB' },
        { name: 'Vibrant Green', hex: '#00FF00' },
        { name: 'Hot Pink', hex: '#FF69B4' },
        { name: 'Deep Black', hex: '#000000' },
        { name: 'Sunset Orange', hex: '#FF4500' },
        { name: 'Gold', hex: '#FFD700' },
    ];


    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f7', color: '#1d1d1f', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Lace Lab Pro Collector</h1>
                    <p style={{ color: '#86868b', fontSize: '1.1rem' }}>Instant Fabric Shading • Background Protection Engine</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '30px' }}>

                    {/* Controls */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={{ background: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={18} /> Select Pattern
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
                                {laces.map(lace => (
                                    <div
                                        key={lace._id}
                                        onClick={() => setSelectedLace(lace)}
                                        style={{
                                            cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', height: '80px', position: 'relative',
                                            border: selectedLace?._id === lace._id ? '3px solid #0071e3' : '2px solid transparent',
                                            transition: 'transform 0.2s', transform: selectedLace?._id === lace._id ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        <img src={lace.imageUrl} alt={lace.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Palette size={18} /> Choose Dye
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                                {colors.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setDyeColor(c.hex)}
                                        style={{
                                            width: '42px', height: '42px', borderRadius: '50%', background: c.hex,
                                            border: dyeColor === c.hex ? '3px solid #1d1d1f' : '2px solid #e5e5ea',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            transform: dyeColor === c.hex ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                        title={c.name}
                                    />
                                ))}

                                {/* Custom Color Picker */}
                                <label
                                    style={{
                                        width: '42px', height: '42px', borderRadius: '50%',
                                        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                                        border: '2px solid #1d1d1f', cursor: 'pointer', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center', position: 'relative',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}
                                    title="Pick Any Custom Color"
                                >
                                    <input
                                        type="color"
                                        onChange={(e) => setDyeColor(e.target.value)}
                                        style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                                </label>

                                <button
                                    onClick={() => setDyeColor(null)}
                                    style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'white', border: '1px solid #d1d1d6', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                                >RESET</button>
                            </div>
                        </div>

                        <button
                            onClick={generateWithAI}
                            disabled={!dyeColor || isAiGenerating}
                            style={{
                                padding: '14px 20px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white', fontWeight: '600', cursor: dyeColor && !isAiGenerating ? 'pointer' : 'not-allowed',
                                opacity: dyeColor && !isAiGenerating ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {isAiGenerating ? 'Generating…' : '✨ Generate with AI (Free)'}
                        </button>

                        <div style={{ padding: '15px', background: '#f2f2f7', borderRadius: '12px', fontSize: '0.85rem', color: '#515154', lineHeight: '1.4' }}>
                            <div style={{ fontWeight: 'bold', color: '#0071e3', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={14} /> Background Protected
                            </div>
                            Canvas mode dyes your selected lace. Use "Generate with AI" for AI-created lace in your color (no API key).
                        </div>

                    </aside>

                    {/* Viewport */}
                    <main>
                        <div style={{
                            background: '#fff', borderRadius: '32px', padding: '30px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)',
                            minHeight: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {(isProcessing || isAiGenerating) && (
                                <div style={{ position: 'absolute', zIndex: 10, background: 'rgba(255,255,255,0.7)', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '32px', backdropFilter: 'blur(5px)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <RefreshCw size={40} className="spin" style={{ color: '#0071e3', marginBottom: '15px' }} />
                                        <p style={{ fontWeight: '600' }}>{isAiGenerating ? 'AI Generating Lace…' : 'Applying Professional Dye...'}</p>
                                    </div>
                                </div>
                            )}

                            {selectedLace ? (
                                <div style={{ width: '100%', height: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                    <img
                                        src={aiImage || resultImage || selectedLace.imageUrl}
                                        alt="Output"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'opacity 0.2s ease-in' }}
                                    />

                                    <div style={{
                                        position: 'absolute', bottom: '30px',
                                        background: 'rgba(0,0,0,0.85)', color: 'white', padding: '10px 25px',
                                        borderRadius: '40px', fontSize: '0.9rem', fontWeight: '500', backdropFilter: 'blur(10px)'
                                    }}>
                                        {aiImage ? '✨ AI Generated' : dyeColor ? '✨ Fiber-Specific Mapping Active' : '📸 Original High-Res Scan'}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#86868b' }}>
                                    <Sparkles size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                                    <p>Select a lace pattern to start dyeing.</p>
                                </div>
                            )}

                            {(resultImage || aiImage) && (
                                <button
                                    onClick={() => { const link = document.createElement('a'); link.href = aiImage || resultImage; link.download = aiImage ? 'ai-lace.jpg' : 'dyed-lace.png'; link.click(); }}
                                    style={{ position: 'absolute', top: '30px', right: '30px', padding: '12px 20px', borderRadius: '30px', background: '#0071e3', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', boxShadow: '0 4px 15px rgba(0,113,227,0.3)' }}
                                >
                                    <Download size={18} /> Download High-Res
                                </button>
                            )}
                        </div>
                    </main>

                </div>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ContrastLab;
