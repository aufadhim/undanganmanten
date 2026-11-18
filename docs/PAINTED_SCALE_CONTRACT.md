# Painted scene scale — shared calibration contract

## Principle

One formula, different measured references per painting. A raster image does not encode real-world units or a reliable horizon; those inputs must be authored and visually checked. Never substitute a fixed screen percentage when measurements are absent.

For every landmark, measured on the original image:

`human height in image = landmark image height × human metres / landmark metres × (feetY − horizonY) / (landmark groundY − horizonY)`

Use a weighted median of the candidate human heights. Give clear railings/doors more weight than tiny ambiguous stair risers or ornamental props. Disagreement requires review of the art, not an assertion that the formula proves realism.

Convert the resulting image-space body size and floor point to the character plane:

`depth ratio = (cameraZ − characterZ) / (cameraZ − backgroundZ)`

Scale the painting's world height by the inferred human image height and this ratio; divide by the cutout's visible alpha height. Project the foot point using the same ratio, then subtract the cutout's bottom offset. This preserves contact and avoids transparent image padding changing scale.

## Authoring

Store `composition.grounding.paintingScale.scenes.cover/hero/closing` in the canonical scene source. Each contains `asset`, `horizonY`, `footX`, `footY`, `screenFootY`, `humanMetres`, and `landmarks` (`id`, `height`, `groundY`, `metres`, `weight`). All image coordinates are normalized 0–1.

Run `node tools/calibrate-painted-scale.mjs <template-id>`, then `node tools/sync-template-registry.cjs`. The calibrator supports rooms, book and landscape data structures. It reads actual background aspect ratio, stage depth -2200 versus room depth -1600, or landscape world/area geometry. A missing reference rejects calibration; the old batch calibrator preserves measured templates.

Reference implementation: `frontend/public/templates/shared/painted-scale.js`. Tests cover weighted outliers, different painting sizes/depths, foot contact, and projected camera scale. Passing geometry tests does not replace visual review.

## Current rollout

All 40 Immersia scene sources now contain per-painting references for cover, hero and closing (120 placements). Swarnalaya's accepted cover/hero reference values are retained. Other references were manually estimated from the original artwork: clear doors, railings, walls, studio furniture/panels; natural grass references are marked low confidence. These are art-direction assumptions, not measured building dimensions.

The camera may move closer when a physically scaled figure is too small to read. This changes the background and human together; the human-to-landmark ratio is retained. A maximum crop protects against excessive zoom. It is possible to remain below the preferred framing band when that crop limit is reached.

Engine 1 outside-stage closing uses the stage landscape at z=-2200 with its real closing pose. Engine 2 room 4 uses its own closing guide; the closing guide is no longer ignored. Engine 3 computes the character's actual map-area plane and updates the relevant stop's camera to retain floor contact.

Canonical editable references live in each `shared/template-scenes/*.json`. `docs/IMMERSIA_PAINTING_REFERENCES.json` is an inspection snapshot; `docs/IMMERSIA_PAINTED_SCALE_RESULTS.json` is the generated geometry report. Reproduce all templates with `node tools/calibrate-all-painted-scales.mjs`, then sync the registry. The old grounding command delegates to this measured workflow.

Geometry verification covers every placement; browser spot checks cover representative engines. Full visual acceptance of every template is not claimed.

Limitations: the calibration is authored at 390×844. Wide responsive composition and sustained perspective consistency during camera flights require separate checks; recalibrating a reference camera alone is not a guarantee for every intermediate pose. Some generated artwork has inconsistent perspective and needs art correction.
