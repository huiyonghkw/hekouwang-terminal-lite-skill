# 渠道与版本矩阵

> 组织标准：`~/.user-agents/standards/hekouwang-skill-structure.md`  
> 付费化：`~/.user-agents/standards/hekouwang-skill-monetize.md` · playbook：`…/hekouwang-skill-monetize-playbook.md`  
> 本仓特例见 [`STRUCTURE.md`](STRUCTURE.md)。公开面 = **策略 A（Lite 引流）**。  
> 双产物版本：根 `VERSION` = `edition/VERSION`（`release.sh --check`）。  
> 按次产物：`services/terminal-402/dist/<version>/`（不与技能 `dist/` 混放）。  
> 最后更新：2026-11-20（SkillHub 0.1.0 过审上线）

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

| 渠道 | 产品 | 包 / 源 | 价格 | 线上状态 |
|---|---|---|---|---|
| SkillPay | 专业版 | `edition/` → `./scripts/release.sh --pack` → `dist/<version>/…-paid.zip` | ¥14.9 / 季度，不自动续费 | 以支付宝商品页为准 |
| ClawHub | 免费版 | `pack-skill-zip.sh` + `.clawhubignore` | 免费，MIT | 以 ClawHub 页面为准 |
| SkillHub | 按次 | `services/terminal-402/client/` | ¥2.99 / 次 | **0.1.0 已审核通过并上线**；详情页 https://skillhub.cn/skills/indiv-huiyonghkw/hekouwang-terminal-generate-paid |
| GitHub / Pages | 免费版 | **主仓 `main`**；Pages = **`docs/`**；日常 `git push origin` | 免费 | 以 Pages 为准 |

**专业版不在 ClawHub。免费版不在支付宝。SkillHub 上的不是专业版完整脚本包。**

## 四、现况（SkillHub 0.1.0 后）

| 项 | 状态 |
|---|---|
| 主仓 | Lite；干净单根历史 |
| Pro | `edition/` |
| 公开推送 | **直接推主仓**；`public/` worktree 已拆除 |
| 脏史备份 | `paid` 上 `backup/pre-t1b-20261119` |
| SkillHub | 按次客户端 **0.1.0** 已过审上线；官网 CTA 直连商品页 |
| 成熟度 | L2+（冲 L3 运营面） |

## 五、`dist/<version>/`

只保留当前版 zip；不强制 SHA256SUMS。`materials/` / listing 不得进包。

## 六、发版摘要

1. 同步根与 `edition` 版本号；`--check`。  
2. Pro：改 listing → `--pack`。  
3. Lite/ClawHub：`pack-skill-zip.sh`。  
4. 公开 Git：`git push origin`（主仓）。  
5. 本机调 Pro：`dev-overlay-from-edition.sh`（勿提交叠回文件）。  
6. 按次：只改 `services/terminal-402/client/`，版本线独立；上架后回填 `lib/links.sh` 的 `HKW_URL_SKILLHUB` 与官网 CTA。

## 七、SkillHub 0.1.0 上线（2026-11-20）

| 项 | 状态 |
|---|---|
| 按次生成客户端 | 0.1.0 已审核通过并上线 |
| 商品页 | https://skillhub.cn/skills/indiv-huiyonghkw/hekouwang-terminal-generate-paid ，标题「会勇禾口王 · 终端生成（按次）」，标 v0.1.0 |
| 包路径 | `services/terminal-402/client/`（上架 zip 在 `services/terminal-402/dist/0.1.0/`） |
| 官网 / 链接真源 | `lib/links.sh` → `HKW_URL_SKILLHUB`；`docs/pricing.html` / `docs/index.html` 已切深链 |

本变更只更新渠道口径与官网购买入口；免费版 / 专业版版本号不变（仍为根 `VERSION` 3.0.6）。
