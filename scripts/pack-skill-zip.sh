#!/bin/bash
# ============================================================
# pack-skill-zip.sh — 打 ClawHub / 平台分发用的免费版瘦身包
#
#   ./scripts/pack-skill-zip.sh dist/clawhub/hekouwang-terminal-lite-skill-3.0.6.zip
#
# 为什么不直接发 release.sh --lite 的导出树：
#   导出树是给 GitHub 公开仓用的，里面还有站点资产（docs 图片/字体/页面）和
#   维护者工具（release.sh / gen-site-*.py / tests/）。ClawHub 运行时用不到，
#   而且这些文件会把 SKILL 的 description 与包内行为拉出「能力隐瞒」误判。
#   本脚本 = 导出 → 剔除站点与维护者工具 → 生成 _meta.json → 确定性 zip。
#
# 与根目录 .clawhubignore 对账（必须双挡）：
#   materials/、listing-skillpay.md 可留在主仓 git，但不得进 ClawHub / Skill 包。
#   --lite 导出可能仍带上它们（git 跟踪）；此处强制剔除，自检也会验缺席。
#
# 产物路径约定：dist/clawhub/（Lite 包）；dist/skillpay/ 放 Pro 包
# 可复现：固定时间戳（1980-01-01）、文件名排序、UTF-8 标记 0x800。
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-}"
if [ -z "$OUT" ]; then
  printf '用法：%s <输出zip>\n' "$0" >&2
  exit 1
fi
case "$OUT" in
  /*) ;;
  *) OUT="$PWD/$OUT" ;;
esac

STAGE="/tmp/hkw-skill-pack"
VER="$(tr -d '[:space:]' < "$SCRIPT_DIR/VERSION")"
[ -n "$VER" ] || { printf '✗ 读不到 VERSION\n' >&2; exit 1; }

# 只清自己管的临时目录；防止变量为空或指到根目录时误删
case "$STAGE" in
  */hkw-skill-pack) ;;
  *) printf '✗ 临时目录异常：%s\n' "$STAGE" >&2; exit 1 ;;
esac
rm -rf "$STAGE"
mkdir -p "$STAGE"

printf '\n▸ 导出 lite 树 → %s\n' "$STAGE"
"$SCRIPT_DIR/scripts/release.sh" --lite "$STAGE"

# ---- 剔除站点专属资产 ----------------------------------------
# 保留 docs/manual*.md（SKILL 与 README 都链它们）；其余 docs 文件只服务官网。
# feed / sitemap / robots / favicon / icon / llms.txt 一并剔掉：HTML 已经不在包里，
# 这些文件既跑不到也会让包越过 90 文件上限。
printf '\n▸ 剔除站点专属资产\n'
for p in docs/assets docs/fonts docs/images docs/guide docs/themes docs/tools; do
  if [ -e "$STAGE/$p" ]; then rm -rf "$STAGE/$p"; printf '  - %s/\n' "$p"; fi
done
find "$STAGE/docs" -maxdepth 1 -type f \( -name '*.html' -o -name '速查卡.*' \) -print0 2>/dev/null \
  | while IFS= read -r -d '' f; do rm -f "$f"; printf '  - docs/%s\n' "$(basename "$f")"; done
for p in docs/feed.xml docs/sitemap.xml docs/robots.txt docs/favicon.svg docs/icon.svg docs/llms.txt; do
  if [ -e "$STAGE/$p" ]; then rm -f "$STAGE/$p"; printf '  - %s\n' "$p"; fi
done

# ---- 剔除货架物料与 SkillPay 文案（不得进 ClawHub / Skill 包）--
# 与 .clawhubignore 对账；--lite 若因 git 跟踪带进来，这里兜底删掉。
printf '\n▸ 剔除货架物料与商品文案\n'
for p in materials listing-skillpay.md; do
  if [ -e "$STAGE/$p" ]; then rm -rf "$STAGE/$p"; printf '  - %s\n' "$p"; fi
done

# ---- 剔除仓库元数据与孤儿词条 --------------------------------
# .gitignore / .github 是 Git 仓的东西，ClawHub 解包后没有意义。
# lib/i18n/*/gates.sh 只被 import/palette/workspace 三个付费脚本加载，
# 这三个脚本已不在 lite 树里，词条属于孤儿文件。
printf '\n▸ 剔除仓库元数据与孤儿词条\n'
for p in .gitignore .github .clawhubignore STRUCTURE.md RELEASE.md \
  lib/i18n/en/gates.sh lib/i18n/zh/gates.sh; do
  if [ -e "$STAGE/$p" ]; then rm -rf "$STAGE/$p"; printf '  - %s\n' "$p"; fi
done

# ---- 剔除维护者工具（ClawHub 运行时不需要）------------------
printf '\n▸ 剔除维护者工具\n'
for p in \
  scripts/release.sh scripts/pack-skill-zip.sh \
  scripts/gen-site-changelog.py scripts/gen-site-meta.py scripts/gen-site-themes.py \
  scripts/demo-scene-reel.sh scripts/apply-appendix-c.sh \
  scripts/capture-compare.sh scripts/capture-font-check.sh \
  tailwind.config.js tests; do
  if [ -e "$STAGE/$p" ]; then rm -rf "$STAGE/$p"; printf '  - %s\n' "$p"; fi
done

# ---- 裁掉专业版能力：跟随系统深浅色 ---------------------------
# 免费版不含 theme.sh --auto / launchd 跟随代理：这块是专业版卖点。
# 一律按**精确代码块**裁剪，块找不到就让打包失败 —— 宁可发布前报错，
# 也不要把专业版代码悄悄带进免费包（ClawScan 按「声明-行为一致」判定）。
printf '\n▸ 裁掉专业版能力：跟随系统\n'
python3 - "$STAGE" <<'PY'
import pathlib, sys

root = pathlib.Path(sys.argv[1])
bad = []

def drop_block(rel, old, label=""):
    p = root / rel
    t = p.read_text(encoding="utf-8")
    if old not in t:
        bad.append(f"{rel}: 找不到代码块 {label or old.splitlines()[0]}")
        return
    p.write_text(t.replace(old, "", 1), encoding="utf-8")

def drop_lines(rel, prefixes=(), contains=()):
    p = root / rel
    out = []
    for ln in p.read_text(encoding="utf-8").splitlines(True):
        if any(ln.startswith(x) for x in prefixes):
            continue
        if any(x in ln for x in contains):
            continue
        out.append(ln)
    p.write_text("".join(out), encoding="utf-8")

T = "scripts/theme.sh"
drop_block(T, 'AUTO_CONF="$RUNTIME/auto.conf"\nAGENT_LABEL="com.hekouwang.terminal.autotheme"\nAGENT_PLIST="$HOME/Library/LaunchAgents/$AGENT_LABEL.plist"\n', "变量定义")
drop_block(T, '''  if [ -f "$AUTO_CONF" ]; then
    # shellcheck disable=SC1090
    . "$AUTO_CONF"
    printf "  ${c_dim}%s${c_off}${c_ok}%s${c_off}${c_dim}%s${c_off}\\n" \\
      "$(t M_THEME_AUTO_LABEL)" "$(t M_THEME_AUTO_ON)" "$(t M_THEME_AUTO_PAIR "$AUTO_DARK" "$AUTO_LIGHT")"
  else
    printf "  ${c_dim}%s${c_off}\\n" "$(t M_THEME_AUTO_HINT)"
  fi
''', "画廊里的跟随状态")
drop_block(T, '''  # 手动钉主题时关掉「跟随系统」——否则 launchd 会按系统浅/深色再打回来，
  # 看起来像「配了黑色却自动变白」。auto_apply / auto_setup 调 apply 时带
  # HKW_AUTO_APPLYING=1，跳过这一步。
  if [ -z "${HKW_AUTO_APPLYING:-}" ] && [ -f "$AUTO_CONF" ]; then
    launchctl bootout "gui/$(id -u)/$AGENT_LABEL" 2>/dev/null \\
      || launchctl unload "$AGENT_PLIST" 2>/dev/null || true
    rm -f "$AGENT_PLIST" "$AUTO_CONF"
    # 回执稍后 flush；先记一条，别在换肤中途插一堵墙
    _AUTO_WAS_ON=1
  else
    _AUTO_WAS_ON=0
  fi
''', "手动换肤时拆代理")
drop_block(T, '''  if [ "${_AUTO_WAS_ON:-0}" = "1" ]; then
    printf "  ${c_dim}%s${c_off}\\n" "$(t M_THEME_AUTO_PINNED_OFF)"
    printf "  ${c_dim}%s${c_off}\\n" "$(t M_THEME_AUTO_PINNED_HOW)"
  fi
''', "钉住提示")
drop_block(T, '''  --apply-auto)  auto_apply ;;
  --auto)
    case "${2:-}" in
      off|--off) auto_off ;;
      *)         auto_setup "${2:-}" "${3:-}" ;;
    esac ;;
''', "命令分发")

# 整段：从「跟随系统深浅色」注释到 auto_off() 结束
p = root / T
t = p.read_text(encoding="utf-8")
start = "# ---- 跟随系统深浅色 ----------------------------------------\n"
end = '  say M_THEME_AUTO_DISABLED\n}\n'
i = t.find(start)
j = t.find(end, i if i >= 0 else 0)
if i < 0 or j < 0:
    bad.append(f"{T}: 找不到跟随系统函数段")
else:
    p.write_text(t[:i] + t[j + len(end):], encoding="utf-8")

# doctor：状态行与收尾提示
drop_block("scripts/doctor.sh", '''  # auto follow-system
  if [ -f "$HOME/Library/LaunchAgents/com.hekouwang.terminal.autotheme.plist" ]; then
    st "$(t M_DOC_ST_AUTO)" "$(t M_DOC_ST_AUTO_ON)"
  else
    st "$(t M_DOC_ST_AUTO)" "$(t M_DOC_ST_AUTO_OFF)"
  fi
''', "doctor 状态行")
drop_block("scripts/doctor.sh", '''# 跟随系统换肤
if [ -f "$HOME/Library/LaunchAgents/com.hekouwang.terminal.autotheme.plist" ]; then
  ok "$(t M_DOC_AUTO_ON)"
else
  [ "$QUIET" = "1" ] || printf "  ${d}·${o} ${d}%s${o}\\n" "$(t M_DOC_AUTO_OFF)"
fi
''', "doctor 收尾提示")

# install：结尾的跟随系统提示
drop_lines("scripts/install.sh", prefixes=("dim M_INSTALL_TAIL_AUTO",))
# install 帮助文本里的跟随系统一行
drop_lines("lib/i18n/zh/install.sh", contains=("./scripts/theme.sh --auto",))
drop_lines("lib/i18n/en/install.sh", contains=("./scripts/theme.sh --auto",))
# doctor：--fix 里再也没有 auto 分组
drop_lines("scripts/doctor.sh",
           contains=("    *--auto*) printf '%s' auto ;;", "        *跟随*|*Follow\\ system*) printf '%s' auto ;;"))
# unlock 完成提示（专业版装好后由专业版自带的提示接管）
drop_lines("lib/i18n/zh/unlock.sh", prefixes=("M_UL_DONE_2=",))
drop_lines("lib/i18n/en/unlock.sh", prefixes=("M_UL_DONE_2=",))

# uninstall：免费包不安装 launch agent，去除历史专业版的清理块（避免被读成 Lite 能力）
_p = root / "scripts/uninstall.sh"
_t = _p.read_text(encoding="utf-8")
_i = _t.find("# ---- 4. 跟随系统换肤的后台代理")
_end = "  skip M_UN_NO_AGENT\nfi\n"
_j = _t.find(_end, _i if _i >= 0 else 0)
if _i < 0 or _j < 0:
    bad.append("scripts/uninstall.sh: 找不到 launch agent 清理块")
else:
    _p.write_text(_t[:_i] + _t[_j + len(_end):], encoding="utf-8")
drop_lines("scripts/uninstall.sh", prefixes=("AGENT_LABEL=", "AGENT_PLIST="))
for lang in ("zh", "en"):
    drop_lines(f"lib/i18n/{lang}/uninstall.sh",
               prefixes=("M_UN_S4=", "M_UN_RM_AGENT=", "M_UN_NO_AGENT="))

# transaction：免费包没有自动主题 agent，去掉对应白名单条目
drop_lines("lib/transaction.py", contains=("com.hekouwang.terminal.autotheme.plist",))

# sync：状态导入时的跟随系统分支
drop_block("scripts/sync.sh", '''  if [ "${HKW_ST_AUTO_ON:-0}" = "1" ]; then
    # shellcheck disable=SC2086
    bash "$SCRIPT_DIR/scripts/theme.sh" --auto ${HKW_ST_AUTO_DARK:+$HKW_ST_AUTO_DARK} ${HKW_ST_AUTO_LIGHT:+$HKW_ST_AUTO_LIGHT} \\
      && same "$(t M_SY_STATE_APPLIED_AUTO)" \\
      || printf "  ${y}%s${o}\\n" "$(t M_SY_STATE_FAIL_AUTO)"
  else
    bash "$SCRIPT_DIR/scripts/theme.sh" --auto off >/dev/null 2>&1 || true
    same "$(t M_SY_STATE_APPLIED_AUTO_OFF)"
  fi
''', "sync 跟随系统分支")

# i18n：帮助文本与词条
drop_block("lib/i18n/zh/theme.sh", '''  ./scripts/theme.sh --auto               跟随系统深浅色（默认关；开启用这条，默认暗/亮配对）
  ./scripts/theme.sh --auto <暗> <亮>      跟随系统，自己指定配对
  ./scripts/theme.sh --auto off           关掉跟随
''', "中文帮助行")
drop_block("lib/i18n/zh/theme.sh", '''
跟随系统默认关闭。手动 ./scripts/theme.sh <主题> 会钉住该主题，并自动关掉跟随
（避免「配了黑色却被系统浅色顶回白色」）。想重新跟随再跑 --auto。
''', "中文帮助尾段")
drop_block("lib/i18n/en/theme.sh", '''  ./scripts/theme.sh --auto               follow system light/dark (off by default; this turns it on)
  ./scripts/theme.sh --auto <dark> <light>  follow the system with your own pair
  ./scripts/theme.sh --auto off           stop following
''', "英文帮助行")
drop_block("lib/i18n/en/theme.sh", '''
Following the system is off by default. A manual ./scripts/theme.sh <theme> pins that
theme and turns following off (so a dark pick is not overwritten by a light
system appearance). Run --auto again when you want it back.
''', "英文帮助尾段")

for lang in ("zh", "en"):
    drop_lines(f"lib/i18n/{lang}/theme.sh", prefixes=("M_THEME_AUTO",))
    drop_lines(f"lib/i18n/{lang}/doctor.sh", prefixes=("M_DOC_ST_AUTO", "M_DOC_AUTO_"))
    drop_lines(f"lib/i18n/{lang}/install.sh", prefixes=("M_INSTALL_TAIL_AUTO=",))
    drop_lines(f"lib/i18n/{lang}/sync.sh",
               prefixes=("M_SY_STATE_APPLIED_AUTO", "M_SY_STATE_FAIL_AUTO"))

if bad:
    print("  ✗ 裁剪失败：")
    for b in bad:
        print("    -", b)
    raise SystemExit(1)
print("  ✓ 已裁掉 --auto / launchctl 跟随代理及其词条")
PY

# ---- 生成 _meta.json -----------------------------------------
printf '\n▸ 生成 _meta.json\n'
python3 - "$STAGE" "$VER" <<'PY'
import json, pathlib, sys

root = pathlib.Path(sys.argv[1])
ver = sys.argv[2]

scripts = sorted(
    f"scripts/{p.name}" for p in (root / "scripts").glob("*")
    if p.is_file() and p.suffix == ".sh"
)
references = sorted(
    f"references/{p.name}" for p in (root / "references").glob("*.md")
)

meta = {
    "name": "hekouwang-terminal-lite-skill",
    "displayName": "会勇禾口王 · 终端工作台（免费版）",
    "version": ver,
    "tagline": "一份色板穿透 iTerm2 与整条命令行工具链",
    "description": (
        "免费版 macOS 终端工作台：配好的 iTerm2（3 套社区主题、毛玻璃、4 条 Triggers、"
        "语义 Cmd-click、Shift+Enter），加安装 / 迁移 / 换肤 / 体检 / 卸载脚本。"
        "安装会联网：Homebrew / oh-my-zsh / iTerm2 Shell Integration 的官方安装脚本先下载到"
        "临时文件并打印 SHA-256，只有 HKW_ASSUME_YES=1 时才自动执行；Homebrew / oh-my-zsh "
        "未装成会中止，Shell Integration 未执行时保留文件并继续后续步骤；用 brew 装包并记录到 "
        "installed-brew.txt；写系统 defaults、iTerm2 偏好、~/.config/ghostty/config"
        "（非本工具生成的文件先备份；ssh-terminfo 会在首次 SSH 登录时往远端 ~/.terminfo "
        "写 xterm-ghostty），向 ~/.gitconfig 追加 include.path，覆盖 ~/.config/starship.toml "
        "前先备份；可选导入 shell 历史到 atuin（HKW_ATUIN_IMPORT=1，默认不导入）；"
        "检测到 VS Code / Cursor 时安装主题扩展；update.sh 在 git 安装下 fetch/pull"
        "（本地改动先 stash），非 git 安装跳过；可选安装专业版付费包（scripts/unlock.sh）；"
        "换肤事务与回滚（scripts/theme.sh --plan/--rollback）、换机迁移"
        "（scripts/sync.sh --export/--state-export/--state-import/--pull）；"
        "P3 广色域（--p3，读 HKW_P3_FACTOR）；AI CLI 主题检测只处理 --config 显式传入的设置文件；"
        "卸载交互模式先询问再删除/还原（--yes 跳过确认），可还原 ~/.zshrc 与 starship / Ghostty 备份，删主题、扩展、Profile、"
        "~/.oh-my-zsh 与运行时，brew 包只按安装清单卸。"
        "多终端批量编排、光学校准、场景、工作区、跟随系统属付费版 hekouwang-terminal-skill。"
        "不用于与终端配色无关的普通编码。"
    ),
    "author": "会勇禾口王",
    "license": "MIT",
    "category": "developer-tools",
    "tags": [
        "终端配色", "iTerm2", "主题", "zsh",
        "开发环境", "macOS", "Nerd Font", "终端体检",
    ],
    "requires_api_key": False,
    "scripts": scripts,
    "references": references,
}

out = root / "_meta.json"
out.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"  + _meta.json（{len(scripts)} 个脚本 / {len(references)} 份参考）")
PY

# ---- 打包（确定性 + UTF-8 标记）------------------------------
printf '\n▸ 打包 → %s\n' "$OUT"
mkdir -p "$(dirname "$OUT")"
python3 - "$STAGE" "$OUT" <<'PY'
import os, pathlib, sys, zipfile

root = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
names = sorted(
    p.relative_to(root).as_posix()
    for p in root.rglob("*")
    if p.is_file() and "__pycache__" not in p.parts and p.suffix not in (".pyc", ".pyo")
)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in names:
        zi = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
        zi.flag_bits |= 0x800          # UTF-8，否则中文文件名解出来是乱码
        zi.compress_type = zipfile.ZIP_DEFLATED
        zi.external_attr = 0o644 << 16
        zi.create_system = 3
        z.writestr(zi, (root / name).read_bytes())
print(f"  {len(names)} 个文件")
PY

# ---- 自检 ----------------------------------------------------
printf '\n▸ 自检\n'
BAD=0
check_absent() {  # check_absent <说明> <相对路径>
  if [ -e "$STAGE/$2" ]; then
    printf '  ✗ %s 仍在包里：%s\n' "$1" "$2"; BAD=1
  else
    printf '  ✓ 无%s：%s\n' "$1" "$2"
  fi
}
check_absent "付费色板"        "config/themes/palettes/brand.py"
check_absent "付费入口"        "scripts/font.sh"
check_absent "付费入口"        "scripts/scene.sh"
check_absent "付费入口"        "scripts/workspace.sh"
check_absent "付费入口"        "scripts/palette.sh"
check_absent "付费入口"        "scripts/import.sh"
check_absent "付费引擎"        "config/typography"
check_absent "付费引擎"        "config/scenes"
check_absent "付费金标"        "tests/golden"
check_absent "付费速查卡"      "docs/速查卡.pdf"
check_absent "维护者工具"      "scripts/release.sh"
check_absent "维护者工具"      "scripts/pack-skill-zip.sh"
check_absent "维护者工具"      "scripts/gen-site-meta.py"
check_absent "维护者工具"      "scripts/demo-scene-reel.sh"
check_absent "测试目录"        "tests"
check_absent "站点资产"        "docs/assets"
check_absent "货架物料"        "materials"
check_absent "SkillPay文案"    "listing-skillpay.md"
# 免费包不得残留跟随系统**能力**代码/词条。
# 例外：uninstall.sh 与 unlock.sh 的词条只用于「清理专业版残留 / 装完专业版后的提示」，
#       不是免费版自己能创建的能力，保留不算越界。
_auto_hits="$(grep -rEl -- '--auto|autotheme' "$STAGE/scripts" "$STAGE/lib" 2>/dev/null \
  | grep -vE "/i18n/(zh|en)/unlock\.sh$" || true)"
if [ -n "$_auto_hits" ]; then
  printf '  ✗ 免费包仍残留跟随系统引用：\n'
  printf '%s\n' "$_auto_hits" | sed 's/^/    /'
  BAD=1
else
  printf '  ✓ 无跟随系统能力代码与词条（--auto / launchctl 代理）\n'
fi
# 裁剪后所有 shell 脚本必须仍能过语法检查
_syn_bad=0
while IFS= read -r -d '' _f; do
  bash -n "$_f" || _syn_bad=1
done < <(find "$STAGE" -type f -name '*.sh' -print0)
if [ "$_syn_bad" -ne 0 ]; then
  printf '  ✗ 有脚本语法检查不通过\n'; BAD=1
else
  printf '  ✓ 全部 .sh 通过 bash -n\n'
fi
if [ ! -f "$STAGE/SKILL.md" ] || ! grep -qx 'name: hekouwang-terminal-lite-skill' "$STAGE/SKILL.md"; then
  printf '  ✗ 包根缺 SKILL.md 或 name 不是 hekouwang-terminal-lite-skill\n'; BAD=1
else
  printf '  ✓ 包根 SKILL.md（name: hekouwang-terminal-lite-skill）\n'
fi
if [ ! -f "$STAGE/_meta.json" ]; then
  printf '  ✗ 包根缺 _meta.json\n'; BAD=1
else
  printf '  ✓ 包根 _meta.json\n'
fi

if [ "$BAD" -ne 0 ]; then
  printf '\n✗ 自检未通过，zip 保留在 %s 供排查\n' "$OUT" >&2
  exit 1
fi
printf '\n✓ 完成：%s（版本 %s）\n' "$OUT" "$VER"
