import { lazy, Suspense } from 'react';
import SplitViewLayout from './SplitViewLayout.jsx';

const SamayaTemplate = lazy(() => import('./templates/SamayaTemplate.jsx'));
const NiseraTemplate = lazy(() => import('./templates/NiseraTemplate.jsx'));
const EternalTemplate = lazy(() => import('./templates/EternalTemplate.jsx'));

function parseLayoutOrder(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function PhonePreview({ invitation, previewGuest }) {
    if (!invitation) return null;

    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};
    const typo = theme?.typography || {};
    
    const layoutOrder = parseLayoutOrder(theme?.layoutOrder);

    let template = null;
    
    if (invitation?.themeId === 'eternal') {
        template = <EternalTemplate invitation={invitation} previewGuest={previewGuest} />;
    } else if (invitation?.themeId === 'nisera') {
        template = <NiseraTemplate invitation={invitation} previewGuest={previewGuest} />;
    } else {
        template = <SamayaTemplate invitation={invitation} previewGuest={previewGuest} />;
    }

    return (
        <div className="phone-preview-wrapper">
            {/* Dynamic CSS Injection */}
            <style>{`
                /* Typography Overrides */
                .split-view-container {
                    --font-heading: ${typo.fontHeading || "'Playfair Display', serif"};
                    --font-body: ${typo.fontBody || "'Manrope', sans-serif"};
                }
                
                /* Layout Order & Visibility (Dynamic) */
                ${layoutOrder.map((item, idx) => `
                    .template-wrapper-dynamic [data-section="${item.id}"] {
                        order: ${idx + 1};
                        display: ${item.enabled ? 'block' : 'none !important'};
                    }
                `).join('')}
            `}</style>

            <SplitViewLayout invitation={invitation}>
                <Suspense fallback={<div className="loading-screen">Memuat desain...</div>}>
                    {template}
                </Suspense>
            </SplitViewLayout>
        </div>
    );
}
