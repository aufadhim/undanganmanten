import { lazy, Suspense } from 'react';
import SplitViewLayout from './SplitViewLayout.jsx';


const EternalTemplate = lazy(() => import('./templates/eternal/EternalTemplate.jsx'));
const SerayaTemplate = lazy(() => import('./templates/seraya/SerayaTemplate.jsx'));
const NawasenaTemplate = lazy(() => import('./templates/nawasena/NawasenaTemplate.jsx'));
const IsvaraTemplate = lazy(() => import('./templates/isvara/IsvaraTemplate.jsx'));
const LanqingTemplate = lazy(() => import('./templates/lanqing/LanqingTemplate.jsx'));
const CelluloidTemplate = lazy(() => import('./templates/celluloid/CelluloidTemplate.jsx'));
const NocturneTemplate = lazy(() => import('./templates/nocturne/NocturneTemplate.jsx'));

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

export default function PhonePreview({ invitation, previewGuest, editorPreview = false }) {
    if (!invitation) return null;

    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};
    const typo = theme?.typography || {};
    
    const layoutOrder = parseLayoutOrder(theme?.layoutOrder);

    let template = null;
    
    if (invitation?.themeId === 'nocturne') {
        template = <NocturneTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'celluloid') {
        template = <CelluloidTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'lanqing') {
        template = <LanqingTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'isvara') {
        template = <IsvaraTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'nawasena') {
        template = <NawasenaTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'seraya') {
        template = <SerayaTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'eternal') {
        template = <EternalTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else {
        template = <EternalTemplate invitation={{ ...invitation, themeId: 'eternal' }} previewGuest={previewGuest} editorPreview={editorPreview} />;
    }

    return (
        <div className="phone-preview-wrapper">
            {/* Dynamic CSS Injection */}
            <style>{`
                /* Typography Overrides */
                .split-view-container {
                    --font-heading: ${typo.fontHeading || "'Playfair Display', serif"};
                    --font-body: ${typo.fontBody || "'Manrope', sans-serif"};
                    --typo-heading-line-height: ${typo.headingLineHeight ?? 1.15};
                    --typo-body-line-height: ${typo.bodyLineHeight ?? 1.65};
                    --typo-heading-letter-spacing: ${typo.headingLetterSpacing ?? 0}em;
                    --typo-body-letter-spacing: ${typo.bodyLetterSpacing ?? 0}em;
                }

                :is(.nocturne, .atelier, .lanqing, .isvara, .nawasena, .seraya, .eternal-wrapper) :is(h1, h2, h3, h4, h5, h6) {
                    line-height: var(--typo-heading-line-height) !important;
                    letter-spacing: var(--typo-heading-letter-spacing) !important;
                }

                :is(.nocturne, .atelier, .lanqing, .isvara, .nawasena, .seraya, .eternal-wrapper) :is(p, li) {
                    line-height: var(--typo-body-line-height) !important;
                    letter-spacing: var(--typo-body-letter-spacing) !important;
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
