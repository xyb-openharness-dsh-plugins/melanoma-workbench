# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

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
