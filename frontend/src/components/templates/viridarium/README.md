> Engine bersama sudah dipindah ke `frontend/src/components/templates/engines/rooms/` dan `frontend/public/templates/engines/rooms/`. Folder ini hanya menyimpan template Viridarium. Panduan: `docs/IMMERSIA_ENGINES.md`.

> Konfigurasi adegan diedit hanya di `shared/template-scenes/viridarium.json`. `defaultConfig.json`, runtime `config/invitation.json`, dan peta runtime adalah hasil sinkronisasi otomatis. Lihat `docs/TEMPLATE_SCENE_SOURCES.md`.

# Viridarium

**CSS untuk diedit:** `frontend/public/templates/viridarium/custom.css`

Folder ini hanya berisi komponen penghubung React, pemetaan data, dan default config.
HTML, CSS, animasi, serta aset ada di `frontend/public/templates/viridarium/`.

Panduan lengkap: `docs/PANDUAN_EDIT_VIRIDARIUM.md`.
ID `garden-canvas` pada database tetap dipertahankan untuk kompatibilitas.
