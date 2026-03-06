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

    const generateAIImage = () => {
        setIsLoading(true);
        // Using Pollinations.ai for free, fast AI image generation.
        const seed = Math.floor(Math.random() * 1000000);
        
        // Construct the prompt describing a model wearing the specific color and lace pattern
        const prompt = `A highly detailed professional fashion photography of a beautiful model wearing a stunning ${selectedColor.promptName} color ${selectedGarment.prompt} made entirely of ${selectedPattern.promptDesc} lace fabric, hyperrealistic, 8k resolution, high fashion editorial, studio lighting, highly detailed face`;
        const encodedPrompt = encodeURIComponent(prompt);
        
        // Pollinations.ai generates an image directly from the URL prompt
        const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=800&nologo=true&seed=${seed}`;
        
        // Simulating the image load so we can show a nice spinner
        const img = new Image();
        img.onload = () => {
            setGeneratedImage(apiUrl);
            setIsLoading(false);
        };
        img.onerror = () => {
            alert('AI Generation taking too long or failed. Please try again.');
            setIsLoading(false);
        };
        img.src = apiUrl;
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
                        <strong>Powered by AI Endpoint:</strong><br/>
                        This feature sends your selected parameters to a Generative AI image model. It creates a brand-new, royalty-free high-fashion image demonstrating those exact specifications!
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AILaceLab;
