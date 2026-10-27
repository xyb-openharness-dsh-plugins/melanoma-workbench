# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

## 0.3.4 — 2026-10-27（开发版补上疾病概要：用户装到的版本也有「?」）

- 缺口：0.3.3 只把 primer 三件套放在 `prototypes/`，`public/` 没有引用 → 本机原型能用、装机后没有这个功能。
- 新增 `scripts/sync-public.mjs`：把 `primer.js` / `primer.css` / `primer-data.js` 从原型整文件复制到
  `public/`（其它两件是定点替换副本，由 ui-parity 逐字符兜住，不整文件覆盖）；`--check` 模式校验
  字节一致 + `index.html` 引用 + 加载顺序，并接进 `npm run check`。
- `public/index.html` 引入三个 primer 资源（样式在 shell.css 之后；数据先于模块、模块先于 app.js）。
- `public/app.js` 补 `hashchange → render({keepScroll})`，否则关闭概要时重渲染把滚动位置冲回页首。
- 顺手修 `scripts/dev-server.mjs` 启动摘要对 `p.trials` 取值崩溃（空工作台必崩，`npm start` 起不来）。
- 验证：dev UI（`/api/mel/ui/index.html`，真实 DSH server）probe 9/9；原型 9/9；`npm run check` 退出 0。
- 未完成：装机 tgz 安装与真机抽查（需宿主）。

## 0.3.3 — 2026-10-27（36 号 v2 补齐：指南可点 + 状态卡）

- 模式层：`prototypes/v0.2/primer.js` / `primer.css` 覆盖为 starter 2026-10-27 版。
  原件列与来源行支持 `{ text, url }` 与 `url` / `secondaryUrl`，缺链接时渲染红色 §2.5 标记；其余行为不变。
- 数据（§2.5）：`primer-data.js` 20 处链接断言全部补齐——sources 14 处（`original:true` 带 `url`、
  `original:false` 带 `secondaryUrl`）+ 指南表「原件」列 6 行改为对象。8 条独立 URL 逐条真浏览器验活 OK：
  卫健委通知页（附件 15 为 2022 版指南 PDF）、NCCN 患者版 Melanoma 详情页、NCCN 皮肤型指南元信息页、
  CSCO 2025 人卫商城书目页、ASCO 2021 irAE 指南机构库全文、AJCC 第 8 版 ACS 书目页、
  中国医药信息查询平台曲美替尼片 / 纳武利尤单抗条目。
- 未取得项（如实标注，未编 URL）：趋势段「本项目登记快照」为本机 `research/melanoma-cancer/manifest.json`，
  无公开 URL → `nolink:true` + note；其余「未取得原件」行均给可点二次来源。
- 状态卡（§2.6）：看板首卡改为四件结构——eyebrow `D+N 状态卡 · 距皮肤线复查`、大字天数
  `第 242 天`（由手术日 2026-02-24 = Day 0 与演示「今天」派生，不手填）、现状行（分期原文 + 辅助免疫治疗状态 +
  `下次：2026-10-30（系统治疗预约）`）、出口按钮排（主：看系统治疗周期 →；副：疾病概要：皮肤黑色素瘤是什么？）。
  无锚点时整卡 `待初始化` 并指向「分期与分子」补手术日期。
- 检查链：新增 `scripts/check-primer-links.mjs` 并接在 `npm run check` 末尾（L1–L6 断言）。
- 验证：`probe-disease-primer.mjs` 9/9 PASS（端口 8126）；链接断言 20/20；`npm run check` 退出 0。
- 未完成：装机副本刷新与真机抽查（需宿主）。

## 0.3.0 — 2026-10-25（M5 开发版）

- dsh 11 件：API_PREFIX='mel'、DB_FILE='xyb-mel.sqlite'，执行 schema/0001（30 表）；demo 单事务幂等；
  readmodels 与 prototypes/v0.2/demo-data.js 逐字段 parity。
- 真客户端链路：src/client.js（cervical 底本换 小痣宝 MolePal/mel）→ lib/client.js；保留 mel:agent-draft 草稿桥。
- public/ 四件：原型定点替换五处（bootstrap / AI 五态 / 宽度记忆 / 版本 / 异步启动）；
  aiPromptWithCtx 与 postMessage 保留；apiBase 守卫只禁交界 /api/api，失败渲染横幅不裸 throw。
- MinerU 六部件：melparse 增加 Breslow / LDH / BRAF 词表与 BRAF-like、LDH- 排除。
- scripts/ 检查链 + test/ 五类单测（store/server/client/ui-parity/parse）。

## 0.2.0 — 2026-10-24（M2 原型）

- 原型四件套、双档案演示数据、INTERACTION-DESIGN v1.1、HVT X1–X4 自验。

## 0.1.0 — 2026-10-24

- 由社区脚手架 dsh-wb-cli@1.5.0 (900a613) 初始化，仅有注册骨架与健康接口，无业务功能。
