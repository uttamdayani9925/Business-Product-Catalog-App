import React, { useState, useEffect } from 'react';

const VoiceSearch = ({ onSearch, onNavigate }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    const handleListen = () => {
        if (!supported) {
            alert("Voice search is only supported in Chrome/Edge on Desktop/Android.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('Listening...');
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            setTranscript(`"${command}"`);
            processCommand(command);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
            setTranscript('Try again');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const processCommand = (cmd) => {
        // Navigation Commands
        if (cmd.includes('studio') || cmd.includes('virtual')) {
            onNavigate('studio');
            return;
        }
        if (cmd.includes('contact') || cmd.includes('partner')) {
            onNavigate('contact');
            return;
        }
        if (cmd.includes('home') || cmd.includes('catalog')) {
            onNavigate('home');
            return;
        }

        // Filter/Search Commands
        if (cmd.includes('cotton')) onSearch('cotton');
        else if (cmd.includes('gold') || cmd.includes('zari')) onSearch('zari');
        else if (cmd.includes('crochet')) onSearch('crochet');
        else if (cmd.includes('reset') || cmd.includes('clear')) onSearch('');
        else alert(`Command recognized: "${cmd}". Try "Show Cotton" or "Go to Studio"`);
    };

    if (!supported) return null;

    return (
        <button
            onClick={handleListen}
            className={`btn ${isListening ? 'listening' : ''}`}
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isListening ? '#ef4444' : 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                padding: 0
            }}
            title="Voice Command"
        >
            {isListening ? '🎙️' : '🎤'}
            {transcript && isListening && (
                <div style={{
                    position: 'absolute',
                    right: '80px',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    color: 'var(--secondary)'
                }}>
                    {transcript}
                </div>
            )}
        </button>
    );
};

export default VoiceSearch;
