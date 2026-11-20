# services/ — 服务端

每个服务一个子目录，**独立私有 git 仓库**；父仓 `.gitignore` 忽略 `services/*/`（仅跟踪本 README）。

## 现状（3.0 / E3）

| 目录 | 用途 | 状态 |
|---|---|---|
| `terminal-402/` | 腾讯 SkillHub 按次：主题生成 / 光学处方，¥2.99/次 | **客户端 0.1.0 已审核通过并上线**；商品页 https://skillhub.cn/skills/indiv-huiyonghkw/hekouwang-terminal-generate-paid ；本地仍可 MOCK |

借鉴写作技能 `hekouwang-writer-skill/services/skillhub-402/` 的 402 契约；业务 handler 为终端生成/处方，不是 `doc_lint`。

本地说明、环境变量、契约测试：见 [`terminal-402/README.md`](terminal-402/README.md)（在独立仓工作树内打开）。

## 约定

- 源代码不进 Skill 包、不进免费 Lite
- 密钥只在服务端环境变量 / 挂载文件，**不进 git 明文**
- 推自己的私有远程，与主仓库无关
- 不套用专业版 / 免费版命名；服务有自己的 slug 与版本线
