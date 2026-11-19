# 渠道与版本矩阵

> 组织标准：`~/.user-agents/standards/hekouwang-skill-structure.md`  
> 付费化：`~/.user-agents/standards/hekouwang-skill-monetize.md` · playbook：`…/hekouwang-skill-monetize-playbook.md`  
> 本仓特例见 [`STRUCTURE.md`](STRUCTURE.md)。公开面 = **策略 A（Lite 引流）**。  
> 双产物版本：根 `VERSION` = `edition/VERSION`（`release.sh --check`）。  
> 按次产物：`services/terminal-402/dist/<version>/`（不与技能 `dist/` 混放）。  
> 最后更新：2026-11-19（T1-b）

## 一、三个产品

| # | 产品 | slug | 许可 |
|---|---|---|---|
| 1 | 免费版 | `hekouwang-terminal-lite-skill` | MIT |
| 2 | 专业版 | `hekouwang-terminal-skill` | Proprietary（overlay zip） |
| 3 | 按次生成 | `hekouwang-terminal-generate-paid` | Proprietary（独立版本线） |

## 二、版本线

| 线 | 真源 | 渠道 |
|---|---|---|
| 技能双产物 | 根 / `edition/VERSION` | ClawHub、GitHub Pages、SkillPay |
| 按次 | `services/terminal-402/` | SkillHub |

## 三、渠道矩阵

| 渠道 | 产品 | 包 / 源 |
|---|---|---|
| SkillPay | 专业版 | `edition/` → `./scripts/release.sh --pack` → `dist/<version>/…-paid.zip` |
| ClawHub | 免费版 | `pack-skill-zip.sh` + `.clawhubignore` |
| SkillHub | 按次 | `services/terminal-402/client/` |
| GitHub / Pages | 免费版 | **主仓 `main`**；Pages = **`docs/`**；日常 `git push origin` |

## 四、现况（T1-b 后）

| 项 | 状态 |
|---|---|
| 主仓 | Lite；干净单根历史 |
| Pro | `edition/` |
| 公开推送 | **直接推主仓**；`public/` worktree 已拆除 |
| 脏史备份 | `paid` 上 `backup/pre-t1b-20261119` |
| 成熟度 | L2+（冲 L3 运营面） |

## 五、`dist/<version>/`

只保留当前版 zip；不强制 SHA256SUMS。`materials/` / listing 不得进包。

## 六、发版摘要

1. 同步根与 `edition` 版本号；`--check`。  
2. Pro：改 listing → `--pack`。  
3. Lite/ClawHub：`pack-skill-zip.sh`。  
4. 公开 Git：`git push origin`（主仓）。  
5. 本机调 Pro：`dev-overlay-from-edition.sh`（勿提交叠回文件）。  
