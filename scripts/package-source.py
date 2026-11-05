"""Package the complete source project without local credentials or generated files."""
from pathlib import Path
import os
import zipfile

root = Path(__file__).resolve().parents[1]
target = root / 'public/downloads/monopoly-design-edition.zip'
target.parent.mkdir(parents=True, exist_ok=True)
skip_dirs = {'node_modules', 'dist', 'build', '.git', '.netlify', '.cache', '__pycache__', '.agents', '.codex', '.vite', 'coverage', '.output', '.vercel'}
skip_names = {'firebase-applet-config.json', '.npmrc', '.yarnrc', '.yarnrc.yml', '.DS_Store'}
entries = []
for folder, dirs, files in os.walk(root, followlinks=False):
    dirs[:] = sorted(d for d in dirs if d not in skip_dirs and not (Path(folder) / d).is_symlink())
    for name in sorted(files):
        path = Path(folder) / name
        lower = name.lower()
        if path.is_symlink() or name in skip_names or lower.startswith('.env') or lower.endswith(('.zip', '.log', '.pem', '.key', '.p12', '.pfx')):
            continue
        if any(word in lower for word in ('credential', 'service-account', 'serviceaccount', 'secret', 'token-cache')):
            continue
        entries.append(path)
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for path in entries:
        archive.write(path, Path('monopoly-design-edition') / path.relative_to(root))
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None, 'Archive integrity check failed'
    names = set(archive.namelist())
    for path in entries:
        assert str(Path('monopoly-design-edition') / path.relative_to(root)) in names
    assert 'monopoly-design-edition/netlify/database/migrations/20261104114208_create_game_rooms_and_scores/migration.sql' in names
print(f'Archive verified: {len(entries)} project files, {target.stat().st_size / 1024 / 1024:.1f} MB')
