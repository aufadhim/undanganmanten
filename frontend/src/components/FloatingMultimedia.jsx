import { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake, faLeaf } from '@fortawesome/free-solid-svg-icons';
import '../styles/particles.css';
import {createMusicController,MUSIC_BUTTON_MARKUP} from '../../public/templates/shared/music-controller.js';
import '../../public/templates/shared/music-control.css';

export default function FloatingMultimedia({ invitation, isOpen, defaultColor = '#536343', defaultColorText = '#FFFFFF' }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const features = invitation?.invitationFeatures || {};
    const settings = invitation?.themeSettings || {};
    const resolvedButtonColor = settings?.button?.primary || settings?.colorAccent || settings?.colorPrimary || defaultColor;
    const openRef=useRef(isOpen);openRef.current=isOpen;

    const musicEnabled = features.musicEnabled !== false && settings.musicUrl;
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

    const controller=useRef(null),[musicError,setMusicError]=useState('');
    useEffect(()=>{
        if(!audioRef.current)return;
        const music=createMusicController(audioRef.current,{enabled:Boolean(musicEnabled),onChange:state=>{setIsPlaying(state.playing);setMusicError(state.error)}});controller.current=music;
        const root=audioRef.current.closest('.template-wrapper-dynamic')||audioRef.current.parentElement;
        const prime=event=>{const button=event.target.closest('button');if(!openRef.current&&button&&root?.contains(button)&&(button.hasAttribute('data-open-cover')||/buka undangan|open invitation/i.test(button.textContent)))music.open()};
        document.addEventListener('click',prime,true);
        if(isOpen)music.open();
        return()=>{document.removeEventListener('click',prime,true);music.destroy();controller.current=null};
    },[settings.musicUrl,Boolean(musicEnabled)]);
    useEffect(()=>{controller.current?.setEnabled(Boolean(musicEnabled));if(isOpen)controller.current?.open();else controller.current?.close()},[isOpen,musicEnabled]);
    function toggleMusic(){controller.current?.toggle()}

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
                    
                    <button type="button" onClick={toggleMusic}
                        className={`floating-music-btn music-control ${isOpen ? 'is-visible' : 'is-hidden'} ${isPlaying ? 'is-playing' : ''}`}
                        aria-label={isPlaying?'Jeda musik latar':'Putar musik latar'} aria-pressed={isPlaying}
                        title={isPlaying?'Jeda musik':'Putar musik'}
                        style={{'--music-color':resolvedButtonColor,'--music-ink':settings?.button?.text||settings?.colorTextLight||defaultColorText}}
                        dangerouslySetInnerHTML={{__html:MUSIC_BUTTON_MARKUP}} />
                    <span role="status" style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)'}}>{musicError}</span>
                </>
            )}
        </>
    );
}
