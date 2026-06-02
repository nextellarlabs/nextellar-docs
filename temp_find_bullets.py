from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parent
out = subprocess.check_output(['git', 'status', '--short'], cwd=str(root), text=True)
files = []
pattern = re.compile(r'^- (?!\s*$).{20,}[^\.\!\?\)]$')
for line in out.splitlines():
    if line and line[0] in 'MAU?' and len(line) > 3:
        path = line[3:]
        if path.startswith('docs/') and path.endswith('.mdx'):
            files.append(path)
for f in sorted(set(files)):
    p = root / f
    if not p.exists():
        continue
    lines = p.read_text(encoding='utf-8').splitlines()
    hits = []
    for i, l in enumerate(lines, 1):
        s = l.strip()
        if pattern.match(s) and ':' not in s and '[' not in s and '`' not in s and '**' not in s:
            hits.append((i, s))
    if hits:
        print(f)
        for i, s in hits:
            print(i, s)
        print('---')
