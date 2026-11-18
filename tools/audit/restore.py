#!/usr/bin/env python3
"""Restore audit removals from the untouched original; existing files never overwritten."""
from pathlib import Path
import argparse,hashlib,json,shutil
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'docs/audit/cleanup-manifest.json').read_text())
parser=argparse.ArgumentParser();group=parser.add_mutually_exclusive_group(required=True);group.add_argument('--all',action='store_true');group.add_argument('--path');parser.add_argument('--dry-run',action='store_true');args=parser.parse_args()
entries=[e for e in data['removed'] if args.all or e['path']==args.path]
if not entries:raise SystemExit('Path tidak ada dalam daftar pembersihan.')
for e in entries:
 relative=Path(e['path'])
 if relative.is_absolute() or '..' in relative.parts:raise SystemExit('Path tidak aman.')
 source=Path(data['sourceBackup'])/relative;target=root/relative
 if target.exists():continue
 if not source.is_file() or hashlib.sha256(source.read_bytes()).hexdigest()!=e['sha256']:raise SystemExit('Cadangan berbeda atau hilang: '+str(source))
 if not args.dry_run:target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
print(('Diperiksa' if args.dry_run else 'Dipulihkan')+': '+str(len(entries))+' berkas. Berkas yang sudah ada tidak ditimpa.')
