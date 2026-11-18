#!/usr/bin/env python3
"""Conservative asset inventory: candidates require review, never auto-delete."""
from pathlib import Path
import re,json,hashlib,collections
ROOT=Path(__file__).resolve().parents[2]; PUBLIC=ROOT/'frontend/public'
EXTS={'.js','.jsx','.ts','.tsx','.css','.html','.json'}
source=[p for base in ['frontend/src','backend/src'] for p in (ROOT/base).rglob('*') if p.is_file() and p.suffix in EXTS]+[ROOT/'frontend/index.html',ROOT/'frontend/vite.config.js']
texts={p.relative_to(ROOT).as_posix():p.read_text(errors='replace') for p in source}
# Follow static imports, re-exports, dynamic import(), and CSS @import to show code reachability.
modules={p.resolve():p for p in source if p.suffix in {'.js','.jsx','.ts','.tsx','.css'}}
reachable=set();pending=[ROOT/'frontend/src/main.jsx',ROOT/'backend/src/server.js'];imports=re.compile(r'''(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*|@import\s*)["']([^"']+)["']''')
while pending:
 p=pending.pop().resolve()
 if p in reachable or p not in modules:continue
 reachable.add(p);text=p.read_text(errors='replace')
 for match in imports.finditer(text):
  name=match[1]
  if name.startswith('.'):
   base=(p.parent/name).resolve();options=[base]+[Path(str(base)+ext) for ext in ['.js','.jsx','.ts','.tsx','.css']]+[base/'index.js',base/'index.jsx']
   pending.extend(x for x in options if x in modules)
joined='\n'.join(texts.values());rows=[];dupes=collections.defaultdict(list);sizebyfolder=collections.Counter()
for p in sorted(PUBLIC.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(PUBLIC).as_posix();url='/'+rel;stem=p.stem
 direct=[name for name,t in texts.items() if url in t]
 # Dynamic helpers often pass a filename or a stem and append extension at runtime.
 indirect=[name for name,t in texts.items() if p.name in t or (len(stem)>4 and re.search(r'''["'`]'''+re.escape(stem)+r'''["'`]''',t))]
 pattern=''
 if not direct and not indirect:
  if re.search(r'Orn-\d+',p.name) and '/assets/'+rel.split('/')[1] in joined and re.search(r'Orn-.*\$\{',joined):pattern='possible generated ornament index; review'
  if rel.startswith('assets/nawasena/custom/') and re.fullmatch(r'ornamen-\d+\.webp',p.name):pattern='numeric ornament map in Nawasena; retained'
  if 'theme-thumbnails/' in rel:pattern='dynamic thumbnail theme lookup; review'
 rows.append({'path':rel,'bytes':p.stat().st_size,'direct':direct,'indirect':indirect,'dynamicReview':pattern,'candidate':not(direct or indirect or pattern)})
 sizebyfolder['/'.join(rel.split('/')[:2])]+=p.stat().st_size
 digest=hashlib.sha256(p.read_bytes()).hexdigest();dupes[digest].append(rel)
report={'publicBytes':sum(x['bytes'] for x in rows),'publicFiles':len(rows),'folders':dict(sizebyfolder.most_common()),'assets':rows,'exactDuplicates':[v for v in dupes.values() if len(v)>1],'unreachableModules':[str(p.relative_to(ROOT)) for p in sorted(modules) if p not in reachable],'reachableModules':len(reachable)}
(ROOT/'docs/audit/asset-inventory.json').write_text(json.dumps(report,indent=2))
print('Public files:',len(rows),'MiB:',round(report['publicBytes']/2**20,2),'candidate MiB:',round(sum(x['bytes'] for x in rows if x['candidate'])/2**20,2))
for folder,size in sizebyfolder.most_common():
 group=[r for r in rows if r['path'].startswith(folder+'/')];c=[r for r in group if r['candidate']]
 print(folder,round(size/2**20,2),'MiB; candidate:',len(c),round(sum(r['bytes'] for r in c)/2**20,2))
print('Unreachable source modules:',len(report['unreachableModules']))
