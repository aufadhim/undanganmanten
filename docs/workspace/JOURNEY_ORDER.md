# Immersia visit order

`frontend/public/templates/shared/journey-route.js` translates business layout blocks into stable scene IDs. Both immersive engines use this route for scroll, touch, keyboard, auto traversal and navigation dots. Original chapter records retain their camera index, room, text panel and painted backdrop. Reordering visits never reorders camera definitions or DOM scene records.

Hero remains the first interior scene; the cover/hero opening belongs to the pinned cover block. Closing remains last. The couple block expands into bride/groom. RSVP and wishes map to one shared scene; its position follows the first enabled occurrence. Unknown or duplicate blocks do not produce invalid/duplicate destinations. Omitted sections retain template order. Disabled sections are omitted and have no visible dot.

Host updates recompute the route and dot sequence without reloading the scene. The current scene is preserved when possible. If it is removed, the camera returns to Hero; changes received mid-transition reconcile after that transition. Cross-room moves reuse the room blending/camera arc. Pramaya retains its book closing/return portal; Viridarium/Sogan retain their own closing stage.

The editor normalizes cover/footer to the first/last enabled block and allows drag on the interior blocks. Saving remains automatic.

Validation: `npm --prefix frontend run test:templates` includes journey-route tests. Browser integration fixture in `frontend/tests/fixtures/journey-check.html` can be copied temporarily into `frontend/public/qa/` while using Vite dev. It exercises gallery-first ordering, camera/room retention, next/previous, dots, disabling the active scene, and closing/return. Test data remains in the fixture page and does not save to a customer account.
