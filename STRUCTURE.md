# 目录结构（本仓库特例）

> 组织标准：见 `~/.user-agents/standards/hekouwang-skill-structure.md`  
> 本文件只写本仓特例与成熟度档位。  
> 渠道 × 版本口径见 [`RELEASE.md`](RELEASE.md)。  
> 更新：2026-11-19（T1：主仓 Lite + `edition/` Pro 增量；推送仍过渡）

一个 Skill 仓库只做三件事：放源码与站点、挂载独立仓库、隔离不可公开物。

---

## 成熟度（诚实标注）

| 档 | 本仓状态 |
|---|---|
| **现况** | **L2（内容面）**：主仓 = Lite；Pro 实现在 `edition/`；白名单 `--pack` 从 edition 收集；`RELEASE.md` / `.clawhubignore` / `dist/<version>/` 已齐 |
| **相对组织标准仍缺** | **git 历史未清洁**（含 IP / 家目录提交）→ 不能把 `main` 直接推公开 `origin`；公开推送仍经 `public/` 孤儿旁路 |
| **目标** | **T1-b**：历史清洁或新公开仓单提交后，拆除 `public/` 依赖，日常 `git push origin` 推主仓；Pages 继续公开仓 `docs/` |

**T1 已做**：Pro→`edition/`、主仓 Lite 化、`--pack` 真源 = edition、不降权拆 ClawHub。  
**T1 不做 / T1-b**：rewrite 历史、拆 `public/`、改 `remote.origin.push`。

---

## 一、专业版与免费版命名

| 版本 | 命名 | 交付 |
|---|---|---|
| 专业版 | `hekouwang-terminal-skill` | overlay zip / SkillPay（解压进 Lite） |
| 免费开源版 | `hekouwang-terminal-lite-skill` | GitHub + Pages + ClawHub |

规则：`-skill` 属专业版；免费版插入 `lite`；两版同号（根 `VERSION` = `edition/VERSION`）；按次/402 独立版本线。

| 文件 | 角色 |
|---|---|
| 根 `SKILL.md` / `SKILL.lite.md` | **Lite** 入口（同内容双文件，防漂移；导出用 lite） |
| `edition/SKILL.md` + `SKILL.paid-section.md` | **Pro** 协议；`--pack` 拼接进 zip 内 `SKILL.md` |

---

## 二、当前结构

```text
hekouwang-terminal-skill/          # 主仓 = Lite 源码（可公开内容；历史未清）
├── SKILL.md · SKILL.lite.md       Lite Agent 协议
├── scripts/ · config/ · lib/      运行时（Lite 能力）
├── references/ · tests/           Lite 参考与测试
├── docs/                          站点源（公开仓 Pages 吃导出树里的 docs/）
├── materials/                     货架物料（可进 git；不得进安装包）
├── listing-skillpay.md            SkillPay 文案（不得进安装包）
├── RELEASE.md · STRUCTURE.md · .clawhubignore
├── VERSION                        与 edition/VERSION 同号
├── edition/                       【独立本地仓】Pro 增量（相对路径 = 安装路径）
├── plans/                         升级规划与 evidence
├── services/terminal-402/         按次服务（独立版本线）
├── public/                        【过渡】lite 孤儿 worktree → 推 origin/main
├── archive/                       不版控
└── dist/<version>/                不版控；当前版 zip
```

```text
专业版 overlay zip  =  edition/（白名单）
免费版 / 公开面     =  主仓 Lite（经 --lite → public/ 推送，直至 T1-b）
```

---

## 三、归属（三类角色）

| 类 | 目录 | 说明 |
|---|---|---|
| 主仓库 | Lite 源码 + `docs/` + `materials/` | 进 Lite 包 / 公开导出树 |
| `edition/` / `plans/` | 本地仓，无公开远程 | Pro 增量 / 作战地图 |
| `services/<name>/` | 私有仓 | 独立部署与版本线 |

判定：进安装包？→ 主仓（Pro → `edition/`）。站点？→ **`docs/`**。不能公开？→ `edition/` 或 `plans/`。独立生命周期？→ `services/`。

固定 ignore：`edition/`、`plans/`、`dist/`、过渡期 `public/`。  
`.gitignore` 另含 **T1 overlay** 段：本机 `./scripts/dev-overlay-from-edition.sh` 叠回的 Pro 路径勿提交。

---

## 四、`public/`：过渡发布手段（T1-b 前保留）

主仓**工作区内容**已是 Lite，但 **git 历史**仍含专业版件与敏感路径。在历史清洁前：

- 仍用 `--lite` 导出干净树 → 同步 `public/`（孤儿 `lite`）→ `git push origin HEAD:main`
- **禁止** `git push origin main`（会把历史一并公开）
- **废止条件（T1-b）**：历史清洁或新公开仓仅含干净提交；然后拆除对 `public/` 的日常依赖

---

## 五、推送边界

- `origin` = 公开 Lite 仓（现况经 `public/` / `lite` 推送）
- `paid` = 可选私有远程（历史兼容）
- `services/<name>/` 只推自己的私有远程
- 禁止给 `edition/`、`plans/` 加公开远程

---

## 六、导出、打包与 `dist/`

| 命令 | 作用 |
|---|---|
| `./scripts/release.sh --lite <目录>` | 导出 Lite（主仓已 Lite；剔 `INTERNAL_PATHS` / 仓务文件） |
| `./scripts/release.sh --pack [zip]` | 从 **edition/** 白名单打 Pro overlay；默认 `dist/<version>/…-paid.zip` |
| `./scripts/pack-skill-zip.sh …` | ClawHub 瘦身包（双挡 materials/listing） |
| `./scripts/dev-overlay-from-edition.sh` | 本机把 edition 叠回工作区（调试 Pro；勿提交） |
| `./scripts/release.sh --check` | 自检（历史泄漏仍可能黄字，属 T1-b） |

产物：根 **`dist/<version>/`**，只留当前版 zip。按次产物在 `services/terminal-402/dist/`。

---

## 七、待办

- [x] T0：RELEASE / clawhubignore / STRUCTURE 对齐 / 清杂物  
- [x] T1：Pro → `edition/`；主仓 Lite；白名单 `--pack`  
- [ ] T1-b：历史清洁；拆除 `public/`；主仓可直接推 `origin`  
- [ ] `examples/`：有素材后再建  

---

## 八、禁止

- 免费版与专业版同名  
- 给 `edition/`、`plans/` 加公开远程  
- 在历史未清洁时把 `main` 推到公开 `origin`  
- 把「必选 `public/`」写回组织标准或新 Skill 脚手架  
- 把 `materials/` / listing / 订单证据打进 Skill 或 ClawHub 包  
- 把 overlay 叠回的 Pro 路径提交进主仓  
- 按次 client 冒充专业版全集  
