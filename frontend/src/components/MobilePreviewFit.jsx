import { useLayoutEffect, useRef, useState } from 'react';

const phoneWidth = 393;
const phoneHeight = 852;

export default function MobilePreviewFit({ children }) {
    const slot = useRef(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const element = slot.current;
        const observer = new ResizeObserver(([{ contentRect }]) => {
            const { width, height } = contentRect;
            if (width && height) setScale(Math.min(1, width / phoneWidth, height / phoneHeight));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return <div ref={slot} className="mobile-preview-fit">
        <div className="mobile-preview-fit-box" style={{ width: phoneWidth * scale, height: phoneHeight * scale, '--phone-preview-scale': scale }}>
            {children}
        </div>
    </div>;
}
