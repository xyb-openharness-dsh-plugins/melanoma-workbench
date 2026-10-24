# 开发强约束（DEV-REQUIREMENTS）· 2026-10-25 · 皮肤黑色素瘤（MEL）

> 体例照 CANCER-KICKOFF v2.0 + ZERO-TO-DEV v1.2+（七步）。**直接原创 MEL 专属版，不从其他病种 fork 复制**（三次 fork 残留教训：DEV-REQUIREMENTS/样式/文档示例词）。
> 家族通用层全款继承（数据层 D1–D10 / 前端 F1–F4 / 工程 E1–E4 / 宿主接线 H1–H4 / apiBase 定稿契约 / MinerU 18 号 v2 / 窄宽 30 号 / 交互路径 28 号）。

## 一、范围
R1 dsh 七件套 + 真客户端链路（cervical 底本）；R2 schema 冻结（判读列断言）；R3 2026 试验库四件套；R4 原型 + INTERACTION-DESIGN（IP1）；R5 文档体系 9 件；R6 HVT X1–X4 + 窄宽 + computed fill 断言。

## 二、样板
移植样板 cervical 0.1.1；基准 breast 0.12.0。品牌三变量：**组织色 墨绿 `#2E6B4F`（皮肤/痣的沉静意象）**/行动色家族橙/分区 暖砂灰；品牌「小痣宝 MolePal」占位。

## 三、本癌种专属（K1–K6；与里程碑 M0–M7 解耦编号）
| # | 约束 | 验证 |
| --- | --- | --- |
| K1 | **自查档案禁诊断性措辞**（不写"良性/恶性/不像/观察即可"）；ABCDE 只做名词解释 | 词表测试 + 评审 |
| K2 | 皮损照片/记录按**部位+时间**双视图，变化只并列不判读 | 读模型断言 |
| K3 | 分期（AJCC 8）与前哨淋巴结**只引用原文**（三态：未做/结果原文/未记录） | 契约断言 |
| K4 | 分子三态（BRAF/NRAS/TERT，未检测≠阴性） | 三态冻结 |
| K5 | **IO 不良反应轨道**（皮疹/腹泻/肝炎/甲状腺炎）独立，不与皮损档案混；"皮疹是药还是病"问题清单不归因 | 独立轨道 + 词表 |
| K6 | 双轨随访（皮肤线/影像线）各自节奏并列；防晒防护只做事实提醒不做命令式 | 双轨断言 + 词表 |

## 四、本轮未做
装机（M6）；市场投稿；真实病例；离线试验语料；葡萄膜黑色素瘤（#43 属 T2，另案）。

## 五、默认值（G1 可改）
双主体 / 全病程 / MinerU 接入 / 品牌小痣宝 / 样板 cervical+breast / 模型路由 GLM-5.3+Flash。

## 六、宿主接线四要素与 apiBase 定稿契约（M5 继承，逐条可验）

| # | 要素 | 落点 | 怎么验 |
| --- | --- | --- | --- |
| H1 | `package.json` 的 `dsh` 块（bundle.patch + client.platform/inject）与 `repository` | `package.json` | `check-pack.mjs` 的 H1 断言 |
| H2 | `cordis.patch.yml` insert 条目带 `config.root: !!js dshHomePath('melanoma-workbench')` | `cordis.patch.yml` | `check-pack.mjs` 的 H2 断言 |
| H3 | 真客户端链路 `src/client.js → build-client.mjs → lib/client.js`，占位=0 | `src/` `lib/` | `build-client --check` + tgz 面占位扫描 |
| H4 | 版本簿记：`VERSION` 唯一来源，`public/` 降级值与测试断言都引用生成物 | `VERSION` `lib/version.js` | `check-version.mjs` 十处同源 |

**apiBase 定稿契约（v0.1.3）**：`API_BASE = 挂载前缀`（独立启动空串，宿主 `/api/<slug>`）；页面统一拼
`${API_BASE}/api/mel/xxx`。守卫只禁**交界重复** `/(^|/)api$/`，不许 `includes('/api')` 一刀切。
双形态回归测试见 `test/client.test.mjs`；启动期校验失败渲染错误横幅，**禁止裸 throw 白屏**。

**M5 修复/交付状态（2026-10-25）**：check 全绿；无头 64 页签×2 档案；HVT X1–X4 全过；
`probe:resp` 8 档宽度 0 问题；一图秀 computed fill=`none`；装机面预检 tgz 占位=0、探针 45/45。
