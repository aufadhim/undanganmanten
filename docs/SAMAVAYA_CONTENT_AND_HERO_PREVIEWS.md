# Draft lifecycle, guide and hero previews

- Trial is an unpaid editable draft. Its legacy expiresAt field is not a Trial deadline and is not displayed to users. The expiry job restores legacy expired Trials to draft and only expires paid packages. Owner responses normalize legacy expired Trials immediately; no paid/public/archive status is normalized away.
- Payment is still mandatory before publication. Trial expiry does not create a second failed checklist item; paid H+30 checks remain enforced. Archive and account/storage quotas remain unchanged.
- Guide (/guide) contains searchable topics and expandable answers for studio, saving, artwork, content, media, publishing, payments, guests, RSVP, wishes, analytics and staff QR access. Terms and Privacy describe the current service. Final business contact details should be added when the operating domain/contact is established; do not invent an email address.

## Hero thumbnails

The single registry `shared/template-registry.json` uses `previewImg` for the static rendered hero and `previewFallback` for the original background. The latter is also used by SplitViewLayout so the wallpaper does not contain sample names. Run `node tools/sync-template-registry.cjs` after editing metadata.

43 active template previews live in `frontend/public/assets/theme-thumbnails/heroes/`. They are 390×844 WebP captures of actual template heroes, using default characters for Immersia and a bundled example couple photo for Signature. No user invitation or account is accessed. Keep the whole portrait visible in catalog cards.

To refresh after a template design change, with Vite running:

```
PREVIEW_BASE_URL=http://127.0.0.1:4175 node frontend/scripts/capture-template-posters.mjs
POSTER_THEME=pramaya PREVIEW_BASE_URL=http://127.0.0.1:4175 node frontend/scripts/capture-template-posters.mjs
```

Optional POSTER_ENGINE=1, 2, or 3 filters by engine. Requires installed Playwright Chromium and cwebp. The fixture lives under frontend/tests/fixtures and is not shipped in the production app. Book captures wait for the longer entry transition before snapshotting.

Validation: frontend production build, seven focused lifecycle/status tests, real browser checks of guide search, Terms, Privacy, landing images, and horizontal overflow at 390px/1280px. These checks do not submit payments or change stored invitations.
