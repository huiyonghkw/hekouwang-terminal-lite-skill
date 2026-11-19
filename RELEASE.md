# 渠道与版本矩阵

> 本文件是「哪个产品、哪个版本、发在哪个渠道」的唯一口径。发版前先看这里；`README.md`、`listing-skillpay.md` 与各渠道后台都以本表为准。
>
> 组织标准：`~/.user-agents/standards/hekouwang-skill-structure.md`  
> 本仓特例与成熟度见 [`STRUCTURE.md`](STRUCTURE.md)。
>
> 技能双产物版本：根 [`VERSION`](VERSION) = [`edition/VERSION`](edition/VERSION)（同号）。  
> 最后更新：2026-11-19（T1）

## 一、三个产品，不是三个版本

| # | 产品 | 包名 / slug | 许可 | 卖什么 | 不卖什么 |
|---|---|---|---|---|---|
| 1 | 免费版 | `hekouwang-terminal-lite-skill` | MIT | 安装 / 迁移 / 换肤 / 体检 / 卸载；3 套社区主题；iTerm2 工作台 | 多终端/生态同色、光学校准、场景、workspace/palette、品牌主题、跟随系统 |
| 2 | 专业版 | `hekouwang-terminal-skill` | Proprietary | 免费版全部 + 4 套品牌主题 + 多终端/生态 + 光学/场景/工作区/色板 + 跟随系统 | 不是按次服务；不通过 SkillHub 交付完整包 |
| 3 | 按次生成 | `hekouwang-terminal-generate-paid` | Proprietary | 远端主题片段 / 光学处方；¥2.99/次（SkillHub Pay Skill） | 不是专业版全集；不含 palettes 源码、密钥、后端 |

**一句话**：免费版和专业版是「终端工作台」的两个产物；按次生成是另一个独立客户端 + 服务。

## 二、三条版本线

| 版本线 | 版本 | 谁在用 | 规则 |
|---|---|---|---|
| 终端技能 · 免费版 | 见根 / `edition/VERSION` | ClawHub、GitHub、GitHub Pages | 与专业版同号 |
| 终端技能 · 专业版 | 见根 / `edition/VERSION` | 支付宝 SkillPay | 与免费版同号；包在 `dist/<version>/hekouwang-terminal-skill-<version>-paid.zip` |
| 按次生成 · 客户端/服务 | 见 `services/terminal-402/client/SKILL.md` | 腾讯 SkillHub Pay Skill | **独立版本线**；产物在 `services/terminal-402/dist/<version>/` |

## 三、渠道矩阵

| 渠道 | 上架产品 | 版本 | 包 / 源 | 价格 | 线上状态 |
|---|---|---|---|---|---|
| 支付宝 SkillPay | 专业版 | 见 `VERSION` | **`edition/` 白名单** → `./scripts/release.sh --pack` → `dist/<version>/…-paid.zip`；文案 `listing-skillpay.md`；图 `materials/` | 以商品页为准 | 以支付宝为准 |
| ClawHub | 免费版 | 见 `VERSION` | `scripts/pack-skill-zip.sh`；受 `.clawhubignore` 约束 | 免费 | 以 ClawHub 为准 |
| 腾讯 SkillHub | 按次 | 客户端独立线 | `services/terminal-402/client/` | ¥2.99 / 次 | 以 SkillHub 为准 |
| GitHub / GitHub Pages | 免费版 | 见 `VERSION` | **现况**：`--lite` → `public/` 孤儿树推公开仓；Pages = 公开仓 **`docs/`** | 免费 | 以公开仓为准 |

**专业版不在 ClawHub。免费版不在支付宝。SkillHub 上的不是专业版全集。**

## 四、现况 vs 目标态

| 项 | 现况（T1） | 目标态（T1-b / 组织标准） |
|---|---|---|
| 主仓内容 | **Lite** | 同左 |
| Pro 增量 | **`edition/`**（相对路径 = 安装路径） | 同左 |
| `--pack` | 从 **edition** 白名单打 overlay zip | 同左 |
| `public/` | **过渡**推送旁路（历史未清） | **拆除**；主仓可直接推 `origin` |
| GitHub Pages | 公开 Lite 仓 `docs/` | 同左（开发仓历史清洁后亦可） |
| 成熟度 | **L2（内容）** | L2 + 可安全推主仓 → 冲 L3 运营面 |

## 五、`dist/<version>/` 约定

```text
dist/
└── <version>/
    ├── hekouwang-terminal-lite-skill-<version>.zip   # 可选 / ClawHub
    └── hekouwang-terminal-skill-<version>-paid.zip   # SkillPay overlay
```

1. 只写根 **`dist/<version>/`**；不要用 `dist/release-*`。  
2. 只保留当前版一个目录。  
3. 默认只放 zip；不强制 SHA256SUMS。  
4. `materials/`、`listing-skillpay.md` 不得进任何 Skill/ClawHub 包。

## 六、命名对照

| 场景 | 用哪个名字 |
|---|---|
| 免费版包名、slug、公开仓 | `hekouwang-terminal-lite-skill` |
| 专业版包名、slug | `hekouwang-terminal-skill` |
| 按次客户端 slug | `hekouwang-terminal-generate-paid` |

## 七、发版规则（摘要）

1. 先看本表。  
2. 升级：同步根 `VERSION`、`SKILL.md` / `SKILL.lite.md`、`edition/VERSION`、`edition/SKILL.md`；跑 `./scripts/release.sh --check`。  
3. **专业版**：先改 `listing-skillpay.md`，再平台文案，再 `./scripts/release.sh --pack`（默认写入 `dist/<version>/`）。  
4. **免费版 / ClawHub**：`./scripts/pack-skill-zip.sh dist/<version>/hekouwang-terminal-lite-skill-<version>.zip`。  
5. **公开 Git（现况）**：`--lite` → `public/` → push；**不要** `git push origin main`。  
6. **本机调 Pro**：`./scripts/dev-overlay-from-edition.sh`（勿把叠回文件提交主仓）。  
7. 按次：只改 `services/terminal-402/`。  
8. 不覆盖已发布包：内容变化必须升号。
