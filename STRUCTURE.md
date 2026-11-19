# 目录结构（本仓库特例）

> 组织标准（目录）：`~/.user-agents/standards/hekouwang-skill-structure.md`  
> 付费化口径：`~/.user-agents/standards/hekouwang-skill-monetize.md`  
> 迁移执行手册：`~/.user-agents/standards/hekouwang-skill-monetize-playbook.md`  
> 本文件只写本仓特例与成熟度档位。渠道 × 版本见 [`RELEASE.md`](RELEASE.md)。  
> 公开面策略：**A. Lite 引流**。版本同号靠 `release.sh --check`（根 `VERSION` ↔ Lite SKILL ↔ `edition/VERSION`）。  
> 更新：2026-11-19（T1-b：干净主仓历史；拆除 `public/` 日常依赖）

---

## 成熟度

| 档 | 本仓状态 |
|---|---|
| **现况** | **L2+ / 冲 L3**：主仓 = Lite（干净单根历史）；Pro 在 `edition/`；白名单 `--pack`；`RELEASE.md` / `.clawhubignore` / `dist/<version>/`；日常 **`git push origin`** 推 `main`；Pages = 公开仓 **`docs/`** |
| **对齐前备份** | 脏历史 tip：`backup/pre-t1b-20261119`（已推 `paid` 远程，勿当公开发布源） |

---

## 命名

| 版本 | 命名 | 交付 |
|---|---|---|
| 专业版 | `hekouwang-terminal-skill` | overlay zip / SkillPay |
| 免费版 | `hekouwang-terminal-lite-skill` | GitHub + Pages + ClawHub |

根 `SKILL.md` / `SKILL.lite.md` = Lite；`edition/SKILL.md` + `SKILL.paid-section.md` = Pro（`--pack` 拼接）。

---

## 目录树

```text
hekouwang-terminal-skill/     # = 公开 Lite 仓本体（origin）
├── SKILL.md · SKILL.lite.md
├── scripts/ · config/ · lib/ · references/ · tests/
├── docs/                     # GitHub Pages
├── materials/ · listing-skillpay.md
├── RELEASE.md · STRUCTURE.md · .clawhubignore
├── VERSION                   # = edition/VERSION
├── edition/                  # 本地仓：Pro 增量（无公开远程）
├── roadmap/                    # 本地仓：升级与作战地图
├── services/terminal-402/    # 私有按次服务
└── dist/<version>/           # 不版控
```

```text
专业版 overlay zip = edition/（白名单）
免费版 / 公开     = 主仓本身（git push origin）
```

**不再使用 `public/` worktree。**

---

## 归属

主仓 / `edition`+`roadmap` / `services`。货架 `materials/` 可进 git，不进安装包。  
本机 Pro 调试：`./scripts/dev-overlay-from-edition.sh`（叠回路径已 ignore）。

---

## 推送

| Remote | 用途 |
|---|---|
| `origin` | 公开 Lite；**日常 `git push origin`（main）** |
| `paid` | 可选；保留 `backup/pre-t1b-*` 等历史备份，**不要**把干净 main 强推覆盖 paid/main 旧史除非有意归档 |

---

## 导出与打包

| 命令 | 作用 |
|---|---|
| `./scripts/release.sh --lite <目录>` | 导出 Lite 快照（可选；公开面已可直接推主仓） |
| `./scripts/release.sh --pack` | 从 edition 打 Pro overlay → `dist/<version>/…-paid.zip` |
| `./scripts/pack-skill-zip.sh …` | ClawHub 瘦身包 |
| `./scripts/dev-overlay-from-edition.sh` | 本机叠 Pro |
| `./scripts/release.sh --check` | 自检 |

---

## 待办

- [x] T0 / T1 / T1-b  
- [ ] `examples/`：有素材后再建  

---

## 禁止

- 免费版与专业版同名  
- 给 `edition/`、`roadmap/` 加公开远程  
- 把「必选 `public/`」写回标准  
- `materials/` / listing 进 Skill/ClawHub 包  
- 把 overlay Pro 路径提交进主仓  
- 按次 client 冒充专业版全集  
