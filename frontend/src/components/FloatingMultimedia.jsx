import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake, faLeaf, faChampagneGlasses, faSeedling, faPlay } from '@fortawesome/free-solid-svg-icons';
import '../styles/particles.css';

export default function FloatingMultimedia({ invitation, isOpen, defaultColor = '#7E3942', defaultColorText = '#FFFFFF' }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const features = invitation?.invitationFeatures || {};
    const settings = invitation?.themeSettings || {};

    const musicEnabled = features.musicEnabled && settings.musicUrl;
    const animationEnabled = features.animationEnabled && settings.animationType;

    // Auto-play when the envelope is opened
    useEffect(() => {
        if (isOpen && musicEnabled && audioRef.current) {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.warn('Autoplay prevented by browser:', err);
                setIsPlaying(false);
            });
        }
    }, [isOpen, musicEnabled]);

    // Handle tab visibility changes to pause/resume music
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (isPlaying && audioRef.current) {
                    audioRef.current.pause();
                }
            } else {
                if (isPlaying && audioRef.current) {
                    audioRef.current.play().catch(console.warn);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isPlaying]);

    function toggleMusic() {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    // Determine Animation Element
    function renderAnimation() {
        if (!animationEnabled) return null;
        
        let icon = faSeedling;
        if (settings.animationType === 'snow') icon = faSnowflake;
        if (settings.animationType === 'leaves') icon = faLeaf;
        if (settings.animationType === 'confetti') icon = faChampagneGlasses;

        const particles = Array.from({ length: 15 }); // 15 particles
        return (
            <div className="floating-multimedia-container">
                {particles.map((_, i) => (
                    <div 
                        key={i} 
                        className="falling-particle-wrapper"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 7 + 8}s`, // 8-15 seconds falling (sangat pelan dan santai)
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    >
                        <div 
                            className="falling-particle-inner"
                            style={{
                                animationDuration: `${Math.random() * 3 + 3}s`, // 3-6 seconds swaying
                            }}
                        >
                            <FontAwesomeIcon icon={icon} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {renderAnimation()}
            
            {musicEnabled && (
                <>
                    <audio ref={audioRef} src={settings.musicUrl} loop />
                    
                    {/* Floating Music Button */}
                    <button
                        onClick={toggleMusic}
                        className={`floating-music-btn ${isOpen ? 'is-visible' : 'is-hidden'} ${isPlaying ? 'is-playing' : ''}`}
                        style={{
                            background: settings?.colorAccent || settings?.colorPrimary || defaultColor,
                            color: settings?.colorTextLight || defaultColorText
                        }}
                    >
                        {isPlaying ? (
                            <div className="audio-waveform">
                                <div className="audio-bar"></div>
                                <div className="audio-bar"></div>
                                <div className="audio-bar"></div>
                                <div className="audio-bar"></div>
                            </div>
                        ) : (
                            <FontAwesomeIcon icon={faPlay} style={{ marginLeft: '2px' }} />
                        )}
                    </button>
                </>
            )}
        </>
    );
}
