# 发布与回滚记录

版本/tag/commit：... 变更的功能 ID：... 用户授权范围：...
家族一致性：`npm run audit` 结果（xx/xx 通过 · N fail · M warn）；存在 fail 不得发布，warn 逐条给结论：...
源码检查：... 包检查/大小/hash：... 实机证据：...
README/许可证/素材来源/运行依赖/更新说明：...
演示数据清单已清理或明确示例环境：...
数据库迁移与旧包兼容：... 可用备份：...
市场分发来源：npm / Release tarball / 默认分支源码 / 不投稿（选一并说明依据）：...

若任务要求本机更新：最终已安装版本/Profile/打开确认本次修改：...。若仅推送Git：明确此范围，不声称本机已更新。仅安装后仍旧版或异常时附源码→构建物→包→Profile→运行界面的诊断证据，不每次重复整链排查。

| 动作 | 目标 | 真实结果/URL/证据 | 状态 |
| --- | --- | --- | --- |
| 本地安装 | Desktop/profile | | 未执行 |
| Git push | 远端/分支/commit | | 未执行 |
| Release/npm | tag/产物/hash | | 未执行 |
| 市场 PR | 官方目录仓库 | | 未执行 |
| 上架 | 公开 catalog | | 未执行 |

市场状态说明：GitHub Release 不会自动成为市场安装来源。核对已有目录条目/开放PR；若未声明 tarball，市场按目录协议使用默认分支源码（或适用的npm来源）。普通代码版本升级不重复创建目录PR；切换安装来源或修改目录元数据时，在原条目PR中更新。市场PR提交、合并、目录可见、Desktop可安装分别记录，不混称“已上架”。

回滚步骤/数据兼容检查/已知限制：...

工作台市场发布另按 docs/10-MARKET-PUBLISHING.md 执行，附 templates/MARKET-ACCEPTANCE.md 的指定版本手工确认。官方指南复核日期/来源：... 最终安装来源：... 用户确认的项目与执行者：... PR URL/最新提交检查实际执行结果：... 市场目录可见与可安装证据：...。未授权投稿时标不适用，不把 Git push 当市场发布。

## 0.3.0 装机记录（M6 · 2026-10-25）

| 项 | 值 |
| --- | --- |
| tgz | `release/xyb-community-melanoma-workbench-0.3.0.tgz`（npm shasum 9e2843cf…） |
| 四要素（tgz 内容） | H1 dsh 块+repository ✅ / H2 config.root ✅ / H3 真客户端 488 行占位=0 ✅ / H4 版本同源 v0.3.0 ✅ |
| 安装 | `NODE_OPTIONS= corepack pnpm add -w --save-exact file:…0.3.0.tgz`（+1 包）；bundles 登记（33 项） |
| 五要素 | 装机副本 ver 0.3.0 / dsh 块 / file 依赖 / 占位=0 / `mel:agent-draft` 通道在册 ✅ |
| M5 交付 | check EXIT=0（27/27 单测 + audit 37/37）；HVT 30/30+26/26；computed fill=none；probe-install 45/45 |
| **V2/V3** | **未验证**——待用户重启 Desktop → 添加小痣宝 → **先新建会话**（第 6 类流程）→ 走核心流程（自查档案/肢端卡/IO/双轨/导出私密过滤/版本首屏） |
| 挂账 | `workspace.dataset_state` 存展示文案（事实逐表读取，schema 未改）；宿主 ensureSession 待装机验证；导入 UI 边界同前三仓 |
