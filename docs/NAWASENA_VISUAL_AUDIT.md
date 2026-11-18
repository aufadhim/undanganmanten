# Nawasena visual and motion audit — 2026-11-04

Scope: the Nawasena Signature template; no shared Immersia engine or stored invitation data changed.

## Findings and corrections

- The opening painted the same full joglo image twice. Each copy had a different transform and filter, producing misaligned architectural edges. Removed the masked duplicate; retained a single fading architectural plane with no zoom or moving shadow.
- Birds were three copies of the entire bird bitmap, with horizontal clipping used as wings. Flight paths used browser viewport units even inside narrow invitation panels. Replaced this with a lightweight SVG hummingbird with separate shoulder-pivoted wings, steady hover, approach and departure phases, and invitation-container units. This is stylized animation, not a biological flight simulation.
- The hero had a second large zoom/blur arrival. Reduced its scale excursion and removed animated blur; reduced the background breathing range.
- Interior ornaments were mostly outside the viewport at 14–28% opacity. Some content sections had no decoration. Added a softly masked existing garden image, central paper clearance, and appropriately placed floral/branch ornaments. Reuses existing assets.
- A direct-child quote selector accidentally made its decorative layer part of the content layout. Restored absolute positioning. Removed negative wayang margins so the tableau follows the profiles rather than overlapping them.
- Opening animation continued after it became invisible. It now unmounts after its exit; offscreen section animations and animations in a backgrounded tab pause. Reduced-motion preference hides flight animation. Closed content is inert and excluded from accessibility navigation.

## Validation

- Three targeted regression checks pass; both modified JSX components compile.
- Browser inspection at widths 320 and 390: no horizontal overflow or broken images.
- Verified opening removal, absolute decorative layers, 24px clearance before the wayang tableau, and paused offscreen ornaments.
- Visual inspection of opening, quote and event section using an isolated local fixture. No API writes.
- Physical device performance and subjective animation comfort still need user review.

Preview fixture: `/tests/fixtures/nawasena-audit.html`.

## Layout correction after uploaded-character review

The first audit fixture bypassed PhonePreview, TypographyRuntime and the application's global CSS, and had no uploaded character. It therefore missed the real cropping and typography failures shown by the user. The fixture now uses the complete editor rendering path, a transparent full-body pair for both covers, DM Sans body text, long rundown time ranges, nine gallery photos and video, plus actual form/wishes components.

Replaced the accumulating stylesheet overrides with one Nawasena stylesheet:
- Opening/hero use independent text, complete contained image and greeting regions. Removed portrait masks, ornamental photo arches and fixed cover crop.
- Closing displays the pair as a contained image below the copy; it no longer uses an uploaded figure as a background.
- Livestream falls back to scenic art instead of the pair cutout.
- Removed repeated garden images from content sections. Continuous paper and restrained transparent branches replace the section-by-section scenic fades.
- Unified 11px body defaults and distinct heading sizes. Rundown time ranges and activity labels occupy separate columns. Current GuestConfirmation selectors replace obsolete form selectors; submit button has explicit light text on dark wine.
- Wayang imagery and caption use separate rows. Gallery has a width-based media height, avoiding the large empty space above photographs.

Browser checks at 320, 390 and 450px: no horizontal overflow or broken images; default quote/address/wish text computes to 11px; rundown columns have 18px separation; submit color is light on wine; gallery starts 26px after its heading. Eight targeted motion/typography checks pass. Database data and stored typography preferences were not reset.

## November 4, 2026 — architectural entrance

Reference: https://id.pinterest.com/pin/1020206121859281146/ (observed in browser: facade, doors hinge inward, camera passes into wedding room).

Nawasena now starts outside a grounded joglo. Open Invitation fades the greeting, hinges two textured door planes inward, and moves one uniformly scaled camera through the aperture over 4.2 seconds. The actual hero scene is already underneath; no replacement couple is painted on the doors. Hero text enters near the end. Scrolling is locked during entry. Reduced motion uses a short fade. Other templates are unchanged.

Implementation: `frontend/src/components/templates/nawasena/NawasenaEntrance.jsx`, `entrance-geometry.js`, `NawasenaTemplate.jsx`, and `nawasena.css`. Door coordinates are measured in image space. ResizeObserver preserves source aspect ratio at every screen size. Numeric tests verify the final aperture covers 320×640, 390×844, 450×900, and 1024×768 viewports.

Generated assets (built-in image generation, optimized WebP 1000×1500):
- `frontend/public/assets/nawasena/joglo-entrance-v2.webp`: portrait cold-press watercolor, front-facing traditional Javanese joglo, closed rectangular carved teak double doors, grounded ivory pilasters, muted ivory/burgundy flowers, soft brown/olive/gold palette; no people, lettering, frame or UI.
- `frontend/public/assets/nawasena/joglo-interior-v2.webp`: matching cold-press watercolor interior, central empty aisle toward distant small carved wedding dais, ivory fabric beneath teak beams, subdued burgundy/ivory flowers at edges, pale upper area for text, generous clear foreground floor; no people, lettering, frame or UI. Entrance painting supplied as style reference.

Original generated PNGs remain in `/Users/auf/.codex/generated_images/01a16a39-eee7-7df1-b814-a6557115cea7/` (exec-702fb70f-1d5d-4a15-8e57-5a391d0038ed.png and exec-075b1d5e-e965-41df-aa08-cf70bd906544.png).

### Corrected direction after user clarification
The architectural-door interpretation above was rejected. The current implementation restores the original exterior joglo and two hummingbirds on the cover and hero. The cover entrance starts automatically after the artwork decodes: a gentle uniform establishing move, staggered couple/text arrival, and flowers entering from the edges. Flowers, petals and hummingbirds continue ambient motion. Open Invitation only fades the cover over 800ms. Portal components, geometry tests and their unused WebP assets were removed. Signature cover uploads remain in Design → Music & Visual; labels now explicitly read Foto sampul and Foto hero.
