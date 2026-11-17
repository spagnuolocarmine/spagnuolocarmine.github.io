"""Build and verify the user-downloadable source archive; exclude hosting identity and secrets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
output = root / 'dist/vento-sorgenti.zip'
files = [root / 'README.md']
for directory in ['dist', 'tests', 'scripts']:
    files.extend(p for p in (root / directory).rglob('*') if p.is_file() and p != output and '__pycache__' not in p.parts)
files = sorted(set(files))
with ZipFile(output, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for path in files:
        archive.write(path, str(path.relative_to(root)))
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == len(files)
    assert all(archive.read(str(path.relative_to(root))) == path.read_bytes() for path in files)
    assert not any(name.startswith(('.git/', '.openai/')) for name in archive.namelist())
print(f'Source ZIP verified: {len(files)} files, {output.stat().st_size} bytes')
