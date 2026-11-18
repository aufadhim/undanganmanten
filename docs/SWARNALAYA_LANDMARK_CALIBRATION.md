> Superseded: the stair-only trial below was rejected visually. Current weighted railing/stair calibration is documented in PAINTED_SCALE_CONTRACT.md.

# Swarnalaya: initial landmark calibration

Scope: cover and hero only, pending visual acceptance. Other template compositions are unchanged.

Source: `shared/template-scenes/melayu-balairung.json`, under `composition.grounding.landmarkCalibration`. Reproduce with `node tools/calibrate-swarnalaya.mjs`, then `node tools/sync-template-registry.cjs`.

The measurements are approximate artistic references, not surveyed architectural dimensions. A 16 cm riser and 168 cm adult yield a 10.5:1 height ratio at the same painted floor depth. Transfer to the couple's foot position uses:

`adult image height = measured riser image height × 10.5 × (feetY − horizonY) / (riserY − horizonY)`

Cover uses stageLandscape: horizon .49, riser ground .596, riser height .0085, feet .79. Hero uses room1: horizon .52, riser ground .71, riser height .013, feet .79. The normalized courtyard anchor is slightly left of centre. Renderer sizing and actual cutout alpha bounds convert this image-space human size into the character layout.

At 390×844 this produces approximately 37.3% cover and 25.9% hero visible body heights; these are outputs rather than shared targets. Geometry checks pass, and both scenes were inspected in an isolated browser fixture. The fixture uses the default illustration, not private invitation edits. Closing is not recalibrated in this trial.

The batch calibrator now preserves individually measured calibrations. Do not roll this out to other artwork until visual review accepts the Swarnalaya result. Each other painting requires its own floor reference.
