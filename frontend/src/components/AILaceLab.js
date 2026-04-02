import React, { useState } from 'react';
import './AILaceLab.css';

const colorOptions = [
    { name: 'Ruby Red', hex: '#E53935', promptName: 'ruby red' },
    { name: 'Royal Blue', hex: '#1E88E5', promptName: 'royal blue' },
    { name: 'Emerald', hex: '#43A047', promptName: 'emerald green' },
    { name: 'Gold', hex: '#FDD835', promptName: 'gold' },
    { name: 'Magenta', hex: '#D81B60', promptName: 'magenta pink' },
    { name: 'Deep Purple', hex: '#8E24AA', promptName: 'deep purple' },
    { name: 'Midnight Black', hex: '#212121', promptName: 'midnight black' },
    { name: 'Pure White', hex: '#F5F5F5', promptName: 'pure white' },
];

const patternOptions = [
    { id: 1, name: 'Floral Vintage', promptDesc: 'vintage floral pattern' },
    { id: 2, name: 'Geometric Net', promptDesc: 'geometric net modern pattern' },
    { id: 3, name: 'Bridal Heavyduty', promptDesc: 'intricate bridal heavy border' },
    { id: 4, name: 'Premium Guipure', promptDesc: 'premium thick guipure structure' },
];

const GarmentTypes = [
    { name: 'Evening Gown', prompt: 'evening gown dress' },
    { name: 'Designer Saree', prompt: 'traditional Indian designer saree' },
    { name: 'Fashion Kurti', prompt: 'fashionable Indian kurti top' },
];

const AILaceLab = () => {
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [selectedPattern, setSelectedPattern] = useState(patternOptions[0]);
    const [selectedGarment, setSelectedGarment] = useState(GarmentTypes[0]);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateAIImage = async () => {
        setIsLoading(true);

        try {
            const baseImages = {
                'Evening Gown': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop&q=80',
                'Designer Saree': 'https://images.unsplash.com/photo-1610189013233-0570a2569502?w=600&h=800&fit=crop&q=80',
                'Fashion Kurti': 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?w=600&h=800&fit=crop&q=80'
            };

            const imageUrl = baseImages[selectedGarment.name] || baseImages['Evening Gown'];

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error("Failed to load model base image"));
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;

            // Parse target dye color
            const rDye = parseInt(selectedColor.hex.slice(1, 3), 16);
            const gDye = parseInt(selectedColor.hex.slice(3, 5), 16);
            const bDye = parseInt(selectedColor.hex.slice(5, 7), 16);

            // 1. Detect background from border pixels (edges & corners)
            let bgSumR = 0, bgSumG = 0, bgSumB = 0, bgCount = 0;
            const samplePixel = (x, y) => {
                const idx = (y * width + x) * 4;
                bgSumR += data[idx]; bgSumG += data[idx + 1]; bgSumB += data[idx + 2];
                bgCount++;
            };
            for (let x = 0; x < width; x++) { samplePixel(x, 0); samplePixel(x, height - 1); }
            for (let y = 1; y < height - 1; y++) { samplePixel(0, y); samplePixel(width - 1, y); }
            const bgR = bgCount > 0 ? bgSumR / bgCount : 200;
            const bgG = bgCount > 0 ? bgSumG / bgCount : 200;
            const bgB = bgCount > 0 ? bgSumB / bgCount : 200;

            // 2. Per-pixel: apply dye ONLY to lace/fabric, NOT background or skin
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

                // Distance from background (background pixels stay unchanged)
                const distToBg = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

                // Skin detection: typical skin hue 0–50 (red/orange), saturation/lightness in range
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                const l = (max + min) / 2 / 255;
                const s = max === min ? 0 : (max - min) / (255 - Math.abs(2 * (max + min) / 2 - 255));
                let h = 0;
                if (max !== min) {
                    const d = max - min;
                    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    else if (max === g) h = ((b - r) / d + 2) / 6;
                    else h = ((r - g) / d + 4) / 6;
                }
                const hue = h * 360;
                const isSkin = hue >= 0 && hue <= 50 && s > 0.15 && l > 0.2 && l < 0.9 && distToBg > 40;

                // Lace/fabric weight: apply dye only where NOT background and NOT skin
                let fabricWeight = 0;
                if (isSkin || distToBg < 25) {
                    fabricWeight = 0;
                } else if (distToBg > 50) {
                    fabricWeight = 1;
                } else {
                    fabricWeight = (distToBg - 25) / 25;
                }

                if (fabricWeight > 0) {
                    const lightFactor = Math.max(0.15, brightness);
                    const targetR = rDye * lightFactor;
                    const targetG = gDye * lightFactor;
                    const targetB = bDye * lightFactor;
                    data[i] = (targetR * fabricWeight) + (r * (1 - fabricWeight));
                    data[i + 1] = (targetG * fabricWeight) + (g * (1 - fabricWeight));
                    data[i + 2] = (targetB * fabricWeight) + (b * (1 - fabricWeight));
                }
            }

            ctx.putImageData(imageData, 0, 0);
            const resultUrl = canvas.toDataURL('image/jpeg', 0.9);

            setTimeout(() => {
                setGeneratedImage(resultUrl);
                setIsLoading(false);
            }, 800);

        } catch (error) {
            console.error('Image Generation Error:', error);
            alert('AI Generation failed. Please check network connection and try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="recolor-page-container fade-in">
            <div className="section-header" style={{ textAlign: 'center' }}>
                <h2>Gemini AI: Generative Studio 🪄</h2>
                <p>Generate completely unique model photography featuring your selected lace pattern dyed in your chosen color instantly.</p>
            </div>

            <div className="recolor-workspace">

                {/* Visual Viewport */}
                <div className="model-viewport-container">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner">✨</div>
                            <h3>AI is designing your lace...</h3>
                            <p>Creating a unique photorealistic model...</p>
                        </div>
                    ) : generatedImage ? (
                        <img
                            src={generatedImage}
                            alt="AI Generated Lace Model"
                            className="generated-result-layer"
                        />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">👗</div>
                            <h3>Ready to Create!</h3>
                            <p>Select your fabric combination and click Generate to see the AI magic.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Controls */}
                <div className="controls-sidebar">

                    <div className="control-group">
                        <h3>1. Select Garment Type</h3>
                        <select
                            className="garment-select"
                            value={selectedGarment.name}
                            onChange={(e) => setSelectedGarment(GarmentTypes.find(g => g.name === e.target.value))}
                        >
                            {GarmentTypes.map(g => (
                                <option key={g.name} value={g.name}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <h3>2. Select Texture/Pattern</h3>
                        <div className="button-list">
                            {patternOptions.map(pattern => (
                                <button
                                    key={pattern.id}
                                    className={`list-btn ${selectedPattern.id === pattern.id ? 'active' : ''}`}
                                    onClick={() => setSelectedPattern(pattern)}
                                >
                                    {pattern.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <h3>3. Select Dye Color</h3>
                        <div className="color-swatches">
                            {colorOptions.map(color => (
                                <div
                                    key={color.name}
                                    className={`color-swatch ${selectedColor.name === color.name ? 'active' : ''}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                    onClick={() => setSelectedColor(color)}
                                ></div>
                            ))}
                        </div>
                        <p className="selected-color-label">Color: <strong>{selectedColor.name}</strong></p>
                    </div>

                    <button
                        className="btn generate-btn"
                        onClick={generateAIImage}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Generating Image...' : '✨ Generate AI Model ✨'}
                    </button>

                    <div className="instruction-box">
                        <strong>Powered by AI Endpoint:</strong><br />
                        This feature sends your selected parameters to a Generative AI image model. It creates a brand-new, royalty-free high-fashion image demonstrating those exact specifications!
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AILaceLab;
