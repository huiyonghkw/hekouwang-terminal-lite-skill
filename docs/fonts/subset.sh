#!/usr/bin/env bash
# Regenerate docs/fonts/hkw-sans-sc-subset.woff2 from all docs/*.html text.
# Needs: python3 + fontTools; source Noto Sans SC variable (see NOTO_SRC below).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# 源字体按候选顺序找；换机后路径不同也能直接跑。可用 NOTO_SRC=... 覆盖。
NOTO_SRC="${NOTO_SRC:-}"
if [ -z "$NOTO_SRC" ]; then
  for _c in \
    "$HOME/.claude/skills/hekouwang-content-skill/assets/fonts/NotoSansSC-Variable-FULL.woff2" \
    "$HOME/Dashboard/Github/hekouwang-visual-core-skill/assets/fonts/NotoSansSC-Variable-FULL.woff2"; do
    [ -f "$_c" ] && NOTO_SRC="$_c" && break
  done
fi
# fontTools 可能装在 Homebrew 的独立 venv 里，系统 python3 反而 import 不到。
FT_PY="${FT_PY:-python3}"
if ! "$FT_PY" -c "import fontTools" >/dev/null 2>&1; then
  for _p in /opt/homebrew/Cellar/fonttools/*/libexec/bin/python; do
    [ -x "$_p" ] && FT_PY="$_p" && break
  done
fi
OUT="$ROOT/fonts/hkw-sans-sc-subset.woff2"
TMP="$(mktemp -t hkw-subset.XXXXXX.woff2)"
CHARS="$(mktemp -t hkw-chars.XXXXXX.txt)"

python3 - <<'PY' "$ROOT" "$CHARS"
import re, sys
from pathlib import Path
root = Path(sys.argv[1])
text = ''
for p in sorted(root.rglob('*.html')):
    text += p.read_text(encoding='utf-8', errors='ignore')
text += (root / 'assets/site.css').read_text(encoding='utf-8')
text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.S|re.I)
text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.S|re.I)
text = re.sub(r'<[^>]+>', '', text)
extra = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
chars = sorted(set(text + extra))
out = ''.join(c for c in chars if c not in '\r\n\t')
Path(sys.argv[2]).write_text(out, encoding='utf-8')
print('glyph request', len(out))
PY

[[ -f "$NOTO_SRC" ]] || { echo "Missing NOTO_SRC: $NOTO_SRC" >&2; exit 1; }

"$FT_PY" -m fontTools.subset "$NOTO_SRC" \
  --output-file="$TMP" \
  --flavor=woff2 \
  --text-file="$CHARS" \
  --layout-features='*' \
  --glyph-names --symbol-cmap --legacy-cmap \
  --notdef-outline --notdef-glyph --recommended-glyphs

"$FT_PY" - <<'PY' "$TMP"
from fontTools.ttLib import TTFont
from pathlib import Path
p = Path(__import__('sys').argv[1])
f = TTFont(p)
for nameID, s in [(1,'HKW Sans SC'),(2,'Regular'),(4,'HKW Sans SC'),(6,'HKWSansSC'),(16,'HKW Sans SC'),(17,'Regular')]:
    f['name'].setName(s, nameID, 3, 1, 0x409)
    f['name'].setName(s, nameID, 3, 1, 0x804)
f.save(p)
print('glyphs', len(f.getGlyphOrder()), 'size KB', round(p.stat().st_size/1024, 1))
PY

mv "$TMP" "$OUT"
rm -f "$CHARS"
echo "Wrote $OUT"
