# 设计评审（DESIGN-REVIEW）· 皮肤黑色素瘤（MEL）工作台

## 元信息

| 项 | 值 |
| --- | --- |
| 评审类型 | 独立设计评审（G1 设计包 + G2 原型） |
| 模型 / 档位 | GLM-5.3 / max |
| 评审人 | 独立子代理（非本包作者） |
| 日期 | 2026-10-24 |
| 评审基线 | git HEAD `53214c9e4a9ba1eeca5bf2854ec551f8e6524dee`（M2：demo+原型四件套） |
| 评审对象 | `docs/{SPEC,SCENARIOS,PATIENT-FLOW,INTERACTION-DESIGN,DIFF-MATRIX,USER-RESEARCH,DEV-REQUIREMENTS-2026-10-25}.md`；`research-notes/{medical-constraints,user-research,family-landscape}.md`（抽查）；`prototypes/v0.2/`（app.js 1124 行 / demo-data.js 2154 行 / style.css 698 行 / index.html 65 行）；`docs/shots/` 65 张中抽 3 张（self-acral、irae-rash、dash-main）；规范 `docs/{26,22,28,30}` |
| 证据口径 | 文件行号取自上述 HEAD；截图肉眼核对；数字类断言在仓内复算 |

## 一、逐项检验表

| # | 检验 | 结论 | 证据 |
| --- | --- | --- | --- |
| ① | 医生任务冒充患者；自查是否越权成"筛查工具" | **WARN** | 入口形态正确：看板任务卡「记录一颗痣 / 一块斑」、chip「痣变了」、自查页标题「记录」而非「筛查」（`app.js:378-390, 418-424`）。但 `self/acral`、`self/map` 同时放「红线信号（出血/不愈/变大/颜色不均）→ 建议让皮肤科看」的**转诊触发清单**，功能上已是低强度分诊；全包缺少反向保护句「没有这些信号 ≠ 无需就诊」。该设计在 `family-landscape §6.6` 有明文依据（指南："定期自查，必要时到专科就诊"），故不算越界诊断，但"筛查工具感"成立。另：两个演示档案均**已确诊**（demo1 IIB、demo2 IB），"确诊前第一入口"这一旗舰形态在 G2 画面中从未出现（P1-2）。 |
| ② | 证据成立性（0 访谈标注；3 条引用原文核对） | **PASS** | 0 访谈在 3 处如实声明（`SCENARIOS.md:3`、`USER-RESEARCH.md:3`、`INTERACTION-DESIGN.md:96`）。三条引用逐条核对：① 自查 53% → `research-notes/user-research.md:14,66,68`（西班牙单中心，417 例，占 53%，且原文自注"总样本分母未回源"）方向与数字一致；② 肢端 50% / 56% → 同文件 `:15,201-213`（卫健委 2022 肢端约 50%，为"亚洲及有色人种"口径；CSCO 白皮书 56% 初诊 III–IV）一致；③ FCR 75% → `:19,72-75`（38/51 ≥13，0–IIA 期）一致。唯一术语漂移见 P1-6。 |
| ③ | 解释价值 vs 记录本 | **WARN** | 30 个二级页中约 18 页是"记录/列表 + 免责句"（自查 map/lesion/timeline、分期 record、治疗 surgery/systemic、IO redline、随访 4 页、营养 3 页、情绪 4 页、资料 4 页）；真正的解释集中在 `self/acral`（肢端翻译卡）、`self/abcde`、`stage/slnb`（为什么做/什么时候做/做了改变什么）、`stage/molecular`、`irae/rash`（药还是病问题清单）。解释层级停在"名词解释"，未回答"这个数对我意味着什么"（除 SLNB 一页），记录本倾向明显但未越红线。 |
| ④ | 营养 / 心理完整度（身体意象、性健康是否只有名称） | **WARN** | 不止名称但明显偏薄：`care/intake` 只有 2 条自由文本进食记录 + 一句"给医生/营养科看"（`app.js:688-696`；`demo-data.js:876-887`），未回答 26 号 L6 的"吃得下吗 / 掉的体重要紧吗"；`mind/body` 2 条 private 文本、`mind/intimacy` **仅 1 条** private 文本（`demo-data.js:941-961`），无结构化话题卡（疤痕暴露、伴侣沟通、生育与避孕、影响面），且整条心理线**没有"能跟谁说"的支持资源/转介页**（26 号 L7 的示例页缺失）。FCR 双人记录本身是本包做得最实的一页（`app.js:718-728`）。 |
| ⑤ | 四核心模块 | **PASS** | 包内未定义"四核心模块"一词，按 K1/K3/K5/K6 映射为：自查档案（5 页）、我的分期与分子（4 页）、免疫与靶向反应（3 页 / 四轨）、双轨随访（4 页）。四条均为独立一级线且有二级结构（`app.js:49-68`），与 SPEC §4、DIFF-MATRIX、INTERACTION-DESIGN 的场景落页对应。建议 G1 把"四核心"写进 SPEC，避免后续验收口径漂移。 |
| ⑥ | 双主体（配偶代检 / private） | **WARN** | 看板 4+4 入口、照护者代记徽章、FCR 双源并列、代拍/代记 author_role 都已落地（`app.js:378-400, 220, 718-728`）。两处不足：① 代检入口「背部盲区代检」落在 `self/acral`，但该页通篇第二人称对"你"说话（"脱鞋…节奏由你设定"），照护者视角未切换，只有 demo2 第 6 步一句"由照护者拨开头发看"（`demo-data.js:1382-1386`）；② private 红线被 FCR 击穿，见 P0-4。 |
| ⑦ | 范围适当性（30 页签顶格） | **WARN** | 10 一级 / 30 二级，正好压在 26 号的 8–10 与 24–30 双上限，零余量；单线最大 5（自查）≤6，二级为 0 的线 2 条（看板、一图秀）未触发"平铺页"判据。数字合规，但 `family-landscape §6.7` 自己写明"再加任一二级必须同时砍一个"，说明结构已无扩展空间；DIFF-MATRIX 的页树与实现对不上（P1-1），"顶格"是在两处计数互相抵消后成立的。 |
| ⑧ | 医学时效（NCCN 3.2026 / nivolumab / NMPA 412） | **WARN** | 三项均有出处与状态标记：NCCN 已从任务给的 2.2025 漂移到 3.2026（`USER-RESEARCH.md:11`；`medical-constraints.md:13,446,493`）；nivolumab 中国说明书无黑色素瘤适应症（`medical-constraints.md:191`）；NMPA 412 反爬、批件号一律"待核验"（`medical-constraints.md:418`）。扣分在传播：这三条只活在 USER-RESEARCH / 研究笔记，未进 SPEC、INTERACTION-DESIGN 或原型文案；原型反而给出与"中国可及性"相冲突的演示（P0-1、P1-5），且 demo 的 `sourceNote` 只写"NCCN 2026"不带版本（`demo-data.js:8`）。 |
| ⑨ | S→F→A 同源（13 路径 vs 页面 key） | **FAIL** | 13 条 SCENES 的 page/sub 全部命中 RENDERERS（`app.js:85-99` vs `:808-822`），chip 文案与路径表逐条一致，这部分成立。但不成立的是覆盖数字与页树：① `INTERACTION-DESIGN.md:36` 写"X2 实测 stepJumps = 30"，源码实际只有 **20 个唯一 data-step 目标**（21 处）；② 按"每个 (view,sub) 被≥1 条路径经过"复算，`stage/record` 与 `mind/feelings` **两条没有任何场景或 data-step 指向**（只能点页签进入），孤儿页 = 2 而非 0；③ `DIFF-MATRIX.md:10` 写"IO 4 页 / 随访 3 页"，实现与 `INTERACTION-DESIGN.md:36` 都是"IO 3 / 随访 4"，两份权威件互相矛盾。 |
| ⑩ | 假设不冒充事实 | **PASS** | 0 访谈、F 层句子为"文献语境改写"、试验线索"登记状态，未核实"、照片对比不声称可早期识别、外壳未实现部分主动声明"不冒充已完成"（`INTERACTION-DESIGN.md:94-102`；`SCENARIOS.md:3`；`family-landscape.md:11`）。H1–H10 以待验证假设形式列出（`user-research.md:442-449`）。瑕疵是把"患者自己发现 53%"概括成"自检发现"（P1-6），属标题级措辞，不改结论。 |
| ⑪ | 差异化真实性（vs cervical 30% 复算；抽自查/IO 两线） | **PASS** | 复算成立：cervical 12 条一级与 MEL 10 条并排，**完全同名恰为 3 条**（看板、治疗历程、病情一图秀）= 30% ≤70%；按 6.7 的宽松口径（+我的分期与分子、+营养防晒体力）为 5/10 = 50%。实质差异也成立：自查档案是家族首个"确诊前"整线，肢端翻译卡（鸡眼/灰指甲/甲下血肿/摩擦淤青）与足底前置部位码在中国语境下有独立价值；IO 四轨 + "药还是病"只自评不归因，与 cervical 的放疗长期影响不是同一结构。需要提醒：30% 是**精确字符串**口径，语义同名实为 7/10 = 70%（压在线上），"新增结构位 5 条"里有 3 条在 cervical 有语义前身（心理支持、复诊准备、营养支持），不宜把差异化说满。 |
| ⑫ | 红线（K1 措辞 / 未检测≠阴性 / IO 不归因 / private 三出口 / AI 候选闭环 / "消除复发恐惧"禁） | **FAIL** | 五项过、一项破。过：K1 措辞——"看到这些，建议让皮肤科看"配有"只列信号，不做分诊""本页不出现符合几条=风险""不写先等等看"（`shots/self-acral-demo1.png`；`demo-data.js:347`），在 `family-landscape §6.6` 的允许线内，未写良性/恶性/不像；未检测≠阴性在分子页与看板常驻（`app.js:409, 540-548`）；IO 不归因——无 causality 列、自评四选一、明写"界面不出现「这是药引起的」"（`app.js:589-604`）；"消除复发恐惧"0 处（仅出现在禁令陈述里）。破：**private 三出口**——交互矩阵把"FCR / 身体意象 / 亲密"整行标为默认 private（`INTERACTION-DESIGN.md:56`），但 FCR 无 visibility 字段，默认进入导出摘要与 AI 上下文（`app.js:200, 804`），且"逐条显式勾选授权"只有文案、无任何勾选控件（`app.js:412, 735`）。AI 候选闭环为 UI 四步可走（填草稿→候选卡→确认位→拒收消失），但确认只弹 toast、不写事实层（P1-9）。 |
| ⑬ | IP1–IP10 抽查 | **FAIL** | IP1 WARN：`INTERACTION-DESIGN.md` 齐三表，但 `DESIGN-SESSION.md` 与 `PROTOTYPE-REVIEW.md` 仍是空模板，无 G1 签认记录，且 HTML 先于签认已产出（28 号 IP1 的"已签认"未满足）。IP2 FAIL：见 ⑨（孤儿 2、stepJumps 不可复现）。IP3 PASS：chip/任务卡文案与路径表逐字对应（唯一瑕疵：chip 渲染带 `S01` 前缀，P2-2）。IP4 PASS：所有非看板页统一渲染 `.back-row`（`app.js:837`），toast 亦带回看板。IP5 WARN：10 条一级线均有 AI_DEMOS 与 accept/reject，但确认不落事实层。IP6 PASS：每页显式编辑 ≤1，表单 3–5 字段（`openForm` 自检文案 `app.js:894`）。IP7 WARN：只有 `<input type="number">`，无数字键盘组件。IP8 PASS：`不可恢复` 0 处，删除=登记新版本。IP9 WARN：AI 确认与手工保存未写同一条版本链。IP10 PASS：AI 示例只填 input、不发送（`app.js:1024-1034`）。 |

**计数：13 项 = PASS 4 / WARN 6 / FAIL 3。**

## 二、专项扫描

| 扫描 | 结果 | 证据 |
| --- | --- | --- |
| 其他病种残留（prototypes/ 与 MEL 设计文档） | **不通过** | `style.css` 5 处：`:2`"甲状腺蝶翼意象"、`:200`"胸水最近事件 + mMRC"、`:238`"石棉与材料"、`:288`"胸水与呼吸"、`:339`"mMRC 等"；`app.js` 3 处 THY 沿革注释（`:11,:12,:249`）。`.mmrc-*` / `.sym-duo` 等类在 app.js 中 0 引用（死代码）。`docs/` 侧 `胸水/石棉/碘131/PleuraPal/ThyPal` 均为 0；`甲状腺` 的 4 处是合法 IO 内分泌语境（DIFF-MATRIX、DEV-REQ、TSH 目录）或 31 号 BACKLOG 的其他病种行；`glioblastoma` 3 处属样板引用（28 号、30 号、INTERACTION-DESIGN 抬头）。 |
| AI 按钮通道前缀一致性 | **通过（附校验缺口）** | 页面侧 `postMessage({type:'mel:agent-draft'})`（`app.js:1031`）与外壳侧 `data.type !== 'mel:agent-draft'` 判定（`lib/client.js:19`）一致；外壳只存草稿不发送。缺口：`onMessage` 未校验 `event.source` 与 origin（cervical 样板有）；`lib/client.js` 仅 59 行骨架，无 `ensureSession`，而 INTERACTION-DESIGN §三写"无会话时先 ensureSession 再填草稿"，与 §五"未实现"自相矛盾（P1-7）。 |
| SVG 根 `class=chart` 与 computed `fill=none` | **通过** | 根节点 `<svg class="chart" …>`（`app.js:343`）；`.chart .line{fill:none}`（`style.css:388`），path 无内联 fill 覆盖；`.chart .pt` 为圆点。与 INTERACTION-DESIGN 的 `paths=4 / dots=19 / nodes=5 / fill=none` 口径一致。 |
| `smoothPath` 是否 Fritsch–Carlson | **通过** | `app.js:249-271` 为单调三次 Hermite：加权调和平均求斜率 + `q=a²+b²>9` 时按 `3/√q` 缩放，属标准 Fritsch–Carlson 单调性钳制，非 Catmull-Rom。 |

## 三、P0（阻塞 G2 签认）

| ID | 问题 | 落点 | 修法 |
| --- | --- | --- | --- |
| P0-1 | demo2 为 **IB 期（pT2aN0M0）**，却给"达拉非尼 + 曲美替尼辅助治疗 12 个月"。BRAF/MEK 辅助适应症为 III 期（COMBI-AD），IB 期不应辅助靶向；而全台口径是"只引用医生原文"，等于把不合指南的方案包装成可信病历。 | `prototypes/v0.2/demo-data.js:1460, 1541-1549, 1575-1576`；对照 `USER-RESEARCH.md:11`（曲美+达拉仅 III 期辅助） | 二选一：把 demo2 改为 IIIB/IIIC 期，或改为"观察 + 双轨随访"、删除靶向辅助与相关周期；改后重跑截图与 `exportMarkdown` 断言。 |
| P0-2 | ABCDE 说明卡的 E 只有 **Evolving · 变化**（两个档案同），缺中国指南的 **E = Elevation（隆起）** 与甲下 ABCDEF。本包医学底稿已把"两套 E"列为必须双记的修正项，产品却只落一套，且未声明口径来源。 | `demo-data.js:374, 1442`；`medical-constraints.md` F1.1；`USER-RESEARCH.md:11` | E 卡改为双口径并列（Elevation / Evolving 各一句 + 来源），甲下页补 ABCDEF 或明写"甲下另有 ABCDEF，本卡不展开"；同步分子页式的"口径常驻句"。 |
| P0-3 | **G2 的 X1/X2 自验数字不可复现**：`stepJumps = 30` 实际 20 个唯一目标；`孤儿页 = 0` 实际 2（`stage/record`、`mind/feelings`）。以不可复现数字作为 G2 签认证据，等同 22 号明令禁止的"口头说都点过了"。 | `INTERACTION-DESIGN.md:36, 83-84`；`app.js` data-step 全集；`PAGES/SUBPAGES` `:49-68` | 补页内 `data-step` 链（至少 record、feelings 各一条），重跑无头脚本，把真实计数（取证命令 + 输出）写回 §四；数字对不上就改文档，不许留旧数字。 |
| P0-4 | **private 红线被 FCR 击穿**：矩阵把 FCR 与身体意象/亲密同列"默认 private"，但 FCR 记录无 `visibility`，默认进入导出摘要的"我的看法与担心"区与 `aiPromptWithCtx('mind')` 的 AI 上下文；"逐条显式勾选授权"只有说明文字，无控件。 | `INTERACTION-DESIGN.md:56`；`app.js:200, 804`；无授权 UI（`:412, 735` 仅文案） | 二选一并写死：① 给 FCR 加 `visibility`，默认 `private`，导出/AI 上下文按字段过滤，导出预览显示"已过滤 N 条"；② 修改矩阵，明确 FCR 为"患者确认后可导出"，并补"逐条勾选"控件。无论哪种，三出口（导出 / AI / 摘要）要有可断言代码而非文案。 |

## 四、P1（签认前应修，或 G1 明确接受并留痕）

| ID | 问题 | 落点 |
| --- | --- | --- |
| P1-1 | DIFF-MATRIX 页树与实现/交互文档不一致：IO 写 4 页（实现 3）、随访写 3 页（实现 4），总数 30 靠两处错误互相抵消；"我的瘤（报告原文）"在实现里并入病理页而非独立页签。 | `docs/DIFF-MATRIX.md:10` vs `docs/INTERACTION-DESIGN.md:36`、`app.js:63-68` |
| P1-2 | 旗舰差异化"确诊前第一入口"未演示：两个档案均已确诊，看板无"确诊前只显示自查卡 + 何时看皮肤科"的条件态（`family-landscape §6.5` 明确要求条件显示）。评审只能相信文案，看不到形态。 | `demo-data.js:387, 1466`；`app.js:378-413` |
| P1-3 | 其他病种残留与死代码：`style.css` 5 处胸水/石棉/mMRC/甲状腺，`app.js` 3 处 THY 沿革注释；`.mmrc-*`、`.sym-duo` 无引用。属三次 fork 残留教训的复发。 | `style.css:2,200,238,288,339`；`app.js:11,12,249` |
| P1-4 | 营养/心理线内容薄且缺资源位：无"能跟谁说"页（心理支持资源/转介）、无身体意象影响面与亲密话题卡；营养只有自由文本。 | `app.js:688-746`；`demo-data.js:876-961` |
| P1-5 | 帕博利珠单抗辅助 demo 未带中国说明书口径：本包已认定"帕博利珠仅晚期二线、辅助免疫未见于中国说明书"，demo1 却以 IIB 辅助免疫为当前方案且无任何可及性提示。 | `demo-data.js:473-481, 507-508`；`USER-RESEARCH.md:11`；`medical-constraints.md:191` |
| P1-6 | 证据术语漂移：原文是"由患者自己发现 53%"，摘要写成"53% 自检发现"；肢端 50% 的原文主体是"亚洲及有色人种"，摘要有滑向"中国 50%"的读法。方向与数字未错，但概念被放大。 | `USER-RESEARCH.md:5-9` vs `research-notes/user-research.md:14-15,201-204` |
| P1-7 | 外壳 AI 通道未校验 `event.source`/origin；§三与 §五对 `ensureSession` 的表述矛盾；`lib/client.js` 仍为 59 行骨架（family-landscape 记为 M5 第一优先项）。 | `lib/client.js:19-27`；`INTERACTION-DESIGN.md` §三 / §五 |
| P1-8 | IP7 未落地：数字输入只用 `type="number"`，无"键盘组件"；抄化验单场景的 5 秒目标无法验证。 | `app.js` `openForm`（`:890-894`） |
| P1-9 | IP5/IP9 只到 UI：AI 候选"确认入库"弹 toast，不写事实层，也不与手工通道共用版本链；"四步 1111"是界面态而非数据态。 | `app.js` `cand-ok` 处理器（`:1034`） |
| P1-10 | 代检视角未切换：照护者入口落 `self/acral`，页面仍以本人第二人称叙述；demo2 仅第 6 步提到照护者。 | `app.js:386`；`demo-data.js:1382-1386` |

## 五、P2（可排期）

| ID | 问题 | 落点 |
| --- | --- | --- |
| P2-1 | 照片提示重复句："照片仅本机保存（接入后）。照片仅本机保存（接入后）；演示用…"（加粗前缀与 `photoNote` 首句重复），出现在自查 map/lesion 与 IO 皮疹页，截图可见。 | `app.js:429,443,601`；`demo-data.js:9,243,613` |
| P2-2 | chip 渲染为 `S01 痣变了`，路径表写「痣变了」，IP3"逐字一致"处于边缘（功能无影响）。 | `app.js:390` vs `INTERACTION-DESIGN.md` §一 |
| P2-3 | 任务卡「看我的分期与分子」落 `stage/pathology`，而 S02 首步是 `stage/slnb`；入口文案对、落点与路径首步不一致。 | `app.js:379` |
| P2-4 | demo2 自查节奏写"默认每 2 个月一次"，交互文档与 demo1 均为"默认每月"，同一页面两套默认值。 | `demo-data.js` `acral.rhythm`（demo2）vs `INTERACTION-DESIGN.md:44` |
| P2-5 | 演示数据含病历原文"建议对照观察"（K1 词表的"观察"张力）。引号内属医生原文，合规；但作为演示样例会削弱"不写观察即可"的说服力，建议换句。 | `demo-data.js:698, 1761` |
| P2-6 | MEL 文档抬头引用 `thyroid-workbench / glioblastoma-workbench / mesothelioma-workbench` 作为参考实现，非医学残留但与"去病种化"自查口径不一致，建议改为"家族参考实现"。 | `INTERACTION-DESIGN.md:4-5` |
| P2-7 | G1 签认记录仍是空模板：`DESIGN-SESSION.md` 无决策行，`PROTOTYPE-REVIEW.md` 无版本/hash/确认人；G1 三个结构决策点（自查独立成线、IO 四轨 vs 合并、肢端命名）未落"确认人/日期"。 | `docs/DESIGN-SESSION.md`、`docs/PROTOTYPE-REVIEW.md` |

## 六、缺口（本轮无法验证）

1. **0 真实访谈**；中国特异性 FCR 患病率、自查比例、照护者数据均未找到（`USER-RESEARCH.md:13-14`），"自查是主动形态"只能算文献推断，不能算中国用户实证。
2. **确诊前形态无原型**：没有 pre-diagnosis 档案，无法走查"第一次记录 → 预约皮肤科"的完整早期流。
3. **照片对比无验证证据**：同尺度留档的价值来自 NCCN 患者版，手机照片能否提高早期识别没有证据（`INTERACTION-DESIGN.md:97`），评审不为其效果背书。
4. **irAE 时间窗来自泛癌种**（`medical-constraints.md:195`），MEL 专属 IO 时间窗未取得。
5. **CSCO 2025 全文未取得、NMPA 批件号待核验**（412 反爬），中国适应症表述只能停在"说明书级"。
6. **外壳未接原生会话**：`ensureSession`、真实草稿注入、事件源校验均未实现，AI 按钮只到 `postMessage` + 本地 state。
7. **未做用户逐页确认**：`PROTOTYPE-REVIEW.md` 空白，G2 的"用户确认范围/原话/日期"不存在。
8. schema/dsh/装机不在本次范围，未审。

## 七、判断

**G1：可签（附条件）**。范围、场景、红线映射、四核心线与差异化论证成立；三个结构决策点仍需在 `DESIGN-SESSION.md` 留"确认人 + 原话 + 日期"，并把 P1-1（页树计数）与 P2-7 一并处理。

**G2：修订后签**。结构与交互骨架达到可签水平（10 线 30 页、路径闭环、AI 候选四步、图表口径、窄宽与 computed fill 均成立），但 4 个 P0 中任一项都会在真实使用或医学审核时暴露：IB 期辅助靶向（医学可信度）、ABCDE 缺 Elevation（与自家医学修正冲突）、X2 数字不可复现（G2 证据失效）、FCR 默认 private 泄漏（红线）。修完 P0 并重跑 X1–X4 出可复现数字后，可签 G2；P1 建议同批修，至少 P1-1/P1-3/P1-5 不应带入开发。

**结论：不可在原样状态下签 G2；修订后可签。**

## 八、评审声明

本表只审设计方案与原型，不代表发布已授权、包已安装、Desktop 已加载或市场已收录。发布决策与证据分别记录在 `docs/RELEASE.md`、`docs/ACCEPTANCE.md`；市场流程见 `docs/10-MARKET-PUBLISHING.md`。自审与独立模型审查分开，本文件的结论仅来自独立子代理对 HEAD `53214c9` 的静态走查与截图核对。
