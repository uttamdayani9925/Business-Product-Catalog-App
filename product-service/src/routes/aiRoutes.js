const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
// Uses Gemini Imagen when GEMINI_API_KEY is set; otherwise Pollinations.ai (free).
router.post('/generate-lace', async (req, res) => {
    try {
        const { color, pattern, imageBase64 } = req.body;

        // Define TYPE_OF_LACE
        let typeOfLace = "Cotton";
        if (pattern && pattern.toLowerCase().includes('zari')) {
            typeOfLace = "Zari";
        } else if (pattern && pattern.toLowerCase().includes('crochet')) {
            typeOfLace = "Crochet";
        }

        // Define SELECTED_COLOR
        const colorName = color || 'red';

        // Master Prompt
        const prompt = `Professional product photography of the intricate ${typeOfLace} lace shown in the source image. Apply a high-fidelity ${colorName} dye to all fabric fibers and Zari threads. Strictly preserve the original structural pattern, transparency of the crochet gaps, and the specific embroidery texture. The background must remain a clean, solid white with zero modifications. No change to lighting, shadows, or lace orientation. Only the color of the textile is updated.`;

        const nvidiaKey = process.env.NVIDIA_API_KEY;
        const apiKey = process.env.GEMINI_API_KEY;

        let finalBase64 = null;

        // Try NVIDIA Image-to-Image (Specifically using Kontext model for editing)
        if (nvidiaKey && imageBase64) {
            try {
                // NVIDIA Kontext expects the full Data URL (under 200KB) and 'prompt' field
                const response = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${nvidiaKey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: imageBase64,
                        prompt: prompt,
                        negative_prompt: "blur, distorted pattern, changed background, shadows on white, extra threads, low resolution",
                        guidance_scale: 7.5,
                        denoising_strength: 0.45,
                        aspect_ratio: "match_input_image",
                        seed: Math.floor(Math.random() * 100000)
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.artifacts && data.artifacts[0].base64) {
                        finalBase64 = data.artifacts[0].base64;
                    }
                } else {
                    const errText = await response.text();
                    console.error('NVIDIA Kontext API failed, trying fallback:', errText);
                }
            } catch (err) {
                console.error('NVIDIA Flux API failed:', err.message);
            }
        }

        // Gemini Fallback with Image
        if (!finalBase64 && apiKey && imageBase64) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const base64Data = imageBase64.includes(';base64,') ?
                    imageBase64.split(';base64,')[1] : imageBase64;

                // Imagen 3 Image-to-Image / Inpainting
                const response = await ai.models.generateImages({
                    model: 'imagen-3.0-generate-001',
                    prompt: {
                        text: prompt,
                        image: {
                            data: base64Data,
                            mimeType: "image/png"
                        }
                    }
                });

                if (response.generatedImages && response.generatedImages.length > 0) {
                    finalBase64 = response.generatedImages[0].image.imageBytes;
                }
            } catch (geminiError) {
                console.error('Gemini image-to-image failed:', geminiError.message);
            }
        }

        // Pollinations Fallback (URL only)
        if (!finalBase64) {
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`;
            return res.json({ success: true, imageUrl: imageUrl });
        }

        return res.json({
            success: true,
            imageUrl: `data:image/jpeg;base64,${finalBase64}`
        });

    } catch (error) {
        console.error('Lace generation error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate lace image.' });
    }
});

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const nvidiaKey = process.env.NVIDIA_API_KEY;
        const apiKey = process.env.GEMINI_API_KEY;
        const usePollinations = !apiKey && !nvidiaKey;

        if (!usePollinations) {
            console.log(`Generating image for prompt: ${prompt}`);
        }

        try {
            if (usePollinations) {
                const seed = Math.floor(Math.random() * 1000000);
                const encodedPrompt = encodeURIComponent(prompt);
                const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&nologo=true&seed=${seed}`;
                return res.json({ success: true, imageUrl: apiUrl });
            }

            if (nvidiaKey) {
                try {
                    const response = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${nvidiaKey}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text_prompts: [{ text: prompt }],
                            seed: Math.floor(Math.random() * 100000)
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.artifacts && data.artifacts.length > 0 && data.artifacts[0].base64) {
                            const dataUri = `data:image/jpeg;base64,${data.artifacts[0].base64}`;
                            return res.json({ success: true, imageUrl: dataUri });
                        }
                    } else {
                        throw new Error(`NVIDIA API HTTP error: ${response.status}`);
                    }
                } catch (err) {
                    console.error('NVIDIA Flux API failed:', err.message);
                }
            }

            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateImages({
                    model: 'imagen-3.0-generate-001',
                    prompt: prompt,
                    config: {
                        numberOfImages: 1,
                        aspectRatio: "3:4",
                        outputMimeType: 'image/jpeg'
                    }
                });

                if (response.generatedImages && response.generatedImages.length > 0) {
                    const base64Image = response.generatedImages[0].image.imageBytes;
                    const dataUri = `data:image/jpeg;base64,${base64Image}`;
                    return res.json({ success: true, imageUrl: dataUri });
                }
                throw new Error('No images returned from Gemini');
            }
        } catch (geminiError) {
            if (!usePollinations) {
                console.error('Gemini failed, falling back to Pollinations:', geminiError.message);
            }
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&nologo=true&seed=${seed}`;
            return res.json({ success: true, imageUrl: apiUrl });
        }
    } catch (error) {
        console.error('Error generating image:', error.message || error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate image',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
