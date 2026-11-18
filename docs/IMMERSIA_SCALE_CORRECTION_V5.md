# Scale and background correction v5

- Fixed Chromatica/Nocturne registry thumbnails referencing absent v3 files. Existing v2 art is retained. All 40 Immersia thumbnail files decode successfully.
- Restored soft Viridarium gradients remain in use; central opacity increased without adding a rectangular mask or surface.
- Environment sizing now covers the viewport around the actual floor anchor, including an overscan margin. Previously, an off-centre floor anchor could leave a top/bottom gap even with image height greater than viewport height.
- Recalibrated all 40 scene sources: cover/hero/closing visible body heights remain 43%/48%/40%. Painted environments receive closer framing (1.4 minimum coverage), with foot position recalculated together with the landscape camera and character coordinates. No new character assets or database changes.
- Eight targeted grounding, room-background and ivory checks passed, including full image-edge coverage and unchanged floor contact. Browser spot check used an isolated Viridarium fixture; individual visual review of all themes is not claimed.
- The broader landscape-engine test could not start under the installed Node runtime because an existing JSON import lacks an import attribute. The targeted geometry checks import the landscape world directly and pass.
