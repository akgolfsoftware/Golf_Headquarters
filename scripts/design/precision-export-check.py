import argparse, hashlib, json, re
from pathlib import Path
from urllib.parse import unquote, urlsplit

p=argparse.ArgumentParser();p.add_argument('root');p.add_argument('--out',required=True);a=p.parse_args()
r=Path(a.root).resolve(); fs=sorted(x for x in r.rglob('*') if x.is_file()); sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report={'method':'file-manifest-and-local-script-target-audit','normalized_control_maps_checked_by':'precision-control-map.cjs','root':str(r),'files':len(fs),'source_manifest':{str(x.relative_to(r)):sha(x) for x in fs},'html_local_scripts':[],'missing_script_targets':[],'maps':[]}
for f in fs:
 if f.suffix!='.html':continue
 for v in re.findall(r'<script[^>]+src=[\"\']([^\"\']+)',f.read_text(errors='replace'),re.I):
  q=urlsplit(v)
  if q.scheme or v.startswith('//'):continue
  dest=(f.parent/unquote(q.path)).resolve()
  entry={'host':str(f.relative_to(r)),'src':v,'exists':dest.is_file(),'inside':dest.is_relative_to(r),'historical':f.relative_to(r).parts[0] in ('arkiv','_kilde')}
  report['html_local_scripts'].append(entry)
  if not entry['exists'] or not entry['inside']:report['missing_script_targets'].append(entry)
for f in fs:
 if f.relative_to(r).parts[0] in ('arkiv','_kilde','_utenfor'):continue
 if f.suffix!='.json' or not ('knapp' in f.name or 'kontroll' in f.name):continue
 try:x=json.loads(f.read_text())
 except Exception:continue
 rows=x.get('rows',x.get('controls',[])) if isinstance(x,dict) else []
 if not isinstance(rows,list) or not rows:continue
 marked_active=[z for z in rows if z.get('aktiv',z.get('active',False))]
 active=[z for z in marked_active if z.get('gruppe','aktiv')=='aktiv']
 issues=[]
 for z in active:
  zi=z.get('id');fil=z.get('fil',z.get('file',''));line=z.get('linje',z.get('line')); cands=[r/fil,r/'ui_kits'/fil]
  sf=next((q for q in cands if q.is_file()),None)
  if not sf:issues.append({'id':zi,'issue':'missing_source','file':fil});continue
  if isinstance(line,int) and not 1<=line<=len(sf.read_text(errors='replace').splitlines()):issues.append({'id':zi,'issue':'invalid_line','file':fil})
  sh=z.get('sha256',z.get('hash',z.get('kilde_sha256')))
  if sh and isinstance(sh,str) and re.fullmatch('[0-9a-f]{64}',sh) and sh!=sha(sf):issues.append({'id':zi,'issue':'source_hash_mismatch','file':fil})
  typ=z.get('måltype',z.get('targetType'));target=str(z.get('mål',z.get('target','')))
  if typ=='ukjent' or not target or re.search(r'kaller forelderens callback|forrige.nivå|ukjent mål',target,re.I):issues.append({'id':zi,'issue':'unresolved_target','file':fil})
  if 'ds-next.jsx' in fil:issues.append({'id':zi,'issue':'fallback_marked_active_verify_bundle_guard','file':fil})
 report['maps'].append({'file':str(f.relative_to(r)),'rows':len(rows),'active':len(active),'marked_active':len(marked_active),'unique_ids':len(set(z.get('id') for z in rows)),'issues':issues})
Path(a.out).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(fs),'local_scripts':len(report['html_local_scripts']),'missing_scripts':len(report['missing_script_targets']),'active_missing_scripts':len([z for z in report['missing_script_targets'] if not z['historical']]),'maps':[{'file':x['file'],'rows':x['rows'],'active':x['active'],'issues':len(x['issues'])} for x in report['maps']]},ensure_ascii=False))

if any(not z['historical'] for z in report['missing_script_targets']):
 raise SystemExit(1)
