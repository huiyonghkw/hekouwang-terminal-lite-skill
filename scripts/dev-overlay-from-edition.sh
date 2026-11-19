#!/usr/bin/env bash
# 把 edition/ Pro 增量按安装相对路径覆盖到主仓工作区，便于本机调试 theme/font/scene。
# 覆盖出的文件默认被 .gitignore 挡住（见「T1 overlay」段），勿提交回主仓。
# 用法：
#   ./scripts/dev-overlay-from-edition.sh           # 叠加
#   ./scripts/dev-overlay-from-edition.sh --check   # 只检查 edition 是否就绪
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ED="$ROOT/edition"
cd "$ROOT"

if [ ! -f "$ED/config/themes/palettes/brand.py" ]; then
  printf '✗ 缺 edition/config/themes/palettes/brand.py\n' >&2
  exit 1
fi
if [ "${1:-}" = "--check" ]; then
  printf '✓ edition Pro 增量就绪（VERSION=%s）\n' "$(tr -d '[:space:]' < "$ED/VERSION")"
  exit 0
fi

rsync -a \
  --exclude='.git' \
  --exclude='README.md' \
  --exclude='.gitignore' \
  --exclude='SKILL.paid-section.md' \
  --exclude='SKILL.md' \
  --exclude='VERSION' \
  --exclude='CHANGELOG.md' \
  --exclude='README.paid.md' \
  --exclude='README.paid.en.md' \
  "$ED/" "$ROOT/"

# 标记，方便识别工作区处于 Pro overlay 状态
printf '%s\n' "overlay-from-edition $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$ROOT/.hkw-edition-overlay"
printf '✓ 已从 edition/ 叠加 Pro 增量到工作区（勿 git add 这些路径）\n'
printf '  清掉 overlay：git checkout -- . && git clean -fd -- 对应路径；或重装 Lite 工作树\n'
