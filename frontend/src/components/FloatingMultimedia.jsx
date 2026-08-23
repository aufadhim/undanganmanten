import { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake, faLeaf, faPlay } from '@fortawesome/free-solid-svg-icons';
import '../styles/particles.css';

export default function FloatingMultimedia({ invitation, isOpen, defaultColor = '#7E3942', defaultColorText = '#FFFFFF' }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const features = invitation?.invitationFeatures || {};
    const settings = invitation?.themeSettings || {};

    const musicEnabled = features.musicEnabled && settings.musicUrl;
    const visualType = ['snow', 'leaves', 'sakura'].includes(settings.animationType) ? settings.animationType : '';
    const animationEnabled = features.animationEnabled && visualType;
    const particles = useMemo(() => Array.from({ length: 24 }, (_, index) => {
        const noise = (seed) => {
            const value = Math.sin((index + 1) * seed) * 43758.5453;
            return value - Math.floor(value);
        };
        return {
            id: `${visualType || 'none'}-${index}`,
            left: noise(12.9898) * 100,
            duration: 18 + noise(78.233) * 16,
            delay: -(noise(39.425) * 34),
            size: 8 + noise(93.121) * 21,
            opacity: 0.18 + noise(17.317) * 0.72,
            blur: noise(51.771) < 0.28 ? 1.4 + noise(66.119) * 2.2 : noise(66.119) * 0.65,
            swayDuration: 4.5 + noise(31.417) * 5.5,
            sway: 18 + noise(71.113) * 52,
            rotation: 90 + noise(27.511) * 270,
        };
    }), [visualType]);

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
        
        let icon = faLeaf;
        if (visualType === 'snow') icon = faSnowflake;
        if (visualType === 'leaves') icon = faLeaf;
        return (
            <div className={`floating-multimedia-container particles-${visualType}`} aria-hidden="true">
                {particles.map((particle) => (
                    <div 
                        key={particle.id}
                        className="falling-particle-wrapper"
                        style={{
                            left: `${particle.left}%`,
                            animationDuration: `${particle.duration}s`,
                            animationDelay: `${particle.delay}s`,
                            opacity: particle.opacity,
                            filter: `blur(${particle.blur}px)`,
                            '--particle-size': `${particle.size}px`,
                            '--particle-sway': `${particle.sway}px`,
                            '--particle-rotation': `${particle.rotation}deg`,
                            '--particle-rotation-start': `${particle.rotation * -0.35}deg`,
                        }}
                    >
                        <div 
                            className="falling-particle-inner"
                            style={{
                                animationDuration: `${particle.swayDuration}s`,
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
