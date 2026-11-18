#!/usr/bin/env python3
from pathlib import Path
import re,json,sys
root=Path(__file__).resolve().parents[2];dist=root/'frontend/dist';missing={};refs=set()
if not (dist/'index.html').exists():raise SystemExit('Jalankan npm --prefix frontend run build terlebih dahulu.')
for p in dist.rglob('*'):
 if p.suffix not in {'.js','.css','.html'}:continue
 for m in re.finditer(r'''(?<![A-Za-z0-9_./-])/(?:templates/[A-Za-z0-9_-]+/)?assets/[A-Za-z0-9_./% -]+\.(?:png|webp|jpg|jpeg|svg|mp3|mp4|woff2)(?=["'`?\)\s])''',p.read_text(errors='replace')):
  path=m[0];refs.add(path)
  if not (dist/path.lstrip('/')).is_file():missing.setdefault(path,[]).append(p.name)
result={'literalReferences':len(refs),'missing':missing,'scope':'Literal asset URLs in built JS/CSS/HTML; dynamically built filenames require separate review.'}
(root/'docs/audit/build-asset-check.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));sys.exit(bool(missing))
