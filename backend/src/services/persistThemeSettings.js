import {isDeepStrictEqual} from 'node:util';
import {stringsIn} from '../utils/storagePolicy.js';

// Caller supplies a transaction when saving alongside other invitation content.
export async function persistThemeSettings(db,invitation,input){
        const current = invitation.themeSettings || {};
        const patch = {...input};
        if(patch.characterSettings!==undefined){patch.characterSettings={...patch.characterSettings,separatePose:false};patch.coverImageUrl=patch.coverImageUrl??current.coverImageUrl??current.coverSecondImageUrl??'';patch.coverSecondImageUrl='';}

        const merged = {
            ...(patch.background !== undefined && { background: { ...(current.background || {}), ...patch.background } }),
            ...(patch.bodyText !== undefined && { bodyText: { ...(current.bodyText || {}), ...patch.bodyText } }),
            ...(patch.button !== undefined && { button: { ...(current.button || {}), ...patch.button } }),
            ...(patch.typography !== undefined && { typography: { ...(current.typography || {}), ...patch.typography } }),
            ...(patch.musicUrl !== undefined && { musicUrl: patch.musicUrl }),
            ...(patch.animationType !== undefined && { animationType: patch.animationType }),
            ...(patch.customLogoUrl !== undefined && { customLogoUrl: patch.customLogoUrl }),
            ...(patch.waTemplate !== undefined && { waTemplate: patch.waTemplate }),
            ...(patch.dresscodeText !== undefined && { dresscodeText: patch.dresscodeText }),
            ...(patch.dresscodeDetails !== undefined && { dresscodeDetails: patch.dresscodeDetails }),
            ...(patch.igFilterUrl !== undefined && { igFilterUrl: patch.igFilterUrl }),
            ...(patch.igFilterImageUrl !== undefined && { igFilterImageUrl: patch.igFilterImageUrl }),
            ...(patch.characterSettings !== undefined && {characterSettings:patch.characterSettings}),
            ...(patch.coverType !== undefined && { coverType: patch.coverType }),
            ...(patch.coverImageUrl !== undefined && { coverImageUrl: patch.coverImageUrl }),
            ...(patch.coverSecondImageUrl !== undefined && { coverSecondImageUrl: patch.coverSecondImageUrl }),
            ...(patch.openingAnimation !== undefined && { openingAnimation: patch.openingAnimation }),
            ...(patch.brideInstagramEnabled !== undefined && { brideInstagramEnabled: patch.brideInstagramEnabled }),
            ...(patch.groomInstagramEnabled !== undefined && { groomInstagramEnabled: patch.groomInstagramEnabled }),
            ...(patch.brideBioEnabled !== undefined && { brideBioEnabled: patch.brideBioEnabled }),
            ...(patch.groomBioEnabled !== undefined && { groomBioEnabled: patch.groomBioEnabled }),
            ...(patch.galleryLayout !== undefined && { galleryLayout: patch.galleryLayout }),
            ...(patch.loadingAnimation !== undefined && { loadingAnimation: patch.loadingAnimation }),
            ...(patch.closingText !== undefined && { closingText: patch.closingText }),
            ...(patch.layoutOrder !== undefined && { layoutOrder: patch.layoutOrder }),
            ...(patch.mainStory !== undefined && { mainStory: patch.mainStory }),
        };

        // Avoid writes for unchanged values; send the existing authoritative settings.
        for(const key of Object.keys(merged))if(isDeepStrictEqual(current[key],merged[key]))delete merged[key];
        if(!Object.keys(merged).length)return {themeSettings:current,releasedUrls:[]};

        // Gunakan upsert agar jika record themeSettings belum ada, sistem otomatis membuatnya
        const updated = await db.themeSettings.upsert({
            where: { invitationId: invitation.id },
            update: merged,
            create: {
                invitationId: invitation.id,
                // Prisma validates create even when upsert updates an existing row.
                background: current.background ?? {},
                bodyText: current.bodyText ?? {},
                button: current.button ?? {},
                typography: current.typography ?? {},
                ...merged,
            },
        });

        if(patch.characterSettings?.mode==='custom'&&patch.coverImageUrl&&patch.coverImageUrl!==current.coverImageUrl)await db.illustrationRequest.updateMany({where:{invitationId:invitation.id,status:'review',resultCover:patch.coverImageUrl},data:{status:'approved'}});
        const retained=new Set(stringsIn(updated)),releasedUrls=[...stringsIn(current)].filter(url=>/^(https?:\/\/|\/(?:api\/)?uploads\/)/i.test(url)&&!retained.has(url));
        return {themeSettings:updated,releasedUrls};
}
