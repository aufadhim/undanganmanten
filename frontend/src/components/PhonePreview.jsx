import LoadingScreen from './atelier/LoadingScreen.jsx';
import {TEMPLATE_LOADERS} from '../config/templateLoaders.generated.js';
import {isImmersiveTemplate} from '../config/templateRegistry.js';
import TypographyRuntime from './TypographyRuntime.jsx';
import PreviewErrorBoundary from './PreviewErrorBoundary.jsx';
import { lazy, Suspense, useEffect } from 'react';
import SplitViewLayout from './SplitViewLayout.jsx';
import { ensureFontLoaded } from '../utils/fontLoader.js';


const TemplateComponents=Object.fromEntries(Object.entries(TEMPLATE_LOADERS).map(([id,load])=>[id,lazy(load)]));
const EternalTemplate=TemplateComponents.eternal;

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

function PhonePreviewContent({ invitation, previewGuest, editorPreview = false, previewMode }) {

    const profile = invitation?.coupleProfile || {};
    const theme = invitation?.themeSettings || {};
    const typo = theme?.typography || {};

    useEffect(() => {
        if (typo.fontHeading) ensureFontLoaded(typo.fontHeading);
        if (typo.fontBody) ensureFontLoaded(typo.fontBody);
    }, [typo.fontHeading, typo.fontBody]);
    
    if (!invitation) return null;
    const SelectedTemplate=TemplateComponents[invitation.themeId];
    if (SelectedTemplate && isImmersiveTemplate(invitation.themeId)) {
        const preview = <Suspense fallback={<LoadingScreen compact label={editorPreview ? 'Mempersiapkan cerita kalian…' : 'Memuat undangan…'} />}><SelectedTemplate invitation={invitation} previewGuest={previewGuest} editorPreview={editorPreview}/></Suspense>;
        return !editorPreview || previewMode === 'desktop'
            ? <SplitViewLayout invitation={invitation}>{preview}</SplitViewLayout>
            : preview;
    }
    const layoutOrder = invitation.themeId === 'engine-4' ? [] : parseLayoutOrder(theme?.layoutOrder).filter(item=>item && typeof item === 'object' && typeof item.id === 'string');

    const SignatureTemplate=SelectedTemplate||EternalTemplate;
    const template=<SignatureTemplate invitation={SelectedTemplate?invitation:{...invitation,themeId:'eternal'}} previewGuest={previewGuest} editorPreview={editorPreview}/>;

    return (
        <div className="phone-preview-wrapper">
            {/* Dynamic CSS Injection */}
            <style>{`
                /* Layout Order & Visibility (Dynamic) */
                ${layoutOrder.map((item, idx) => `
                    .template-wrapper-dynamic [data-section="${item.id}"] {
                        order: ${idx + 1};
                        display: ${item.enabled ? 'block' : 'none !important'};
                    }
                `).join('')}
            `}</style>

            <SplitViewLayout invitation={invitation}>
                <Suspense fallback={<LoadingScreen compact label="Memuat desain…" />}>
                    <TypographyRuntime typography={typo}>{template}</TypographyRuntime>
                </Suspense>
            </SplitViewLayout>
        </div>
    );
}

export default function PhonePreview(props){return <PreviewErrorBoundary resetKey={`${props.invitation?.id}:${props.invitation?.themeId}`}><PhonePreviewContent {...props}/></PreviewErrorBoundary>}
