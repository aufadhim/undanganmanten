import SamayaTemplate from './templates/SamayaTemplate.jsx';
import NiseraTemplate from './templates/NiseraTemplate.jsx';
import EternalTemplate from './templates/EternalTemplate.jsx';
import SplitViewLayout from './SplitViewLayout.jsx';

export default function PhonePreview({ invitation, previewGuest }) {
    if (!invitation) return null;

    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};
    const typo = theme?.typography || {};
    
    const layoutOrder = Array.isArray(theme?.layoutOrder) ? theme.layoutOrder : (
        typeof theme?.layoutOrder === 'string' ? JSON.parse(theme.layoutOrder) : []
    );

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
                {template}
            </SplitViewLayout>
        </div>
    );
}