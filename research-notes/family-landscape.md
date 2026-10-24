# 家族结构素材（family-landscape）· MEL DIFF-MATRIX 全量化与 M2 原型准备

日期：2026-10-24。状态：调研笔记，供 `docs/DIFF-MATRIX.md` §二全量行、§三自查与 M2 原型 PAGES/SUBPAGES 设计引用；**不是签认产物**。

素材边界（先读）：

- **移植样板 = `/Users/qinxiaoqiang/Downloads/cervical-workbench`**（VERSION 0.1.1）。实测：`prototypes/v0.2/` 四件套（index.html / style.css / demo-data.js / app.js），schema 两次迁移（0001 34 表、0002 1 表），`src/client.js` 482 行 → `scripts/build-client.mjs` 116 行 → `lib/client.js` 488 行。
- **成熟基准 = `/Users/qinxiaoqiang/Downloads/breast-cancer-workbench`**（VERSION 0.12.0）。实测 `prototypes/v0.3/app.js`：**8 个一级 / 27 个二级**，与 `docs/SPEC.md` §2/§3 一致。
- **MEL 本仓现状（关键）**：VERSION 0.1.0；`dsh/` 只有 25 行 `index.js`（仅一条 health 路由）；`lib/client.js` 是 **42 行占位骨架**；**无 `src/`、无 `schema/`、无 `prototypes/`、无 `demo/`、无 `test/`**；`scripts/` 只有 4 个（check-conformance / check-install / check-workbench-package / fetch-melanoma-trials-2026）。`package.json` 的 `files` 不含 public/schema/demo。`docs/22-PHASES-AND-GATES.md` 明确 audit 把 **DIFF-MATRIX 列为家族成员判据**，本仓尚无该文件——本篇是其输入。
- MEL 已读：`docs/SCENARIOS.md`（S01–S13）、`docs/PATIENT-FLOW.md`（三流）、`docs/DEV-REQUIREMENTS-2026-10-25.md`（M1–M6）、`docs/DEV-PLAN.md`（M0–M7）、`docs/BRIEF.md`、`docs/26-CANCER-FEATURE-LINES.md`、`27-TRACKS-AND-METRIC-CARDS.md`、`30-RESPONSIVE-RULES.md`、`research-notes/user-research.md`（A1–A11 / B1–B6 / C1–C8 / D1–D6 / E1–E7 / F1–F9 / H1–H10，57KB）。
- **证据纪律**：用户研究 **0 真实访谈**；F 层九组困惑句全部是"文献/论坛语境改写"，M1 访谈回填后需逐句留痕替换。本笔记引用的患者句子一律视为**设计假设语料**，不是一手原话。
- 格式参照 `/Users/qinxiaoqiang/Downloads/thyroid-workbench/research-notes/family-landscape.md`（七部分）；内容全部按 cervical + breast + MEL 语境重做。

---

## 一、cervical 一级/二级导航全集 + L1–L10 映射

实测口径（`prototypes/v0.2/app.js` L54–72 常量）：**12 个一级 / 38 个二级**。app.js 头注写"12 个一级页：SPEC §4 的 11 个 + 「资料库」（家族脚手架要求）"，但 PAGES 里该页实际命名为**病情整理**（不是"资料库"，资料库是它的第一个二级）。设置不占一级（弹窗）。

| 一级 | 二级页签全集（SUBPAGES） | 职责一句 | 关键组件/口径 |
| --- | --- | --- | --- |
| 看板 dashboard | —（0） | 分期、路径、长期影响与随访放在一起 | 定调条→「现在可以做」→**放疗长期影响状态卡**→随访卡→接下来/最近变化；任务卡跳 go-* |
| 病情整理 records | 资料库 / 整理草稿·核对 / 病情档案 / 指标检测 / 病情汇总（5） | 上传→解析→确认指标→入库；接受之前都只是候选 | DOCS/CANDS 双轨；候选 accept 前不进正式数据；L9 落点 |
| 我的分期 stage | 分期档案 / 病理与分子 / 会诊与二次意见（3） | FIGO 2018 只记录不自算 | `stage_rows` 版本链留旧分期；molecular 四态 ok/na/warn/pending |
| 治疗历程 treatment | 治疗路径 / 手术记录 / 放疗疗程 / 系统治疗（4） | 路径三选一（手术/根治性放化疗/系统治疗） | `pathway_rows` 改过留旧不覆盖；`rt_rows` EBRT 与后装分列、禁"总剂量"合成列 |
| 性与生育 fertility | 生育档案 / 生育保留记录 / 卵巢与月经 / 性健康（私密）（4） | 生育是记录不是承诺 | cervical 独有线；`sexual_rows`/`vagina_rows` `is_private` 默认 1（家族首个默认私密模块） |
| 放疗与长期影响 late | 放疗后事件 / 淋巴水肿 / 阴道与扩张 / 绝经与骨健康（4） | 放疗结束后的问题按时间记 | cervical 独有线；不给分级建议、不推产品 |
| 检查与指标 labs | 肿瘤标志物 / 细胞学与 HPV / 影像随访（3） | SCC-Ag 只对鳞癌有意义 | 口径 E：SCC-Ag 显示由 histology 决定（check 脚本比对）；细胞学只存原文 |
| 病情一图秀 timeline | 数值曲线 / 分类与事件 / 数据口径（3） | SCC-Ag、体重与阴道狭窄放回同一时间轴 | 数值线 + 分类节点不连线；`state.sel` 默认 2 数值 + 1 分类 |
| 营养支持 nutrition | 进食量记录 / 补充剂与医嘱（2） | 记"吃了多少"，不给食谱不给剂量 | 家族骨架 |
| 心理支持 mind | 当下感受 / 身体形象与亲密关系 / 母亲身份与家庭沟通（3） | 默认只属于你 | `viewpoints` 私密；换页即收回私密展开（`state.privateOpen`） |
| 复诊准备 review | 复诊节奏 / 三类随访节点 / 筛查与预防 / 就诊准备（4） | 该带什么该问什么提前写下 | 筛查与预防刻意降为子页防变科普页；导出 Markdown |
| 临床研究 trials | 2026 线索 / 已收藏 / 入组问题（3） | 线索不是推荐 | TRIALS 卡 + topic 筛选 |

合计校验：0+5+3+4+4+4+3+3+2+3+4+3 = **38**。

> **判据提醒**：cervical 的 12 一级 / 38 二级**双超** 26 号的 8–10 / 24–30 区间。它是"移植样板"（client 链路与口径底本），**不是结构基准**；MEL 不得按 12 条照搬，结构数量以 §六 的 10/30 为准。

**与 26 号 L1–L10 的映射（cervical 实排）**：

| 26 号线 | cervical 落点 | 备注 |
| --- | --- | --- |
| L1 看板 | 看板（0 二级） | 四点位；长期影响状态卡为特色位 |
| L2 疾病本体 | 我的分期（3 二级） | FIGO 是宫颈癌的"起点" |
| L3 治疗与决策 | 治疗历程（4 二级） | 路径三选一 + 后装是独有字段 |
| L4 指标分析 | 检查与指标（3）+ 病情整理·指标检测 | SCC-Ag 组织学条件显示 |
| L5 安全与症状 | 放疗与长期影响（4 二级） | 独立整线（专属） |
| L6 营养与体重 | 营养支持（2 二级） | 骨架 |
| L7 心理与家庭 | 心理支持（3）+ 性与生育·性健康（私密） | 母亲身份为专属子页 |
| L8 复诊与随访 | 复诊准备（4 二级） | 三类随访节点（细胞学+SCC-Ag+影像） |
| L9 资料与导出 | **病情整理（5 二级，独立一级）** + 就诊准备子页 | 家族脚手架要求 + cervical 特色 |
| L10 试验与线索 | 临床研究（3 二级） | 骨架 |
| 横切层 | 病情一图秀（3）+ 私密默认过滤 + 指南出处 | 一图秀带二级是 cervical 与 breast/GBM 的差别 |

cervical 对 MEL 最有用的三条结构先例：**①私密是数据结构属性而非界面开关**（`is_private` 缺省 1 + 三出口过滤）；**②不可相加的量分列存**（EBRT/后装，禁"总剂量"合成列）——直接对应 MEL 的皮肤线/影像线、IO 反应/皮损档案；**③指标按病理类型条件显示**（SCC-Ag 只对鳞癌）——对应 MEL 的"肢端亚型/IO 治疗状态决定显示哪些块"。

cervical 的 V1–V8 特有场景（`docs/SPEC.md` §5）全部是**确诊后**场景；没有一条覆盖"确诊前自查"。这是 MEL 必须新增结构位的原因，见 §六.5。

---

## 二、cervical schema 表分组与专属表清单

共 **35 张表**：`0001_initial.sql` 34 张（grep 实数）/ 224 列（`freeze-contract.md` 实测）+ `0002_profile_meta.sql` 1 张。`schema/freeze-contract.md` 记 sha256，`scripts/check-schema.mjs` 拦改旧迁移；加结构只能新增迁移。

按 freeze-contract 的权威分组（四组，34 = 2+3+8+21）：

| 组 | 表 | 职责一句话 |
| --- | --- | --- |
| 档案级（2） | `subjects` | 患者档案：headline/stage/mindset 三个"一眼看到"标量 + histology（决定 SCC-Ag 显示）+ hpv_status + dash_keys/path（JSON 数组） |
| | `section_titles` | 分节标题表化（profile_key + key → title + ord）——"加一节只加一行"，替代 subjects 上一排 `*_title` 列 |
| 指标（3，通用） | `metrics` | kind: numeric/grade/qual；分类指标 unit 必须 NULL、dec NULL |
| | `metric_points` | v_num 可空 + v_text 保分类原值 + src 来源 |
| | `molecular` | 分子四态 state：ok 已检测 / na 未检测 / warn 需关注 / pending 待出（**未检测≠阴性**）；宫颈词表 = PD-L1 CPS、p16、MMR、HER2（腺癌） |
| 通用（8） | `events` / `rhythm` / `cycles` / `treatment_lines` / `viewpoints` / `trials` / `documents` / `candidate_fields` | 一图秀事件、随访节奏、周期、治疗线容器、看法（恒不是结论，无 `is_conclusion`）、试验收藏、人工归档、解析候选 |
| 宫颈专属（21） | `stage_rows` / `pathology_rows` / `pathway_rows` / `surgery_rows` / `rt_rows` | FIGO（IIIC r/p，TEXT 原样抄）、病理（kind=row/gap）、路径版本链、手术范围、EBRT+后装分列 |
| | `late_effect_rows` / `lymphedema_rows` / `vagina_rows` / `menopause_rows` / `hormone_rows` | 放疗长期影响五件套：肠膀胱事件、淋巴水肿、阴道狭窄与扩张（`is_private` 默认 1）、绝经症状、激素替代医嘱留痕 |
| | `fertility_rows` / `fert_surgery_rows` / `ovary_rows` / `sexual_rows` | 生育档案、生育保留手术（含随访要求原文位）、卵巢功能、性健康（`is_private` 默认 1） |
| | `cytology_rows` / `hpv_rows` / `imaging_rows` / `screening_rows` | 细胞学与 HPV **只存 result_text 原文**（无正常/异常枚举列）、影像、筛查史 |
| | `nutrition_rows` / `supplement_rows` / `demo_meta` | 进食量、补充剂与医嘱、演示元数据（这三张被 freeze-contract 计入"专属 21"，语义上后两张是通用尾段） |
| 迁移件（0002） | `profile_meta` | 档案级零散标量（profile_key, k, v）：加字段 = 加一行，不再 ALTER 补列 |

**cervical 五条独有口径（写死在 0001 头注释，读模型与前端都按此执行）**：

- **A** FIGO 只记录不自算（不设 TNM→FIGO 推导列或触发器，IIIC 细分 TEXT 原样抄）；
- **B** EBRT 与后装分列、禁"总剂量"合成列（剂量学不可相加）；
- **C** 细胞学/HPV 只存原文（无正常/异常枚举列，防界面重判读）；
- **D** 性与生育默认私密（`sexual_rows`/`vagina_rows` 缺省 1，读模型默认过滤，导出层不得包含）；
- **E** SCC-Ag 只属鳞癌（数据层不拦，check 脚本比对 `metrics.key` 与 `histology`）。

**家族四契约**（同段）：看法恒不是结论；四点位 NULL≠0（cervical 不做四点位，留白不建表）；更正只新增版本；事实四层不合并（文档/候选/记录/指标分表）。

对 MEL 的直接映射：A→**AJCC 8 与 Breslow/溃疡/核分裂只抄原文，不设 T 分期推导**；B→**皮肤线/影像线分列 + IO 反应/皮损档案分表，禁"总复查"合成节点**；C→**病理与影像只存原文 + 数值带单位**（Breslow 例外：可存 `thickness_mm` 数值，但必须同存 `result_text`，且不得由它推导 T）；D→**皮损照片（含足底/甲下/私密部位）默认仅患者可见，逐张授权**；E→**MEL 没有 SCC-Ag 式条件指标**，条件显示改为"肢端亚型/治疗状态驱动"（如无 IO 治疗史则不显示 irAE 轨道）。

---

## 三、cervical 客户端链路结构（M5 移植底本）

链路：**`src/client.js`（482 行，手写唯一源）→ `scripts/build-client.mjs`（116 行，零依赖字符串替换）→ `lib/client.js`（488 行，生成物勿手改，`--check` 兜同步）**。MEL 现在的 `lib/client.js` 正是 `docs/LESSONS.md` §"踩 3 · 占位客户端上线"描述的 42 行占位骨架——**这是 M5 第一优先修复项**。

`src/client.js` 九段结构（customFrame 外壳，移植整段保留、只换品牌）：

1. **装载壳**：`window.__ModuleLoader__.load({ id: '__PKG_NAME__', factory(require) })`；无 loader 静默退出。
2. **常量段**：TITLE / PANEL_TITLE / SUBTITLE / DESCRIPTION + 注入的面板参数（BUSINESS_SIDE/WIDTH、CUSTOM_FRAME、AGENT_DEFAULT/MIN/MAX/STEP、NARROW_BELOW、DRAWER_MAX）。
3. **宽度记忆**：clampWidth/snapWidth（对齐 ratioStep 0.02，避免 33.7%）、loadWidth/saveWidth → localStorage。
4. **样式段**：全部内联 style 对象（root/header/brand/ver/hint/pane/splitter/focus/fallback/button/ghost/pad/drawer），主色 `#18AFA5` 配中性冷灰。
5. **会话判定**：currentSession / ownsSession / ownedSession（官方 dsh-site-selection 同款，含 snapshot 兜底）。
6. **原生草稿桥**：fillDraft 只填入不发送（校验 ownedSession、occurrences/phase 防引用冲突）；pendingDraft 队列存 DRAFT_QUEUE_KEY，Panel 内 500ms 轮询 flushDraft，composer 未就绪留队重试。
7. **onboardingPrompt**：5 行开场白（本机资料整理、不提供诊疗建议、分工声明、"看法不是医生结论"）。
8. **Panel 组件**：`<header>` 顶栏（首个子元素，`--dsh-frame-leading-clearance` 避让 macOS 窗口按钮；品牌+版本 chip+提示+「AI 对话/收起」按钮）→ iframe 业务区（8s broken 兜底可重试）→ `<aside>` 原生会话**始终挂载**只 display 显隐 → splitter（鼠标拖 + 键盘 ←/→/Home/End，25%–45%，`role=separator` + aria-valuenow）→ 窄屏（**容器宽** ResizeObserver <760px，非 window.innerWidth）转覆盖抽屉 → postMessage `cervi:agent-draft`（校验 `event.source===iframe.contentWindow` + 同源，截 8000 字）。
9. **apply/register**：title/panelTitle/icon 🪷/repository/audience/requirements/initialization:'empty'/embedded:true/version/layout{businessSide,businessWidth}/customFrame；`inject: ['desktopWorkbenches','sessions']`。

**14 个构建注入 token（`build-client.mjs` 替换表的全部键，MEL 逐项换源头）**：

| token | cervical 现值 | MEL 应取 | 来源 |
| --- | --- | --- | --- |
| `__PKG_NAME__` | @xyb-community/cervical-workbench | @xyb-community/melanoma-workbench（已定） | package.json name |
| `__REPOSITORY__` | github.com/xyb-openharness-dsh-plugins/cervical-workbench | melanoma 同 owner/repo（强校验 `https://github.com/owner/repo`） | package.json repository |
| `__API_PREFIX__` / `__UI_ENTRY__` | /api/cervical、/api/cervical/ui | /api/melanoma（**需与现有 `/api/melanoma-workbench/health` 统一，见 §七**） | dsh/routes.js |
| `__VERSION__` | 0.1.1 | 按 MEL 版本簿记 | lib/version.js（← VERSION） |
| `__BUSINESS_SIDE__` / `__BUSINESS_WIDTH__` / `__CUSTOM_FRAME__` | left / 0.65 / true | 同值（0.65 的两条理由在 layout.js 注释） | lib/layout.js PANEL |
| `__AGENT_DEFAULT__/MIN/MAX/STEP/NARROW_BELOW/DRAWER_MAX__` | 0.35 / 0.25 / 0.45 / 0.02 / 760 / 420 | 同值（HOST_LIMITS 0.25–0.7，businessWidth 不得取 0.7） | lib/layout.js AGENT_PANE |

**8 处手写品牌点（构建 token 之外，必须逐处改）**：

| # | 项 | cervical 现值 | MEL 应取 |
| --- | --- | --- | --- |
| 1 | TITLE | 小莲宝 CerviPal | 小痣宝 MolePal（占位，G1 可改） |
| 2 | PANEL_TITLE | 小莲宝宫颈癌工作台 | 小痣宝皮肤黑色素瘤工作台 |
| 3 | SUBTITLE | 本机数据 · 记录不是诊断 | 同句式（本机数据 · 记录不是诊断） |
| 4 | DESCRIPTION | "……FIGO 分期、治疗与随访记录……" | 自查皮损、病理与分子、双轨随访、IO 反应记录 |
| 5 | WIDTH_KEY | cervip.pal.cervical.agent-pane.v1 | melap.pal.melanoma.agent-pane.v1 类 |
| 6 | DRAFT_QUEUE_KEY | cervip.pal.cervical.initial-drafts.v1 | melap.pal.melanoma.initial-drafts.v1 类 |
| 7 | 消息类型 | `cervi:agent-draft` | `mela:agent-draft`（业务侧 postMessage 两端同改） |
| 8 | icon + 色板 | 🪷；#18AFA5 / #28605c / #f2f8f7 / #f5faf9 / #e2efec / #158f87 / #7d9490 / #c4e2dd | icon 候选 🟤（G1 定）；主色 **#2E6B4F 墨绿**、深 #1F4C38、底 #F5F8F6、边 #DCE7DF、提示行动橙 #B95023、版本字 #7A8B82、splitter 焦点 #A9C9B7 |

另需整段重写、但不属于"品牌变量"的文案：register 的 `audience`/`requirements`/`author`、`onboardingPrompt` 5 行、Fallback 文案、顶栏 hint。cervical 的 `requirements` 是"本机数据整理；不做诊断与处置建议，判断由用户与治疗团队做出"——MEL 需加一句"自查记录不判良恶性，ABCDE 只做名词解释"。

`scripts/build-client.mjs` 本身**零癌种内容**，可直接复用；它替换完还回扫 `__[A-Z_]+__` 残留（静默 undefined 防线）+ 强校验 canonicalRepository。`lib/layout.js` 的 PANEL / AGENT_PANE / HOST_LIMITS 结构与注释（customFrame 判定依据、0.65 的两条理由）也是移植底本。

---

## 四、breast 基准 L1–L10 做法摘要（小粉宝 0.12.0：8 一级 / 27 二级）

一级全集（`prototypes/v0.3/app.js` 实测）：**看板 / 病情整理 / 病情一图秀 / 临床 / 营养支持 / 心理支持 / 全程与康复 / 收藏与回顾**。二级合计：5+6+3+4+6+3 = **27**。

| # | 线 | breast 基准做法 | 出处 |
| --- | --- | --- | --- |
| L1 | 看板 | 单页：当前阶段（**用户选**）、一件事、上肢差值提醒、最近变化、安排、问题入口；不做自动判定阶段 | SPEC §2 |
| L2 | 疾病本体 | 病情整理·病情档案：病理转录、标本、指标序列；报告原文可回溯，自动判读不做 | SPEC §2/§3 |
| L3 | 治疗与决策 | 临床·治疗历程（计划 vs 实际、方案与药物）+ 全程与康复"术后恢复三阶段"话题（D15 定名"术后上肢"） | SPEC §2/§3 |
| L4 | 指标分析 | 病情整理·指标检测：分组卡 + CTCAE 分级徽章 + 背面区间 + needsUln（×ULN 型需化验单参考上限） | 26 §3.1、23 号 |
| L5 | 安全与症状 | 全程与康复·上肢与淋巴水肿独立主题；四点位测量与差值（缺健侧不生成差值）；症状强度记录 | SPEC §2/§3 |
| L6 | 营养与体重 | 独立一级 3 二级：当下困扰 / 进食与体重 / 建议与回顾；体重进指标，只做趋势无 CTCAE 界限 | SPEC §2、23 §8 |
| L7 | 心理与家庭 | 独立一级 4 二级：当下感受 / 我的记录 / 支持资源 / 身体与亲密；**主体（患者/照护者）区分**、私密标记、敏感话题入口 | SPEC §2/§3、HVT §4.5 |
| L8 | 复诊与随访 | 全程与康复·近期安排 + 就诊准备 + 长期生活 | SPEC §2 |
| L9 | 资料与导出 | **收藏与回顾独立一级**：问题清单版本、快照、Markdown 导出、源变标"已过时"；病情整理承载导入+草稿核对+解析 | SPEC §2 |
| L10 | 试验与线索 | 临床·试验线索（一期虚构样例仅作界面演示，真实登记库二期） | SPEC §2 |
| 横切 | 一图秀 | 多指标时间轴、治疗条、缩放与时间窗、点详情回源、3D 翻转卡 | SPEC §2 |

**三条可直接借的 breast 立场（SPEC §4.5，HVT 补丁）**：

1. **"LVEF 与骨密度只做与治疗同窗的记录，不做毒性判定"**——MEL 的 **LDH / 甲状腺功能 / 肝酶**（IO 监测）逐字同构：记录数值+日期+机构+方法，页面常显"是否调整治疗由治疗团队决定"。
2. **"内分泌副作用记录体验、不做归因；强度轨道呈现，不画趋势曲线"**——MEL 的 **irAE 皮疹/腹泻/乏力**同构，且 MEL 更要防"皮疹=病情恶化"或"皮疹=药"的自判（M5、F5）。
3. **"生育与性健康是可选话题不是必填表；默认私密，三处过滤"**——MEL 的性健康/身体意象（A10 性功能障碍可达 52%）沿用；breast 还有"术式是独立字段不与治疗混写"→ MEL 的 **WLE 切缘/SLNB/清扫**独立字段同构。

**breast 不可直接借的**：①"当前阶段由用户选"在 MEL 确诊前段不成立——自查档案没有"阶段"可选，只有"发现了什么/什么时候"；②breast 的肿瘤标志物线（CEA/CA15-3）在 MEL 没有对应物，L4 必须换骨架（见 §六.6）；③breast 用 8 条一级承载 27 个二级，MEL 因新增自查与 IO 两条线，需要 10 条。

判定纪律（26 号）：HCC 曾因"营养一张表、心理完全没有、指标无卡无分级、二级为 0"被判结构性不足。MEL 走查时逐线过同一张表，尤其 **L4（MEL 无常规标志物）** 与 **L10（试验线索只有二级位）** 是两处容易被判薄的位置。

---

## 五、家族通用件 vs 必须癌种化部位（含 30 号接入）

**通用骨架（换癌种不换结构）**：

| 件 | 出处 | 要点 |
| --- | --- | --- |
| 三层结构 线→页→卡 | 26 §1 | 一级 8–10 / 二级 24–30；二级为 0 的一级 ≤2；单线二级 ≤6；<8/<20 直接判结构性不足 |
| customFrame 外壳 | cervical `src/client.js`、20 号、`lib/layout.js` | businessSide/0.65 + 会话面板 25%–45% 可拖；顶栏 AI 按钮、splitter、宽度记忆、草稿桥、始终挂载、窄屏抽屉——M5 整段移植 |
| 看板四点位 | SPEC 家族段 | 定调条→「现在可以做」→特色状态卡→随访卡→接下来/最近变化 |
| 一图秀 | 16 号 R1–R12 | 三合同（可比性/归一化/事实源）+ 单点不连线、治疗条分层、末点避让、`minmax(0,1fr)` |
| 3D 指标卡翻转 | 16 §2、19 §4 | `data-flipped` 唯一开关、固定高度、reduced-motion 降级 |
| 多轨并列 | 27 号 | **永不加总、永不折算、各自独立归一化、分类只画节点**；判据是"页面不能让用户算出总体几分" |
| 指标分组 + CTCAE | 23 号 | 绝对阈值 vs ×ULN（needsUln）；分类卡不进趋势。**MEL 只对 IO 实验室项适用** |
| 私密=数据结构属性 | 26 §4.3、cervical 口径 D | `is_private`/`visibility` 列 + 三出口（一图秀/摘要/导出）各过滤、收敛一个函数；MEL 加 `author_role`（self/proxy/clinician）双源并列 |
| 版本链只增不改 | 0001 头注、SCHEMA-SPEC | 更正=INSERT+翻 is_current；触发器禁改禁删（MEL：分期变更、病理更正、治疗线变更、IO 反应严重度更正都是版本链） |
| 分节标题表化 | cervical `section_titles` | 教训件：不用 subjects 上的 `*_title` 列 |
| 设置三区 / 两区导出 / 试验线索卡 / MinerU 管线 | SETTINGS-DESIGN、29 号、18 号 | 拒根/桌面根、Token 三态；fact/view 分区；失败不产候选 |
| 指南四刻度 | 25 号 | L1 出处 / L2 适用 / L3 节奏 / L4 分级 / X 禁止层；**L3 节点 = 起点 + k × 间隔，不是"上次复查 + 间隔"**；显示带宽是工作台约定必须标注 |
| 工程件 | `lib/version.js` + build-version、freeze-contract、check-* 族 | VERSION 唯一来源；迁移哈希冻结；无头实测出数字 |

**30 号接入（窄宽自适应）**：

- MEL 本地已有 `docs/30-RESPONSIVE-RULES.md`（病种无关 starter，GBM v0.1.5 抽象版）与 `docs/RESPONSIVE-RULES.md`（带病种示例版）。**接入点**：①业务区视口 = iframe 宽（AI 面板展开后 `@media` 量到的就是业务区宽，不是窗口宽）；②六条硬规则（"标签+值+说明"纵向堆、grid+`minmax(0,1fr)`、行内标签不做 flex item、允许收缩容器 `min-width:0`、横向滚动配 `.scroll-hint`、短 token `nowrap`）；③断点只有 1180/900/600 三档；④验收 = `npm run probe:resp`（真实 Chrome，多档宽 × 一级页出数字）+ `test/responsive.test.mjs`。
- **MEL 现状缺口**：`scripts/` 没有 `probe-responsive.mjs`，`test/` 不存在。M2 必须从参考实现（glioblastoma-workbench）抄入 `scripts/probe-responsive.mjs` 的 SCAN 段，只换 `#main` 与页面 hash，并新建 `test/responsive.test.mjs`。
- MEL 的高发区：**自查部位地图**（足底/趾缝/甲下/手掌/指甲多块并排，最易挤成竖排单字）、**双轨日历**（两列轨道）、**IO 反应卡**（"部位+严重度+时间+照片"四段）。这三处必须在 M2 原型阶段就跑窄宽扫描，不能留到 M6。
- 示例词去残留：`docs/RESPONSIVE-RULES.md` 的示例是 GBM 语境（KPS/MRI/激素），落地 MEL 时换成 Breslow/足底/TSH·ALT；不要直接把示例文案抄进原型。

**必须癌种化（不许换名复用）**：

| 部位 | cervical/breast 现值 | MEL 必须换成 |
| --- | --- | --- |
| 品牌三档色与整套色板 | 青 #18AFA5 全套 / 粉 | **墨绿 #2E6B4F + 家族行动橙 + 暖砂灰分区**；icon 与 WIDTH_KEY/DRAFT_QUEUE_KEY 前缀 |
| 部位/皮损字典 | 无（cervical/breast 都没有体表部位地图） | **肢端优先的部位码表**：足底 / 趾缝 / 甲下 / 手掌 / 指甲 / 足侧 / 背部 / 头皮 / 耳后 / 下肢后侧 / 生殖器（仅患者可见）……中国语境把足底与甲下放第一屏 |
| 病理参数字典 | FIGO 分期 + 鳞/腺/腺鳞 | **Breslow 厚度(mm) / 溃疡 / 核分裂率 / 亚型（表浅扩散/结节/肢端/黏膜/其他）/ 切缘 / SLNB** |
| 分子词表 | PD-L1 CPS/p16/MMR/HER2 四态 | **BRAF / NRAS / TERT 三态：检出 / 未检出 / 未检测（未检测≠阴性）**，界面不写具体突变率（user-research 明确中国肢端 BRAF 率未找到可靠来源） |
| 20 张 `*_rows` 专属表 | stage/pathway/rt/late_effect/vagina/fertility/cytology/hpv… | MEL 专属表（皮损、照片、自查场次、SLNB、irAE、皮肤复查、影像、防晒……见 §六.8） |
| 五条口径 A–E | FIGO/后装/细胞学/私密/SCC-Ag | A 分期只抄；B 双轨与 IO/皮损分列；C 病理影像只存原文；D 皮损照片逐张私密；E 条件显示改"亚型/治疗状态" |
| demo 画像 | 鳞癌 IIIC / 乳腺术后上肢 | **双档案（患者 + 照护者代记）+ 肢端画像**（足底/甲下各一例；照片用示意占位，不写真图） |
| 随访节奏 | 细胞学+SCC-Ag+影像三类 | **皮肤线 / 影像线双轨**，按分期给不同密度；不合并成"复查" |
| 试验关键词 | HPV/放化疗 / 内分泌 | BRAF+MEK、anti-PD-1/CTLA-4、TIL、T-VEC、辅助治疗语境 |
| check-wording 红线词表 | cervical 词族 | MEL 加 M1–M6 词族（见 §六.4），并扫原型文案与 demo 数据 |
| API 前缀与 routes | /api/cervical | /api/melanoma（与现有 health 路径统一） |

---

## 六、MEL 结构建议草案（M2 原型候选，待 G1 讨论）

### 6.1 设计输入对齐

**PATIENT-FLOW 三流反推**（`docs/PATIENT-FLOW.md`）：

- 流一（自查发现）→ 线 2 自查档案（**家族首次"确诊前"入口**）+ 线 3 的病理前置说明。
- 流二（确诊与分期）→ 线 3 我的分期与分子（Breslow/SLNB/分期/分子三态）+ 线 4 治疗历程。
- 流三（治疗与双轨随访）→ 线 5 免疫与靶向反应 + 线 6 双轨随访 + 线 7 一图秀。

三条流全部有两条以上线承接，反推原则满足。

**六个 MEL 特殊语境的落位**：

1. **自查是主动形态**（A2：53% 患者自己发现；A1：把皮损与脑子里的"正常皮肤"反复比对）→ 自查档案独立一级，时间轴起点在确诊之前。
2. **中国肢端语境**（C1 肢端约 50%、C2 足底 48%、C4 中国更厚、C3 中位病程 54 个月 / 44.92% 初诊为色素痣 / 10.17% 甲母痣）→ 部位码表肢端优先 + 脱鞋/足底/趾缝/甲下引导 + 易混词说明卡。
3. **确诊偏晚 + 误判链长**（C2：56% 初诊 III–IV 期）→ 产品不能假设"刚发现、很早期"；自查档案要能容纳"已经绕了一圈"的既往记录（首次发现日期可远早于确诊）。
4. **IO 归因难题**（B4 副作用比癌症更难、B6 难以识别 irAE、C8 皮肤反应常先出现且可延迟至停药后）→ IO 反应独立一级/独立轨道，不是"打卡"，而是"药/病/其他"自评 + 致电红线。
5. **皮肤是可见器官**（A9 31% 女性/13% 男性不愿查生殖器、近半希望保留内衣；A10 性功能障碍可达 52%）→ 私密分级是复查场景的前置条件，不是附加项。
6. **FCR 不随分期归零**（A3：0–IIA 期 75% FCRI-SF≥13）→ 心理线不能只服务晚期；早期/原位也要有位置。

### 6.2 一级 10 条候选线（覆盖 M1–M6 与 S01–S13）

| # | 候选线名 | 接哪句患者原话（F 层改写，非一手） | L 线 / 红线 | 与 cervical（及 breast）的刻意不同 |
| --- | --- | --- | --- | --- |
| 1 | 看板 | "我现在整体什么情况？下次该查什么？" | L1 | 沿用四点位，特色状态卡 = **自查待记录 + 双轨下次节点（皮肤/影像并列）+ IO 反应待观察**；cervical 是放疗长期影响卡，breast 是上肢差值卡；双主体入口（本人/代记） |
| 2 | **自查档案** | "ABCDE 我记不住，而且我这颗痣不符合那五条""洗澡时发现背上痣变了" | L2 前置段；M1 M2 | **家族首次"确诊前"整线**（cervical/breast/THY 都没有）：部位地图 + 照片双视图 + 变化时间轴 + 肢端专项引导 + ABCDE/易混词说明卡；不判良恶性、不写"观察即可" |
| 3 | 我的分期与分子 | "Breslow 1.1 mm 是什么意思？""前哨淋巴结要不要做？""BRAF 阳性是不是更糟？" | L2；M3 M4 | cervical 叫「我的分期」（FIGO）；MEL 是 **Breslow/溃疡/核分裂 + SLNB 三态 + AJCC 8 引用 + BRAF/NRAS/TERT 三态**；"未检测≠阴性"上屏 |
| 4 | 治疗历程 | "我做过什么、接下来还有什么路？" | L3 | cervical 是路径三选一+后装；MEL 是 **WLE/SLNB/清扫 + IO 周期 + BRAF/MEK 靶向**；计划 vs 实际、停药原因留痕，不评疗效 |
| 5 | **免疫与靶向反应** | "免疫治疗起的疹子，是药的反应，还是病重了？" | L5；M5 | cervical 的长期影响起点是放疗；MEL 的 L5 是 **IO/靶向毒性**：A 皮肤 / B 胃肠 / C 肝 / D 内分泌四轨并列，**不与线 2 皮损档案混**（结构断言）；"药/病/其他"只做自评，不归因 |
| 6 | **双轨随访** | "该多久查一次？查皮肤还是查影像？""复查要全脱衣服检查，太尴尬了" | L8；M6 | cervical 是"三类随访节点"合成一页；MEL **必须拆成皮肤线 / 影像线两条并列轨道**，节奏各自独立、禁"总复查"、禁"可以少查"暗示；隐私偏好前置 |
| 7 | 病情一图秀 | "变化发生在哪一步" | 横切层 | 骨架同构；默认选线 **体重 + 同模态影像测量 + IO 实验室（ALT/TSH）**，分类节点 = 皮损变化/治疗事件/irAE；单点不连线、跨模态不共轴 |
| 8 | 营养、防晒与体力 | "太阳一点都不能晒了吗？我是不是自己晒出来的？""足底术后走不了路" | L6 | cervical 是营养支持（进食量）；MEL 加 **防晒与暴露史（事实提醒，不做命令式）** + 足底术后行走/疲劳；自责要被命名，不道德评判 |
| 9 | 情绪与身体意象 | "复查前一周我就开始睡不着，身上每一处痕迹都让我恐慌" | L7 | cervical 专属子页是"母亲身份"；MEL 是 **FCR 双人记录（患者/照护者并列不平均）+ 疤痕/可见皮肤 + 性与亲密（私密）+ 遗传与家属沟通** |
| 10 | 资料与就诊准备 | "复诊要带什么？""还有没有我能参加的研究？" | L8 尾 + L9 + L10 合并 | 对 cervical 拆「复诊准备 / 病情整理 / 临床研究」三条：MEL 合并为一条 4 子页（同 thyroid/GBM/MPM 惯例）；两区导出 private 过滤；MinerU 六部件按 18 号 |

### 6.3 二级 30 个候选页签

| 一级 | 二级候选 | 职责一句 |
| --- | --- | --- |
| 看板（0） | — | 双主体四点位；无二级 |
| **自查档案（5）** | 部位地图与皮损列表 | 体表分区（**足底/趾缝/甲下/手掌/指甲前置**）+ 每条皮损一行；新增部位 = 新增一条，不改表 |
| | 皮损详情与照片 | 单条皮损的 **部位+时间双视图**；带标尺照片、拍摄日期、自述变化、`author_role`；只并列不判读（M2） |
| | 变化与症状时间轴 | 同一皮损的历次记录按时间排；只并列"当时怎么描述"，不生成趋势结论 |
| | 肢端专项自查引导 | 脱鞋→足底→趾缝→趾甲→手掌→指甲逐部位图文 + 三问（黑线宽度/是否到甲周/甲板是否破坏）；节奏由用户设定（默认每月，不鼓励每日） |
| | ABCDE 与易混词说明卡 | ABCDE **只做名词解释**；鸡眼/灰指甲/甲下血肿/摩擦淤青 → 说明"这些词常被混用"，红线（出血/不愈/变大）→ 建议看皮肤科；**禁"良性/恶性/不像/观察即可"**（M1） |
| **我的分期与分子（4）** | 病理与 Breslow | 厚度 mm、溃疡、核分裂率、亚型（含肢端）、切缘，逐项带报告原文与日期；不由厚度推 T |
| | 前哨淋巴结与区域淋巴结 | 三态（**未做 / 结果原文 / 未记录**）；回答"为什么做、什么时候做、做了会改变什么"；不写"必须做"（M3） |
| | 分期档案（AJCC 8 引用） | 医生给出的分期、依据原文、日期；版本链留旧分期；不自算、不解释"严重不严重"（M3） |
| | 分子三态（BRAF·NRAS·TERT） | 检出/未检出/未检测三态并列；**未检测≠阴性**；说明"阳性有靶向选项、阴性仍有免疫等其他选项"；不写具体比例（M4） |
| **治疗历程（3）** | 治疗路径与方案 | 辅助 vs 晚期、计划 vs 实际、换线原因；只记录不推荐 |
| | 手术记录 | WLE 范围与切缘、SLNB、淋巴结清扫、足底术后行走影响；术式独立字段不与系统治疗混写 |
| | 系统治疗周期 | IO 周期（起止、延迟、停药原因）与 BRAF/MEK 靶向（剂量变更、皮肤反应）分列；不评疗效、不判进展 |
| **免疫与靶向反应（3）** | IO 不良反应轨道 | 四轨并列：A 皮肤 / B 胃肠（腹泻）/ C 肝（ALT/AST） / D 内分泌（TSH/FT4）；各轨独立归一化、永不加总（27 号）；严重度只引用院方/CTCAE 原文（M5） |
| | 皮疹照片与"药还是病"问题清单 | 照片时间线 + 是否伴腹泻/气短/黄疸等内脏信号 + 自评"像药/像病/其他/不知道"；**只列问题不归因**；注明可延迟至停药后（C8、F5） |
| | 致电红线与处理记录 | "什么时候必须联系治疗团队"红线卡（按院方原文）+ 已联系记录 + 激素/减量/停药原话；不给处理方案（M5） |
| **双轨随访（4）** | 双轨日历（皮肤线 / 影像线） | A 轨皮肤、B 轨影像**各自节奏并列**；节点 = 起点 + k×间隔（25 号 L3）；不生成合并"下次复查"；不暗示可减少（M6） |
| | 皮肤复查记录 | 全身皮肤检查/皮肤镜、检查范围、医生原话；隐私偏好（范围/内衣/医生性别/陪同/屏风）在本页生效 |
| | 影像复查记录 | 超声/CT/PET 原文、部位、测量值与方法；同一模态才可并列，跨模态不共轴；不判读 |
| | 复查准备与隐私偏好 | 到院前"会发生什么"流程卡 + 隐私偏好表 + 问题清单；偏好只存本机、默认仅患者可见（A9、F6、H7） |
| **病情一图秀（0）** | — | 体重/IO 实验室/同模态影像 + 分类节点（皮损/治疗/irAE）；无二级 |
| **营养、防晒与体力（3）** | 食量与体重 | 份量、食物、症状；体重进指标；不给食谱/热量处方 |
| | 防晒与暴露史 | 防晒行为、户外活动、晒伤史；**只做事实提醒，不做命令式**（M6）；同时命名"自责不是道德失败"（F7） |
| | 疲劳与日常活动 | 足底术后行走、工作/家务节奏、疲劳强度；不给康复处方 |
| **情绪与身体意象（4）** | 当下感受（FCR·双人） | 患者/照护者各自记录、并列展示、不平均；检查前 7 天可记睡眠/焦虑；不承诺"消除恐惧"（A3/A5/B3） |
| | 身体意象与疤痕 | 疤痕、可见皮肤、脱发/色素改变；默认仅患者可见，可逐项授权 |
| | 性与亲密（私密） | 默认私密、三处过滤；可选话题不是必填表；不按年龄推断、不给"能不能"结论（A10） |
| | 遗传与家属沟通 | 家属风险沟通由患者决定；只加提示不加判定（26 §5）；说明 BRAF 突变不遗传（D5） |
| **资料与就诊准备（4）** | 资料库与导入 | 原件保留、MinerU 解析、失败不产候选；病理/影像/基因报告分类 |
| | 整理草稿与核对 | 解析候选逐项 accept 前不进正式数据；候选带来源页与置信标记 |
| | 就诊准备与导出 | 两区导出（事实 / 我的看法与担心）+ **private 默认过滤**；问题清单版本与"已过时"标记；导出不含完整本机路径 |
| | 试验线索 | BRAF/MEK、anti-PD-1/CTLA-4、TIL 等 2026 线索；线索不是推荐、不判入组资格；无真实库就不做入口 |

合计：一级 **10** / 二级 **30**（0+5+4+3+3+4+0+3+4+4）。单线最大 5（自查档案）≤6；二级为 0 的一级 = 2（看板、一图秀）≤2；一级 10 ∈8–10；二级 30 压 24–30 上限。

### 6.4 M1–M6 与 S01–S13 覆盖矩阵

| 约束 | 落页 | 结构证据（M3 冻结时的断言） |
| --- | --- | --- |
| M1 自查禁诊断措辞 | 线 2 全部 5 页（线 8 防晒另受 M6 词表约束） | 词表测试扫原型文案/demo/导出模板；`lesion_rows` **无 benign/malignant/suspicion 列**；ABCDE 卡只有名词解释，无"符合几条=风险" |
| M2 部位+时间双视图 | 2·皮损详情与照片、2·变化与症状时间轴 | 读模型提供 `by_site` / `by_time` 两个视图；变化只并列，无 delta 判读字段；照片与记录 1:N |
| M3 分期/SLNB 只引用 | 3·前哨淋巴结、3·分期档案 | `stage_rows`/`slnb_rows` 三态 CHECK（未做/结果原文/未记录）；`stage` 为 TEXT；无 TNM→分期推导列/触发器 |
| M4 分子三态 | 3·分子三态 | `molecular` 词表 BRAF/NRAS/TERT；状态三态；**"未检测"不得渲染为"阴性"**（读模型 + UI 双层断言） |
| M5 IO 轨道独立 | 线 5 全部 3 页 | `irae_rows` 与 `lesion_rows` **分表**；跨线查询断言（IO 皮疹不出现在皮损列表）；归因字段只存自评枚举，无 causality 列；四轨独立归一化 |
| M6 双轨随访 | 线 6 全部 4 页 + 8·防晒 | `followup_tracks.track` 取 `skin` / `imaging` 两值；读模型禁生成合并 due；词表禁"可以少查/不用查"；防晒只做事实提醒 |

| 场景（SCENARIOS） | 落页 |
| --- | --- |
| S01 痣变了（自查） | 2·部位地图 → 皮损详情与照片 → ABCDE/易混词卡 |
| S02 前哨淋巴结结果读不懂 | 3·前哨淋巴结与区域淋巴结 + 3·分期档案 |
| S03 BRAF 阳性要不要靶向 | 3·分子三态 + 4·系统治疗周期 |
| S04 免疫治疗后起疹子 | 5·IO 轨道 + 5·皮疹照片与归因问题清单 |
| S05 皮肤科 vs 影像不同频 | 6·双轨日历 + 6·皮肤复查记录 + 6·影像复查记录 |
| S06 复诊准备（家族件） | 10·就诊准备与导出 + 6·复查准备与隐私偏好 |
| S07 防晒与暴露史 | 8·防晒与暴露史 |
| S08 新发痣记录 | 2·部位地图（新增部位）+ 2·皮损详情 |
| S09 影像并列 | 6·影像复查记录 + 7·一图秀（同模态才并列） |
| S10 营养与体重 | 8·食量与体重 |
| S11 心理与身体意象 | 9·身体意象与疤痕 + 9·性与亲密 |
| S12 试验线索（BRAF/IO/TIL） | 10·试验线索 |
| S13 文档导入（MinerU） | 10·资料库与导入 + 10·整理草稿与核对 |

二期不占结构：葡萄膜黑色素瘤（#43 另案）、儿童与青少年、遗传家系深化。

### 6.5 为什么"自查档案"必须是独立一级（家族首次"确诊前"入口）

这是本草案最需要 G1 明确签认的一条，理由四条：

1. **时间起点不同**：cervical/breast/THY 的所有线都以"已确诊、已有病理/分期"为默认前提；自查档案的第一条记录发生在**确诊之前数月甚至数年**（C3 中位病程 54 个月）。把它挂进"我的分期与分子"会让页面默认要求分期字段，用户在最需要记录的阶段反而无法开始。
2. **语义不同**：它不是"疾病本体"，而是"我观察到的身体变化 + 我当时的描述"。产品立场上属于**自述事实层**，与病理/分期（医生事实层）必须分表（家族契约 4：事实四层不合并）。
3. **M1 的隔离需要**：M1 禁止诊断性措辞。若自查档案与分期/分子同页，界面很难避免"这条皮损对应几期"的暗示；独立成线后，线 2 只允许"记录/并列/回原文"，线 3 才出现医生标签，词表测试边界清晰。
4. **M5 的隔离需要**：IO 皮疹与皮损档案必须分开。自查档案独立后，"皮损列表只来自自查/皮肤科检查"成为可断言的读模型规则；IO 皮疹只进线 5，不污染线 2。

**结构形态**：确诊前只有 2 条路径可走——「记录一颗痣/一块斑」与「按部位自查一遍」；确诊后同一条线继续承接"新发痣"（S08）与"皮肤科复查时的皮损对照"，**不是 onboarding 向导，不因确诊而消失**。看板在确诊前只显示自查卡与"什么时候该看皮肤科"的红线卡；确诊后才出现双轨随访与 IO 卡（条件显示）。

### 6.6 三处结构细则（双轨 / IO / 肢端）

**双轨随访（M6）**：

- 轨道命名：`A 轨 · 皮肤线`（皮肤科全身检查/皮肤镜/自查照片对照）、`B 轨 · 影像线`（超声/CT/PET）。两轨**各自节奏、各自下一次节点**，页面顶部明确"两条线不同频是正常的"。
- 禁则：不生成"下次总复查"；不把两轨折成一个依从性分数；不出现"皮肤没问题就可以少做影像"；不把"医生没安排"渲染成"不用查"。
- 节奏来源：25 号 L3（节点 = 起点 + k×间隔），显示带宽标注"工作台约定，具体以医生为准"；AIM/D1 的分期差异（III 期终身每年皮肤检查、IIB/IIC 每年、前 2 年每 3–6 个月）只作为**可引用出处**，不写成个人处方。
- 隐私前置：皮肤复查页首屏就是隐私偏好（范围/内衣/医生性别/陪同/屏风），到院提示卡可导出（A9/H7）。

**IO 轨道（M5）**：

- 四轨：A 皮肤（皮疹/瘙痒）、B 胃肠（腹泻/结肠炎信号）、C 肝（ALT/AST/胆红素）、D 内分泌（TSH/FT4/皮质醇/血糖）。按 27 号：永不加总、永不折算、各自归一化、分类只画节点。
- 归因：只存自评 `attribution_self ∈ {like_drug, like_disease, other, unknown}` 与"是否伴内脏信号"，**没有 causality 列**，界面不出现"这是药引起的"。
- 红线：致电条件按院方/共识原文（C8、MSK 患教），产品只做"什么时候必须联系"的清单，不做分诊。
- 延迟性：明确提示皮肤反应可延迟至停药后（C8），避免用户把"停药后起疹"误判为无关。
- 与线 2 的断言：`irae_rows.lesion_id` 为 NULL；IO 照片不进皮损时间轴；看板只显示"IO 反应待观察"状态卡，不显示皮损数。

**肢端自查语境（中国第一优先）**：

- 部位码表顺序不是"从头到脚"，而是**足底 → 趾缝 → 甲下 → 手掌 → 指甲 → 足侧 → 背部 → 头皮 → 耳后 → 下肢后侧 → 其他**；默认首屏就是足部。
- 引导步骤：脱鞋 → 看足底（含足跟/足弓/前掌）→ 趾缝 → 趾甲（黑线宽度、是否到甲周、甲板是否破坏）→ 手掌 → 指甲；每步一句"看到什么就记什么，不用判断"。
- 易混词卡：鸡眼/灰指甲/甲下血肿/摩擦淤青/普通痣——只解释"这些词常被用来描述什么"，并给红线（出血、不愈、变大、颜色不均）→ "建议让皮肤科看"；**不写"不像黑色素瘤"**。
- 照片：带标尺/参照物、同角度复拍提示；足底与甲下照片默认 `visibility=patient`，逐张授权；不鼓励每日检查（D1：每日检查增加焦虑），节奏由用户设定，默认每月。

### 6.7 差异化判据自查与重名率实测

- 一级 10（∈8–10）/ 二级 30（压 24–30 上限）。若 G1 要加任一二级，必须同时砍一个（建议候选：把「变化与症状时间轴」并回「皮损详情与照片」，或把「疲劳与日常活动」并回「食量与体重」，每并一处降 1；两处都并降到 28）。
- 二级为 0 的一级 = 2（看板、一图秀）≤2；单线二级最大 5（自查档案）≤6。
- **与 cervical 12 条一级并排（实测）**：
  - **完全同名 = 看板、治疗历程、病情一图秀，共 3 条 = 30% ≤70% ✅**
  - 宽松口径（共享核心词）：再加「我的分期与分子↔我的分期」「营养、防晒与体力↔营养支持」= **5 条 = 50%**，仍过线。
  - 与 breast 8 条并排：完全同名 = 看板、病情一图秀，**2 条 = 20%**。
  - MEL 新增结构位 5 条（自查档案、免疫与靶向反应、双轨随访、情绪与身体意象、资料与就诊准备），占 50%。
- S01–S13 全部有落页（见 §6.4）；M1–M6 全部有结构断言（见 §6.4）。
- 每条线的患者句子来自 SCENARIOS/BRIEF/user-research F 层——**F 层是文献语境改写，M1 访谈后必须替换并留痕**（user-research 明确 0 一手引语）。

### 6.8 schema 草案（M2 建库输入，不是冻结）

| 线 | 建议表 | 关键口径 |
| --- | --- | --- |
| 2 自查档案 | `lesion_rows` / `lesion_photos` / `lesion_changes` / `selfcheck_sessions` | 部位码（肢端优先）；`first_noticed_at` 可早于确诊；照片只存文件引用（不入库 base64）；`lesion_rows` 无良恶性/可疑列；`author_role` + `basis`（亲眼/听患者说/看照片） |
| 3 分期与分子 | `pathology_rows` / `slnb_rows` / `stage_rows` / `molecular`（通用表换词表） | Breslow `thickness_mm` + `result_text` 同存；SLNB/分期三态；stage TEXT；无 T 推导；分子三态 |
| 4 治疗历程 | `treatment_lines` / `surgery_rows` / `systemic_rows` / `cycles` | 计划 vs 实际；版本链；停药原因原文；无疗效/进展判定列 |
| 5 IO 与靶向 | `irae_rows` / `irae_photos` / `irae_calls` | 四轨 `track ∈ {skin, gi, liver, endocrine}`；严重度引用原文；`attribution_self` 枚举，无 causality；与 `lesion_rows` 无外键 |
| 6 双轨随访 | `followup_tracks` / `skin_exam_rows` / `imaging_rows` / `privacy_prefs` | `track ∈ {skin, imaging}`；各自 next；禁合并 due；隐私偏好本机 |
| 7 一图秀 | `events` / `metric_points`（通用） | 派生量只展示计算过程；跨模态不共轴；无肿瘤标志物 |
| 8 营养/防晒/体力 | `nutrition_rows` / `sun_rows` / `activity_rows` | 只记录；无食谱/剂量/命令式 |
| 9 情绪与身体意象 | `viewpoints`（通用）/ `fcr_rows` / `body_image_rows` / `sexual_rows` / `family_comm_rows` | `author_role` 双源并列不平均；`sexual_rows.is_private` 默认 1；三出口过滤 |
| 10 资料与就诊准备 | `documents` / `candidate_fields` / `exports` / `trials` / `questions` | 事实四层不合并；两区导出；private 默认过滤；线索不是推荐 |
| 通用平移 | `subjects` / `section_titles` / `metrics` / `metric_points` / `molecular` / `events` / `rhythm` / `cycles` / `treatment_lines` / `viewpoints` / `trials` / `documents` / `candidate_fields` / `demo_meta` + `profile_meta` | 机制照 cervical；词表/字段换 MEL |

**MEL 无常规血清肿瘤标志物**（这点必须写进 DIFF-MATRIX）：LDH 只在晚期有预后语境、S100B 不属常规随访，二者都**不做 CTCAE 式分级、不做趋势预测**。L4 指标分析线由三源拼成：病理参数（Breslow/溃疡/核分裂）、IO 实验室（ALT/AST/TSH/FT4/血糖）、影像测量（同模态才可比）。一图秀默认选线相应改为"体重 + IO 实验室 + 同模态影像"，而不是"肿瘤标志物"。

### 6.9 已知张力（G1 决策点，写明不沉默）

1. **30 个二级顶格**：任何新增都要先砍；最脆的是「变化与症状时间轴」与「疲劳与日常活动」。
2. **「免疫与靶向反应」独立成线 vs 并回治疗历程**：M5 只要求"独立轨道"，不要求"独立一级"。本草案取独立一级，理由是 B4/B6 的归因困惑高频且辅助 IO 可长达一年；若 M1 访谈显示这是短阶段，可降为治疗历程下的 3 个二级（一级变 9；治疗历程变 6 个二级、仍是单线上限；二级总数仍 30，需另砍 1–2 个才回到舒适区），但必须保留"与皮损档案分表"的断言。
3. **「复查准备与隐私偏好」放在双轨线还是资料线**：本草案放线 6（到院前场景），线 10 只做材料与导出；两页有跳转，G1 若觉得重复可合并到线 10。
4. **分子三态 vs cervical 四态**：cervical `molecular.state` 是 ok/na/warn/pending 四值。M4 要求"三态（未检测≠阴性）"，本草案建议 `state ∈ {detected, not_detected, not_tested}`，`note` 存方法与原文；G3 冻结前必须二选一，不能一边四态一边三态。
5. **DEV-REQUIREMENTS 的编号碰撞（必须先修）**：该文件的"本癌种专属 M1–M6"与 DEV-PLAN 的项目里程碑 M1–M6 **同号不同义**（例如"装机（M6）"与"双轨随访 M6"）。M2 原型阶段极易误读。建议 G1 前把专属约束改名 **K1–K6 或 MEL1–MEL6**（参照 THY 的 T1–T7），并在 check-wording 与契约断言里用新号。
6. **品牌与色板**：「小痣宝 MolePal」与墨绿 #2E6B4F 是 DEV-REQUIREMENTS 占位默认；icon 候选 🟤 未定。家族已有青/粉/紫莲/绿等多套，G1 从"痣/皮肤/沉静"意象定三档色，避免与既有工作台撞色。
7. **自查节奏的措辞边界**：user-research 引 D1"每日检查增加焦虑"、建议每月一次；但"每月一次"也可能被读成医疗建议。建议文案写成"你可以设一个提醒节奏，具体频率听医生的"，默认值可预填但不锁定。
8. **照片存储与隐私**：皮损照片是本家族首次出现"高敏感图像资产"。必须明确：只存本机文件引用、不入包、不进导出、不上传云；缩略图缓存也要受 `visibility` 约束；代检者拍照要标 `author_role=proxy`。

---

## 七、移植注意（cervical 0.1.1 → MEL）

**直接复用（文件级，改 ID/品牌后原样搬）**：

| 层 | 文件 | 说明 |
| --- | --- | --- |
| 客户端 | `src/client.js` + `scripts/build-client.mjs` + `lib/layout.js` | customFrame 外壳全结构（顶栏/会话/宽度/草稿桥/抽屉/broken 兜底）零癌种内容；只换 §三的 14 token 源头 + 8 处手写品牌 |
| | `lib/version.js` + `scripts/build-version.mjs`、`lib/zip.js` | 版本唯一来源、导出打包 |
| 数据层 | `dsh/` 12 文件：server/routes/store/import/export/readmodels/settings/mineru/layout/index/workbench/demo | 零依赖 http + 127.0.0.1 + 前缀改写（`/api/cervical`→`/api/melanoma`）；导入-解析-候选管线、候选 accept、导出模板、设置三区全保留。**MEL 现状只有 index.js，11 件全要平移**（MEL 已有 fetch-melanoma-trials-2026.mjs，可并进 import/trials） |
| | `schema/freeze-contract.md` 机制 + 0001/0002 结构 | 迁移冻结与"只增不改"执行器；表内容全换。**MEL 无 schema/，从零建但机制照抄** |
| 工程 | `scripts/check-{schema,syntax,version,wording,pack,workbench-package,install,demo-columns}.mjs`、`dev-server.mjs` | 家族检查器；wording 红线按 M1–M6 扩；check-demo-columns 对 MEL 新列重配；MEL 现有 3 个 check 脚本可保留但需并入 check 链 |
| 原型 | `prototypes/v0.2/` 骨架段 + `public/` 四件套 | PAGES/SUBPAGES/SUBTITLES 常量结构、`state` 模型（view/sub/sel/range/zoom/pin/flipped/privateOpen）、hash 路由 + go-* 动作表、esc/fmtDate/delta、pageHead/subnav、3D 翻面 flipCard、sidebar/breadcrumb/index.html 壳（skip-link 与 `#main` 焦点管理）、一图秀 SVG 段 |
| 样式 | `style.css` 令牌骨架 | 五组令牌结构保留，色值整组换墨绿系 |
| 窄宽 | GBM 的 `scripts/probe-responsive.mjs` + `test/responsive.test.mjs` | cervical 仓没有 30 号实现，从 GBM 参考实现抄 SCAN 段与测试，只换 `#main`/hash 与示例词 |

**必须换掉（不许换名复用）**：

1. **20 张 cervical 专属表** → MEL 专属表（皮损、照片、自查场次、病理、SLNB、分期、系统治疗、irAE、致电记录、皮肤复查、影像、随访轨、防晒、活动、FCR、身体意象、性健康、家族沟通……按 §六.8 逐页配表）。通用 14 张平移：`subjects`/`section_titles`/`metrics`/`metric_points`/`molecular`（词表换 BRAF/NRAS/TERT 三态）/`events`/`rhythm`/`cycles`/`treatment_lines`/`viewpoints`/`trials`/`documents`/`candidate_fields`/`demo_meta` + `profile_meta`。
2. **cervical 五条口径 A–E → MEL 重写**：A FIGO 不自算 → **AJCC 8 与 Breslow 只抄**；B EBRT/后装分列 → **皮肤线/影像线双轨 + IO 反应/皮损分表**；C 细胞学原文 → **病理/影像只存原文 + Breslow 数值带单位**；D 性与生育私密 → **皮损照片逐张私密 + 性健康 + 代报（`author_role`）**；E SCC-Ag 条件显示 → **亚型/治疗状态驱动显示**（既无 IO 治疗史也无 irAE 记录时不显示 IO 轨道；非肢端亚型不默认展开甲下引导，但仍可手动进入）。
3. **demo 画像与指标字典**：鳞癌 IIIC → **双档案 + 肢端画像**（足底/甲下各一例；照片用示意图，不写真实患者图）；SCC-Ag/细胞学/HPV → **Breslow/溃疡/核分裂 + ALT/AST/TSH/FT4 + 体重 + 同模态影像测量**；演示律照家族（化验 2–4 周一点、影像不加密；MEL 特例：**自查照片时间轴至少一条要跨数月**，体现"首次发现远早于确诊"，不必复刻 54 个月的中位误判病程）。
4. **文案全量**：SUBTITLES 10 条、看板任务卡与 go-* 跳转、页脚免责句、onboardingPrompt 5 行、Fallback/顶栏 hint——全部按 MEL 立场重写（新增：M1–M6 全词族、"自查不判良恶性""ABCDE 只是名词""未检测≠阴性""皮疹不归因""两条随访线不同频是正常的"）。
5. **品牌与身份**：TITLE/PANEL_TITLE、icon、墨绿全套色板、WIDTH_KEY/DRAFT_QUEUE_KEY 前缀、`mela:agent-draft` 消息类型（业务侧 postMessage 两端同改）、package.json name/repository（name 已定 melanoma-workbench）、cordis.patch.yml（`dshHomePath('melanoma-workbench')` 已本地化）、API 前缀。
6. **30 号落地**：补 `scripts/probe-responsive.mjs` + `test/responsive.test.mjs`；`#main`/hash 换 MEL；示例词去 GBM 化（KPS/MRI/激素 → Breslow/足底/TSH·ALT）；验收写进 M2 与 M6 两处。
7. **占位客户端修复（M5 第一优先）**：删除 42 行 `lib/client.js`，新建 `src/client.js` + `scripts/build-client.mjs` + `lib/layout.js` + `lib/version.js`；`package.json` 补 `build:client`/`build:version`/`check:schema`/`check:wording`/`test`/`probe:resp` 与 `files` 的 public/schema/demo；`npm run check` 必须包含 `build-client.mjs --check`。依据 `docs/LESSONS.md` 踩 3：parity 全绿但宿主加载的是占位客户端，会得到"接入骨架：服务已连接"的空壳。
8. **API 前缀统一**：现有 `dsh/index.js` 只注册 `/api/melanoma-workbench/health`，与 `__API_PREFIX__` 的 `/api/melanoma` 不一致。M5 定稿时二选一并写进 API-CONTRACT：建议页面统一拼 `/api/melanoma`，health 改为 `/api/melanoma/health`；守卫只禁交界重复 `/api/api`（吸取 LESSONS 的 apiBase 教训，带 standalone/host 两形态回归测试）。
9. **DEV-REQUIREMENTS 编号重命名**（§六.9-5）：M1–M6 → K1–K6/MEL1–MEL6，避免与 DEV-PLAN 里程碑 M1–M6 混淆；同时把 K1–K6 词族接进 check-wording。
10. **文档示例词防残留**：`docs/15-HVT-REVIEW.md`（乳腺/卵巢/肺癌例子）、`24-METRIC-TREND-TAB-DESIGN.md`（乳腺/淋巴瘤截图）、`26/27/18/25` 都带其他癌种示例。这些作为"参考出处"可保留，但**任何一句不得进入 public/ 原型文案、demo 数据、导出模板**；check-wording 应扫这三处。
11. **测试从零建**：MEL 无 `test/`。最低集：`responsive.test.mjs`（30 号）、`wording.test.mjs`（M1/M5/M6 红线）、`schema.test.mjs`（冻结哈希 + 三态 CHECK + 禁推导列）、`dual-track.test.mjs`（双轨不合并）、`privacy.test.mjs`（三出口过滤 + 照片逐张授权）。

---

### 落点提示

- 本篇 §6.2–6.3 → 填 `docs/DIFF-MATRIX.md` §二全量行与 §三自查（重名率 30% 已实测；MEL 尚无 DIFF-MATRIX，本篇即其输入）；§6.3 → M2 原型 PAGES/SUBPAGES/SUBTITLES 常量；§三 → M5 客户端移植清单；§六.8 → schema 草案；§七 → DEV-PLAN 与 DEV-REQUIREMENTS 重命名件。
- 待 M1 补：SCENARIOS 一手访谈回填（F 层改写句全部待替换）、中国肢端部位照片的可接受度与隐私顾虑（H1/H2）、IO 归因辅助是否降低"恐慌-乱搜"（H6）、隐私偏好是否提高复查到场率（H7）、M1–M6 约束编号重命名后的词表与断言、双轨节奏的显示带宽取值。
