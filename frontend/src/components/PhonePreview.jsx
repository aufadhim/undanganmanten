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

export default function PhonePreview({ invitation, previewGuest, editorPreview = false }) {
    if (!invitation) return null;

    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};
    const typo = theme?.typography || {};
    
    const layoutOrder = parseLayoutOrder(theme?.layoutOrder);

    let template = null;
    
    if (invitation?.themeId === 'eternal') {
        template = <EternalTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else if (invitation?.themeId === 'nisera') {
        template = <NiseraTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
    } else {
        template = <SamayaTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview} />;
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

                :is(.samaya-wrapper, .nisera, .eternal-wrapper) :is(h1, h2, h3, h4, h5, h6) {
                    line-height: var(--typo-heading-line-height) !important;
                    letter-spacing: var(--typo-heading-letter-spacing) !important;
                }

                :is(.samaya-wrapper, .nisera, .eternal-wrapper) :is(p, li) {
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
