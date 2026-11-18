# Painted scale rollout

Scope: 40 Immersia templates, 120 placements across cover, hero and closing. Swarnalaya accepted cover/hero sizes remain unchanged (45.88% and 35.52% at the reference viewport).

Each painting has an explicit horizon, floor contact point and object-height reference. These are visual estimates from the original art; natural vegetation references are marked low confidence. They are not surveyed architectural dimensions. Physical ratios are retained when camera framing moves closer to improve small figure readability. No single character screen percentage is applied across templates.

Engine 1 outside-stage cover/closing uses the actual stage landscape/depth and stage poses. Engine 2 has an independent room-4 closing guide. Engine 3 updates its area stop's camera and computes the character from the area's painted plane. All three retain centred visible figure bounds, actual cutout alpha bounds and manual CMS offsets.

Canonical authoring: `shared/template-scenes/*.json` → `composition.grounding.paintingScale`. Generated inspection data: `IMMERSIA_PAINTING_REFERENCES.json` and `IMMERSIA_PAINTED_SCALE_RESULTS.json`. Reproduce with `node tools/calibrate-all-painted-scales.mjs`, then `node tools/sync-template-registry.cjs`.

Validation: 11 targeted tests pass, including all 120 scale references, projected body sizes, floor contact, visible feet, body centring, Swarnalaya preservation and retained room backgrounds. Syntax checks pass for updated runtime packs and the isolated fixture. Browser spot checks use local fixture data; they are not full visual acceptance of every template or real-user database edits.
