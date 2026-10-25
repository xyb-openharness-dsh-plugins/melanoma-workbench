# 疾病概要 · 皮肤黑色素瘤

> 本项目实例文件，由 `xyb-workbench-starter` 的 `templates/DISEASE-PRIMER.md` 复制而来。
> 规范：`docs/36-DISEASE-PRIMER.md`。填完打勾，未填的写「本台尚未整理」——**不许删段**。

- 项目 / 品牌：小痣宝 MolePal
- 病种：皮肤黑色素瘤（Cutaneous Melanoma）
- 最后更新：2026-10-25
- 数据文件：`prototypes/v0.2/primer-data.js`（`window.DISEASE_PRIMER`）
- README 对应段：`## 疾病概要`

## 1 定义（`definition`）

黑色素瘤是起源于黑素细胞的恶性肿瘤，可发生在皮肤、黏膜、眼葡萄膜等部位；本台只整理皮肤型。中国卫健委《黑色素瘤诊疗指南（2022 年版）》记载，亚洲及有色人种原发于肢端的黑色素瘤约占 50%，黏膜型 20%–30%，白种人皮肤型约 90%。分期按 AJCC 第 8 版；分子分型常看 BRAF V600、NRAS、c-KIT、TERT。自查口诀有两套：中国指南写 ABCDE 的 E 是 Elevation（隆起），NCCN 与美国癌症协会写 E 是 Evolving（演变），甲下另有 ABCDEF；两套并存，不合成一套。

- 不写「预后差 / 恶性程度高 / 发展快」这类判读。
- 亚型名字一律用 WHO 现行版本的写法，不混用旧名；旧名要保留时写「旧称 …」。
- 本台的边界：不判断一颗痣是良性还是恶性，形态变化只做记录与时间轴。

**来源**：国家卫生健康委员会 · 黑色素瘤诊疗指南（2022 年版）· 2022-04 · 原件已取得 · 页码 P2–P3、P5–P6 ｜ NCCN · NCCN Guidelines for Patients: Melanoma 2026 · 基于 V1.2026（2026-02-17）· 原件已取得 · 页码 P6、P14 ｜ AJCC · Cancer Staging Manual · 第 8 版（出版年份未核实）· 未取得原件，据二次来源 · 页码待核

## 2 医学资料规范和指南情况（`evidence`）

| 机构 | 文件 | 版本 / 年份 | 原件 | 本台的用途 |
|---|---|---|---|---|
| 国家卫生健康委员会 | 黑色素瘤诊疗指南（2022 年版），24 页 | 2022-04 发布 | 已取得（PDF） | 中国口径的分期、SLNB 适应证、BRAF/CKIT/NRAS 检测、国内上市靶向药清单 |
| NCCN | NCCN Guidelines: Melanoma: Cutaneous | V3.2026（官网页面显示） | 未取得（全文需授权，仅元信息） | 辅助与晚期治疗的分层结构 |
| NCCN | NCCN Guidelines for Patients: Melanoma 2026 | 基于 V1.2026，2026-02-17 | 已取得（PDF） | 患者版表述、SLNB 阈值、随访间隔、irAE 清单 |
| CSCO | CSCO 黑色素瘤诊疗指南 | 2025 版（据学会入口） | 未取得（全文需购买） | 仅记存在，本台未引用其条文与页码 |
| ASCO | Management of irAEs in Patients Treated With Immune Checkpoint Inhibitor Therapy | 2021 版 | 未取得（据二次来源） | irAE 的器官谱与管理原则 |
| AJCC | AJCC Cancer Staging Manual | 第 8 版（出版年份未核实） | 未取得 | 分期字段口径 |

- 一台一表，不合并。
- 未取得原件的（NCCN 临床版、CSCO 2025、ASCO 2021、AJCC）只写「存在、大致讲什么」，不引用具体条文与页码。
- 本项目只有皮肤型的分期口径；黏膜型、葡萄膜型另案，本表不做换算。

**来源**：见上表逐行。

## 3 目前治疗全景概要（`landscape`）

按**病期 / 线序**分组，每组只列「指南列举过的手段类别」，不排序、不比优劣。

### 3.1 早期 · 可切除（0–II 期）

- 原发灶切除并送病理：切缘宽度按 Breslow 厚度分档，数值写在手术与病理记录里。取舍属于医生判断。
- 前哨淋巴结活检（SLNB）：中国指南写 Breslow 厚度大于 1 mm 推荐；NCCN 患者版写 T1b 起「可能推荐」、T1a 通常不推荐。两套阈值并存，本台不换算。
- 确诊路径里的完整（切除）活检：NCCN 患者版写浅表刮取在怀疑黑色素瘤时一般不做；中国指南写一般不采取削刮和穿刺。

### 3.2 III 期 · 术后辅助

- BRAF V600 突变者：达拉菲尼联合曲美替尼，中国说明书含「III 期完全切除后的辅助治疗」。
- PD-1 抑制剂辅助：NCCN 列出；本台所见中国说明书版本未收录辅助适应症，中国可及性需另核。

### 3.3 晚期 · 不可切除或转移

- BRAF+MEK 靶向：达拉菲尼+曲美替尼、维莫非尼（限 BRAF V600 阳性）；康奈非尼+比美替尼在中国医药信息查询平台站内检索无结果，标待核验，不作为可及选项。
- PD-1 抑制剂：帕博利珠单抗（所见说明书为经一线治疗失败）、特瑞普利单抗（所见说明书为既往接受全身系统治疗失败）。
- CTLA-4 抑制剂：伊匹木单抗单药；与纳武利尤单抗联合的中国适应症未在所见说明书中体现。
- KIT 抑制剂：伊马替尼、尼洛替尼，卫健委 2022 版列为国内上市药物，具体适应症需逐一核对说明书。

### 3.4 需要单列的情形

- 黏膜型、葡萄膜型、儿童黑色素瘤各有自己的分期与治疗路径，本台不把皮肤型的模板套过去。
- 药物卡片分三层：中国说明书适应症 / 中国指南提及 / 国际指南推荐，三层不合并成一句「适合你」。

**这一段末尾必须有固定出口（原话照抄，不要改写）：**

> 以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。

**来源**：国家卫生健康委员会 · 黑色素瘤诊疗指南（2022 年版）· 2022-04 · 原件已取得 · 页码 P5–P6、P12–P15 ｜ NCCN · NCCN Guidelines for Patients: Melanoma 2026 · 基于 V1.2026 · 原件已取得 · 页码 P20–P21、P42–P57 ｜ 中国医药信息查询平台 · 七份药品说明书 · 访问 2026-10-24 · 未取得原件，据二次来源 · 页码待核

## 4 发展趋势（`trend`）

只写**已发生的事实**，每条都带日期或版本号。五类白名单（`docs/36-DISEASE-PRIMER.md` §2.3）：

1. 指南版本更替 —— 任务书指定的 NCCN V2.2025 已被 V3.2026 取代（官网页面显示 V3.2026）；患者版 2026-02-17 发布，基于 V1.2026，与临床版不是同一版本号。
2. 监管批件 —— 曲美替尼联合达拉菲尼的「III 期完全切除后辅助治疗」已见于中国说明书；批准日期与批件号未核实（NMPA 官网 412）。纳武利尤单抗所见中国说明书未含黑色素瘤适应症。
3. 在研登记规模 —— 2026-10-25 快照，去重后 294 条（CTV 186 / 中国药物临床试验登记与信息公示平台 108）；登记状态未核实，**阶段分布在本次采集中未取得**（jsonl 无 phase 字段）。
4. 分类体系 —— 本台按 AJCC 第 8 版整理；项目资料未见更新的分期版本记载，是否有新版未核实。
5. 指南结构 —— 卫健委 2022 版没有随访章节；CSCO 2025 全文未取得，本台随访间隔数字来自 NCCN 患者版与 AIM，不是中国指南原文。

**禁止**：展望、预测、推荐、优劣比较、上市时间猜测、疗效数字对比。禁止词表见规范 §2.3，`check-conformance.mjs` 的 `primer/趋势段` 会扫。

**来源**：NCCN · Guidelines: Melanoma: Cutaneous / for Patients · V3.2026 / 2026-02-17 · 临床版未取得原件（仅元信息）、患者版原件已取得 ｜ 中国医药信息查询平台 · 曲美替尼片、纳武利尤单抗说明书 · 访问 2026-10-24 · 未取得原件，据二次来源 · 批准日期与批件号未核实 ｜ 本项目登记快照 · research/melanoma-cancer/manifest.json · 2026-10-25 · 原件已取得 ｜ 国家卫生健康委员会 · 黑色素瘤诊疗指南（2022 年版）· 2022-04 · 原件已取得

## 5 落地清单

- [x] `prototypes/v0.2/primer.css`（从 `assets/patterns/disease-primer.css` 逐字节复制，未改颜色变量与结构）
- [x] `prototypes/v0.2/primer.js`（从 `assets/patterns/disease-primer.js` 逐字节复制，未改逻辑）
- [x] `prototypes/v0.2/primer-data.js`（本文件四段转成 `window.DISEASE_PRIMER`）
- [x] `index.html` 三处引用：`<link rel="stylesheet" href="primer.css">` / `<script src="primer-data.js">` / `<script src="primer.js">`
- [x] 顶栏出现「?」：模块自动插进 `.top-actions`，本项目无需手写按钮
- [x] README 的 `## 疾病概要` 四段正文写好，小标题与数据文件一致
- [x] `node scripts/probe-disease-primer.mjs --port 8131 --url http://127.0.0.1:8131/prototypes/v0.2/index.html` 9/9 全绿；`--self-test` 3 条 FAIL（P3 / P5 / P8）

## 6 验收（P1–P8）

| 编号 | 判据 | 结果 |
|---|---|---|
| P1 | 顶栏有可点「?」，aria-label 说明四段 | PASS — text="?"，label「疾病概要：定义、医学资料与指南情况、治疗全景、发展趋势」 |
| P2 | 整页面板，四段齐全且顺序为 定义 → 指南 → 治疗全景 → 趋势 | PASS — definition › evidence › landscape › trend |
| P3 | 面板宽高 ≥ 视口 90% | PASS — 1243×825 / 视口 1280×860 |
| P4 | 打开压一条 history，`history.back()` 收起 | PASS — history.length=3，返回后 open=false、hash="" |
| P5 | 「返回」「关闭」两个独立入口 | PASS — back=true close=true same=false |
| P6 | 关闭后焦点回触发按钮、滚动位置不变 | PASS — focusOnTrigger=true，scrollY 260→260（首轮曾 FAIL，见 §7） |
| P7 | Esc 只退一层 | PASS — open=false，URL 仍在 /prototypes/v0.2/index.html |
| P8 | 四段齐全、每段有来源、趋势段无禁止词 | PASS — 4 段、4 组 sources、禁止词 0 |

`--self-test` 记录：P3 520×420、P5 back=null、P8 命中「有望 / 未来可期」，共 3 条 FAIL，闸门会报红。

## 7 本项目教训

1. **P6 首轮 FAIL（260→0）不是模块的锅，是本台自己的路由。** `app.js` 的 `hashchange` 监听会 `applyHash(); render();`，而 `render()` 末尾写死 `window.scrollTo(0, 0)`；概要用 `history.back()` 收起时 hash 从 `#disease-primer` 变回去，触发重渲染，把 `primer.js` 刚恢复的滚动位置又冲成 0。修法在页面侧：`render(opts)` 增加 `keepScroll`，`hashchange` 时若路由没变（概要用的是 `pushState`，不改变本台 page/sub）就不跳页首。模块与探针一个字节都没动。
2. **NCCN 版本差点按任务书抄成 2.2025。** 本项目 `docs/USER-RESEARCH.md:11` 与 `research-notes/medical-constraints.md:13` 都记录官网已到 3.2026、患者版基于 V1.2026；数据与 README 都写实际版本，并在趋势段把这次版本更替本身作为一条事实。
3. **「首选」是从 NCCN 原文顺手带出来的判断词。** 写「完整切除活检为首选方式」时被自己的词表拦下，改成「完整（切除）活检，浅表刮取…一般不做」——保住原文信息，去掉评价。同理，卫健委指南与 CSCO 的缺口一律写「未取得 / 待核验」，不补年份、不补页码。
