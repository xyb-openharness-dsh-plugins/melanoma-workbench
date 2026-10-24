# 黑色素瘤患者工作台｜医学约束与诊疗路径事实稿

- 版本：v1.0（2026-10-24）
- 范围：皮肤黑色素瘤为主，覆盖肢端/黏膜/甲下；葡萄膜仅标注另案
- 用途：产品字段设计、患教文案边界、原型走查的医学事实底稿
- 证据分级：**A**＝≥2 个独立可信来源交叉印证；**B**＝单一可信来源；**待核验**＝未取得全文或未获官方原库确认
- 硬边界：本稿是**解释素材**，不是诊断、不是处置建议、不是适应证判断。产品输出只能是“记录/提示/联系医生”，不能是“你有/你没有/你该用/你不用”。

---

## 0. 先读：本稿的三条使用规则

1. **指南口径必须带来源和版本。** 中国口径以国家卫健委《黑色素瘤诊疗指南（2022年版）》为基线（S01），CSCO 2025 全文未取得，凡涉及“中国最新推荐”的条目一律标 **待核验**。任务指定的 NCCN 2.2025 在 2026-10 已被 3.2026 取代（S03），本稿按官网当前版本引用，不沿用旧版页码。
2. **中国可及性 ≠ 国际指南推荐。** NCCN 2026 中的辅助免疫、nivolumab 黑色素瘤适应症等，在中国说明书层面并不都成立（见 §11）。
3. **人话解释不是判断。** 所有“这意味着……”句式只解释名词和常见区间，不推断个体预后、不替代病理/分期/医嘱。

---

## 1. 自查与早期识别

### 1.1 患者视角关键事实

- **F1.1 ABCDE 有两套“E”。** 中国卫健委指南写作 E＝Elevation（隆起），并明确提醒该法则“没有把黑色素瘤的发展速度考虑在内，如几周或几个月内发生显著变化的趋势”；NCCN/ACS 写作 E＝Evolving（演变）。产品不能只写一套还冒充“国际统一”。（S01 P2-3；S04 P14；S08）
- **F1.2 丑小鸭征是独立线索。** “a spot that looks different from other spots on your skin”，即与本人其他痣/斑点明显不同，比逐条对照 ABCDE 更适合多痣人群。（S04 P6；S08）
- **F1.3 中国指南只写“定期自查”，没有给固定频率。** 高危人群定义包括严重日光晒伤史、皮肤癌病史、慢性摩擦/切割/针挑/绳勒等刺激；建议“定期自查，必要时到专科医院就诊，不要自行随意处理”。（S01 P2）
- **F1.4 国际患者教育给了一个可操作频率，但性质是“良好实践”。** NCCN 患者版：“It's good practice to look at your skin for anything unusual at least once a month.” 医生全身皮肤检查“至少每年一次”，高风险可更密。（S04 P88-89）
- **F1.5 照片对比的价值在“同一部位、同一尺度、可回看”，不在“自动识别”。** NCCN 患者版把 total-body photography 列为监测非典型痣的工具之一；没有给出“手机照片可替代医生”的证据。（S04 P89）
- **F1.6 自查有明确盲区。** 甲下、足底、黏膜、无色素性（amelanotic）病损容易被 ABCDE 漏掉；中国指南另给甲下 ABCDEF 法则（见 §10）。（S01 P2-3；S04 P6）
- **F1.7 ABCDE 的直径阈值不是诊断线。** 中国指南写“直径＞5～6 mm 或明显长大时要注意”，并建议“直径＞1 cm 的色素痣最好做活检评估”；NCCN/ACS 写“大于 6 mm（铅笔橡皮大小），但有些黑色素瘤更小”。（S01 P2；S04 P14；S08）
- **F1.8 大多数皮肤黑色素瘤是患者自己先发现的。** MRF：“Most cutaneous (skin) melanomas are found by patients, not doctors.”（S09）

### 1.2 字段建议

| 字段（建议名） | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `self_exam_enabled` | bool | 是否开启自查提醒；默认关，由用户主动开 | 产品设计 |
| `self_exam_frequency` | enum: monthly / quarterly / custom / not_set | 只展示“你设定的频率”，不写“指南要求” | S04（月度为良好实践）；S01（未给频率） |
| `last_self_exam_date` | date | 与下次提醒分离，允许“只记录不提醒” | 产品设计 |
| `lesion_registry` | array | 每个斑点一条：部位、左右、发现日期、大小、照片集 | S04 |
| `body_site_code` | enum + 自由文本 | 必须含足底、足趾、手指末端、甲下、生殖器、口腔等中国高发部位 | S01 P1；S04 P6 |
| `abcde_flags` | object: A/B/C/D/E each bool+unsure | 允许“不确定”；E 同时记录 `elevation` 与 `evolving` 两个口径 | S01；S04 |
| `ugly_duckling` | enum: no / yes / unsure | 与 ABCDE 并列，不合并成总分 | S04；S08 |
| `change_events` | array: date, type(size/shape/color/bleed/itch), note | 强调“变化”而非单张照片的绝对外观 | S01；S04 |
| `photo_set` | array: date, distance, lighting, scale_ref, consent | 固定距离/光线/参照物；展示“可比性”提示 | S04 |
| `clinician_skin_exam_due` | date | 年检基线；高危可更密，但不自动判定 | S04 |
| `not_diagnostic_banner` | const bool=true | 每次查看病损页固定显示“照片与自查不能诊断” | 本稿边界 |

**展示文案示例（解释不是判断）**
> “E 在中国指南里指‘隆起’，在国际患者教育里常指‘演变’。两者都只是提醒你记录变化，不能判断良恶性。”

### 1.3 来源

- S01 国家卫健委《黑色素瘤诊疗指南（2022年版）》P2-3（ABCDE/高危人群/自查）
- S04 NCCN Guidelines for Patients: Melanoma 2026 P6、P14、P88-89（丑小鸭征、月度自查、年度医生检查）
- S08 ACS Signs and Symptoms（ABCDE、丑小鸭征）
- S09 MRF What Does Melanoma Look Like（患者首诊发现比例）

---

## 2. 确诊路径：皮肤镜 → 切除活检 → 病理

### 2.1 患者视角关键事实

- **F2.1 皮肤镜是“放大看结构”，不是确诊。** 中国指南：“皮肤镜可以弥补肉眼观察的不足，同时可以检测和对比可疑黑色……”；确诊仍靠组织病理。（S01 P3）
- **F2.2 中国指南的活检口径是“完整切除活检优先”。** 切缘 0.3～0.5 cm，切口沿皮纹/肢体长轴；“不建议穿刺活检或局部切除”。（S01 P5-6）
- **F2.3 为什么不做部分活检/刮取（患者最常问）。** 指南原话：“部分切取活检不利于组织学诊断和厚度测量，增加了误诊和错误分期风险。” 直接后果是 Breslow 厚度测不准、溃疡/切缘无法判断、后续扩切范围和分期可能错误。（S01 P6）
- **F2.4 例外：特殊部位/巨大病灶可以切取或环钻。** 颜面、手掌、足底、耳、手指、足趾、甲下，或完整切除无法实现时，“可考虑进行切取活检或者环钻活检”。（S01 P6）
- **F2.5 国际口径有一处需要本地化。** NCCN 患者版说“complete (excisional) biopsy is preferred”，同时认为深刮匙/碟形（saucerization）可用于多数病损，浅表刮取“generally not recommended when melanoma is suspected”。这与中国的“一般不采取削刮和穿刺”并不完全等同；产品面向中国用户时应以中国指南为主，并把国际差异标出来，不能把“deep shave 也可以”直接翻译成“刮一刮也行”。（S04 P20-21；S01 P5-6）
- **F2.6 病理报告必须结构化。** 中国指南建议包含：部位、标本类型、大小/范围、组织学类型、Breslow 厚度、溃疡、Clark 水平、分裂活性、切缘（各切缘距离及切缘病变类型）、微卫星/卫星灶、脉管瘤栓、神经侵犯；前哨/区域淋巴结需报告检出总数、转移数、被膜外受累。靶向相关检测至少 BRAF、CKIT、NRAS。（S01 P9-10）
- **F2.7 诊断困难可申请多家医院会诊/二次病理。** 中国指南明确“建议提请多家医院会诊”；NCI 也把 second pathologist review 列为选项。（S01 P10；S05）
- **F2.8 病理是分期的起点，不是终点。** 临床分期在活检后，病理分期在手术（含 SLNB）后；两者可能不同（upstaging）。（S04 P32）

### 2.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `biopsy_type` | enum: excisional / incisional / punch / deep_shave / superficial_shave / unknown | 记录实际所做，不做“应该做哪种”的推荐 | S01；S04 |
| `biopsy_date` / `biopsy_site` | date / string | 与手术、病理时间线并联 | 产品设计 |
| `biopsy_margin_cm` | number | 记录切缘；中国指南 0.3-0.5 cm 仅作解释卡 | S01 |
| `path_report_file` | file[] | 原件留存；支持拍照/PDF | 产品设计 |
| `breslow_mm` | number | 必须允许一位小数；空值不等于 0 | S01；S05 |
| `ulceration` | enum: yes / no / unknown | 与 T 分期联动但不自动算分期 | S01；S05 |
| `mitoses_per_mm2` | number | 记录“分裂活性”；不同病理科报告格式可能不同 | S01 |
| `margins` | object: deep_mm, peripheral_mm, status | 记录“阴性/阳性/距离”；不写“切干净了” | S01；S04 |
| `microsatellite_satellite` | enum: yes/no/unknown | 影响 N 分期 | S01；S05 |
| `lvi` / `perineural` | enum | 记录即可，不推导预后 | S01 |
| `sln_total` / `sln_positive` / `ene` | number / number / bool | 前哨淋巴结报告结构化 | S01 |
| `second_review` | bool + institution | 标记二次病理/会诊 | S01；S05 |
| `pathology_plain_note` | text（只读模板） | “厚度是显微镜下量到的浸润深度，越深通常风险越高” | S04 P22 |

**展示文案示例（解释不是判断）**
> “部分活检只取到病灶的一小块，病理医生可能量不到最深处，也无法判断切缘。这就是医生通常建议完整切除活检的原因。”

### 2.3 来源

- S01 P3、P5-6、P9-10（皮肤镜、活检方式与理由、病理报告字段、会诊）
- S04 P20-22（活检类型、Breslow/溃疡/核分裂/切缘解释）
- S05 NCI PDQ Melanoma Treatment（活检类型、二次病理）
- S07 ACS How Diagnosed（excisional 为首选；切取用于无法完整切除时）

---

## 3. 分期（AJCC 第 8 版）与前哨淋巴结活检

### 3.1 患者视角关键事实

- **F3.1 T 只看两件事：Breslow 厚度 + 溃疡。** AJCC 8：T1a＜0.8 mm 无溃疡；T1b＜0.8 mm 有溃疡，或 0.8-1.0 mm 不论溃疡；T2 1.01-2.0；T3 2.01-4.0；T4＞4.0；a＝无溃疡，b＝有溃疡。（S05；S01 附录二）
- **F3.2 N 不只看“几个淋巴结”，还看“怎么发现的”和“皮肤/淋巴管里有没有”。** N1a＝1 个临床隐匿（SLNB 发现）；N1b＝1 个临床可发现；N1c＝无淋巴结但有卫星/微卫星/移行转移；N2/N3 依次增加；matted nodes 归入 N3b。（S05）
- **F3.3 M 看“转移到哪”+“LDH 高不高”。** M1a 皮肤/软组织/非区域淋巴结；M1b 肺；M1c 非中枢神经系统内脏；M1d 中枢神经系统；每个后缀 (0) LDH 不高、(1) LDH 升高。（S05）
- **F3.4 患者语言可以这样解释。** T＝原发灶扎多深、表面破没破；N＝有没有走到附近淋巴结或淋巴管；M＝有没有到远处器官；LDH 是“细胞受损时释放的酶”，高不高会影响 M 的细分，但不是诊断转移的敏感指标。（S05；S01 P5）
- **F3.5 前哨淋巴结活检（SLNB）的中国适应证比 NCCN 更“粗”。** 中国指南：“Breslow 厚度大于 1 mm 的患者推荐进行前哨淋巴结活检”；若活检/病理无法获得可靠浸润深度，合并溃疡者推荐 SLNB。（S01 P12）
- **F3.6 NCCN 的阈值更细。** T1b（＜0.8 mm 伴溃疡，或 0.8-1.0 mm 不论溃疡）起进入“可能推荐 SLNB”；T1a（＜0.8 mm、无溃疡、无其他高危特征）通常不推荐。（S04 Guide 6）
- **F3.7 SLNB 结果的含义要分开说。**
  - 阴性：取到的那几个前哨淋巴结里**没有看到**转移，不等于“以后不会转移”，也不等于“治愈”。
  - 阳性：把分期改为 III 期（病理分期），但**不一定立刻做完整淋巴结清扫**；NCI 写明“对于轻微淋巴结病变，可推荐超声主动监测而非更多手术”。（S05；S04 P39-40；S01 P13）
- **F3.8 微转移 vs 宏转移。** AJCC 用“clinically occult（临床隐匿）”与“clinically detected（临床可发现）”区分；患者口语里的“微转移/宏转移”不能自行替代病理报告原词。（S05）
- **F3.9 LDH 不是筛查工具。** 中国指南：“尽管乳酸脱氢酶并非检测转移的敏感指标，但能指导预后”；NCCN 患者版：“血液检查不用于诊断黑色素瘤或监测早期黑色素瘤”。（S01 P5；S04 P27）

### 3.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `ajcc_version` | const "8" | 固定显示版本，避免与旧版混用 | S01；S05 |
| `stage_phase` | enum: clinical / pathologic | 允许同一患者两条分期记录 | S04 P32 |
| `t_category` | enum Tis/T0/TX/T1a…T4b | 由病理字段“建议值”而非自动写死 | S05 |
| `n_category` | enum N0/N1a/N1b/N1c…N3c/NX | 保留“临床隐匿/可发现” | S05 |
| `m_category` | enum M0/M1a…M1d + ldh_flag | LDH 单独字段并参与展示 | S05 |
| `ldh_value` / `ldh_uln` | number / number | 记录原值、上限、单位、日期 | S01；S05 |
| `stage_group` | enum 0/IA/IB/IIA/IIB/IIC/IIIA/IIIB/IIIC/IIID/IV | 必须带 `stage_date` 和 `source` | S05 |
| `slnb_status` | enum: not_done / negative / positive / failed | 阳性再分 `micro` / `macro` / `unknown` | S01；S05 |
| `slnb_date` / `slnb_nodes_removed` / `slnb_nodes_positive` | date / number / number | 与病理报告对齐 | S01 |
| `slnb_plain_note` | text（只读） | “阴性只代表取到的淋巴结里没看到，不代表以后不会转移” | 本稿边界 |
| `stage_explainer` | text（只读） | T/N/M 三行白话 + LDH 一句 | S05 |

**展示文案示例（解释不是判断）**
> “III 期表示肿瘤已经到附近淋巴结或淋巴管，但没有到远处器官。III 期还分 A/B/C/D，具体以病理报告和医生分期为准。”

### 3.3 来源

- S05 NCI PDQ Melanoma Treatment（AJCC 8 T/N/M 全表、SLNB 与主动监测）
- S01 P11-13、附录二（中国 SLNB 适应证、AJCC 8 附录、LDH）
- S04 P31-33、Guide 6（临床/病理分期、SLNB 阈值）
- S12 AIM Stages of Melanoma（患者语言的分期解释）

---

## 4. 分子分型：BRAF V600、NRAS、c-KIT、TERT

### 4.1 患者视角关键事实

- **F4.1 BRAF V600 是“有没有靶点”，不是“严不严重”。** NCCN 患者版：“A BRAF mutation is found in at least half of people who have melanoma of the skin.” V600E 最常见；IHC 可初筛 V600E，未检出时用 PCR/NGS 看 V600K、NRAS、KIT。（S04 P23）
- **F4.2 不同人群/亚型的突变率差别很大。** 一项 32 研究、6299 例的系统综述：BRAF 38.5%、NRAS 16.4%、KIT 10%；BRAF 与浅表扩散型、躯干、转移相关。（S17）
- **F4.3 中国人群的 KIT 不能忽略。** 502 例中国患者：KIT 突变 10.8%，所有亚型都可出现；该队列中肢端 38.4%、黏膜 33.3%。（S16）
- **F4.4 肢端黑色素瘤的驱动基因谱与皮肤型不同。** 34 例肢端黑色素瘤中，仅 38% 有 BRAF/NRAS/NF1 驱动突变；TERT 异常（易位、拷贝数、启动子突变或胚系事件）达 41%。（S18）
- **F4.5 TERT 目前主要是“生物学/预后解释”，不是用药靶点。** 产品可以解释“TERT 与细胞永生化有关，在肢端型里较常见”，但不能写成“有 TERT 就要用什么药”。（S18；本稿边界）
- **F4.6 NRAS 在中国尚无获批的 NRAS 靶向药。** 可解释“NRAS 是另一条生长信号通路”，不承诺药物可及。（S17；S01 P15-16）
- **F4.7 检测样本与时机。** 中国指南把 BRAF、CKIT、NRAS 列为靶向治疗相关分子检测；NCCN 强调晚期/III 期需要时做 BRAF V600。检测应基于肿瘤组织（或细胞学标本），报告要带方法、位点、标本类型和实验室。（S01 P10；S04 P23）

### 4.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `biomarker_gene` | enum: BRAF / NRAS / KIT / TERT / other | 一基因一条记录 | S01；S04 |
| `variant` | string（如 V600E、V600K、exon 11） | 保留原始报告写法 | S04 |
| `test_method` | enum: IHC / PCR / NGS / Sanger / unknown | 方法不同，解释不同 | S04 |
| `specimen_type` | enum: primary / metastasis / blood / cytology | 避免“原发灶阴性就永远阴性”的误解 | S01 |
| `test_date` / `lab` | date / string | 可追溯 | 产品设计 |
| `result` | enum: positive / negative / equivocal / failed | failed 必须单列，不能当阴性 | 产品设计 |
| `china_actionability` | enum: approved / not_approved / unknown / not_applicable | 与说明书适应症联动（见 §11） | S13 |
| `plain_note` | text（只读） | “突变是肿瘤细胞里的一个特征，不等于病情轻重，也不保证某个药一定有效” | 本稿边界 |

**展示文案示例（解释不是判断）**
> “BRAF 是控制细胞生长的一个基因。V600 突变会让这条信号一直开着，所以有针对它的靶向药。但有没有突变、用不用药，要由医生结合分期和中国上市情况决定。”

### 4.3 来源

- S04 P23（BRAF 在皮肤型约一半、IHC→PCR/NGS 路径）
- S17 系统综述（BRAF 38.5%、NRAS 16.4%、KIT 10%）
- S16 中国 502 例（KIT 10.8%；肢端 38.4%、黏膜 33.3%）
- S18 肢端基因组（TERT 41%；BRAF/NRAS/NF1 仅 38%）
- S01 P10、P15-16（中国检测与靶向药物清单）

---

## 5. 免疫治疗与免疫相关不良反应（irAE）

### 5.1 患者视角关键事实

- **F5.1 先用白话区分两类药。** PD-1/PD-L1 抑制剂是“松开免疫细胞的刹车”；CTLA-4 抑制剂（伊匹木单抗）是“更早、更强地松开另一道刹车”。两者都可能带来免疫相关不良反应，联合时更常见。（S21；S04 P44-46）
- **F5.2 “辅助治疗”和“晚期治疗”不是一回事。** 辅助治疗用于术后高风险、影像上看不到病灶的人，目标是降低复发；晚期治疗用于不可切除/转移病灶，目标是缩小和控制。产品必须把 `treatment_intent` 作为一等字段，不能只写“免疫治疗”。（S04 P42；S01 P13-14）
- **F5.3 中国说明书与国际指南存在落差。** 本次所见中国说明书版本中，帕博利珠单抗是“经一线治疗失败的不可切除或转移性黑色素瘤”（附条件批准）；特瑞普利单抗是“既往接受全身系统治疗失败”的晚期黑色素瘤；辅助免疫（pembrolizumab/nivolumab）未见于该版本。NCCN 的 IIB/IIC/III 期辅助免疫不能直接写成“国内可用”。（S13d；S13g；S04 P57）
- **F5.4 irAE 谱要按器官讲，不要只讲“皮疹”。** ASCO 2021 指南覆盖皮肤、胃肠道（结肠炎）、肝（肝炎）、内分泌（甲状腺炎、垂体炎）、肺、肾、神经、心脏等。NCCN 患者版点名：皮疹、腹泻、气短、头痛、甲状腺功能异常。（S21；S04 P46）
- **F5.5 发生时间窗有规律，但不是“过了 12 周就安全”。**
  - 伊匹木单抗 3 mg/kg：2-5 级 irAE 多发生在诱导期 0-12 周，多数在 12 周内缓解。（S20）
  - 23 项试验、8436 例的汇总：全级别 irAE 的中位发生时间 2.2-14.8 周；PD-1/PD-L1 全级别约 8.4 周，≥3 级约 27.5 周；nivolumab+ipilimumab 全级别约 6.0 周。内分泌事件缓解最慢。（S19）
  - 结论：**皮疹/腹泻/肝炎多在早中期，内分泌（甲状腺、垂体）可以晚发且持续**；不能只用“8-12 周”一个窗口做提醒。（S19；S21）
- **F5.6 患者自我观察的“可记录项”。** 腹泻次数与是否带血、皮肤皮疹范围/水疱/口腔溃疡、尿色变深/眼白变黄、持续头痛/视力变化、异常乏力/怕冷/体重变化、气短/干咳。记录后“联系治疗团队”，不自行用激素、不自行停药。（S21；S04 P46）
- **F5.7 患者自评不能替代 CTCAE 分级。** 产品可以记录“轻/中/重/无法判断”和“是否已联系医生”，但不能输出“你这是 2 级，应该……”。（本稿边界）

### 5.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `tx_intent` | enum: adjuvant / advanced / neoadjuvant / unknown | 决定文案模板与随访节奏 | S04 P42 |
| `regimen` | string + drug list | 记录通用名/商品名，避免只写缩写 | S13 |
| `line_of_therapy` | number | 晚期治疗必填；辅助治疗不填 | S04 |
| `start_date` / `end_date` / `cycles` | date / date / number | 与 irAE 时间轴对齐 | 产品设计 |
| `irae_symptom` | enum + 自由文本 | 皮肤/腹泻/肝/甲状腺/垂体/肺/其他 | S21 |
| `irae_onset_date` | date | 自动算“距首剂第几周”，只展示不判断 | S19 |
| `irae_severity_self` | enum: mild / moderate / severe / unsure | 明确写“自我感受，不是医生分级” | 本稿边界 |
| `irae_action` | enum: recorded / contacted_team / visited_clinic / emergency | 记录行动，不生成处置建议 | S21 |
| `labs` | object: TSH, FT4, ALT, AST, TBIL, Cr, glucose | 与检验模块共用；单位/参考区间必填 | S21 |
| `red_flag_education` | const text | “出现便血、黑便、呼吸困难、黄疸、剧烈头痛/视力变化，尽快联系医生或急诊” | S21 |

**展示文案示例（解释不是判断）**
> “免疫治疗的不良反应可以发生在治疗中，也可以发生在停药后。记录症状和日期有用，但不能自己判断等级或决定停药。”

### 5.3 来源

- S04 P42-46、P57（辅助/晚期语境、irAE 清单）
- S19  pooled analysis（发生时间：2.2-14.8 周；PD-1 8.4 周；≥3 级 27.5 周；NIV+IPI 6.0 周）
- S20 伊匹木单抗 irAE 模式（0-12 周）
- S21 ASCO 2021 irAE 指南（器官谱与管理原则）
- S13d、S13g 中国说明书（帕博利珠/特瑞普利适应症）

---

## 6. 随访双轨：皮肤科全身皮肤检查 + 影像

### 6.1 患者视角关键事实

- **F6.1 随访节奏由分期决定，不是“统一三个月”。** NCCN 患者版（2026）：
  - I 期：体检+病史（重点皮肤与区域淋巴结）每 6-12 个月×5 年，之后每年至少一次；影像只在有症状时做。
  - IIA：每 6-12 个月×5 年，之后每年；影像只在有症状时做。
  - IIB/IIC：每 3-6 个月×2 年，之后 3-12 个月×3 年，之后每年；影像可每 3-12 个月×2 年，再 6-12 个月×1-3 年。
  - III 期：每 3-6 个月×2 年，之后 3-12 个月×3 年，之后每年；影像每 3-12 个月×2 年，再 6-12 个月×3 年；3-5 年后不常规影像。（S04 P55、P57、P70）
- **F6.2 患者组织给的 III 期版本更“终身”。** AIM：III 期皮肤检查“每年一次，终身”；体检每 3-6 个月×2 年、3-12 个月×3 年、之后每年；影像（胸 CT、躯干/盆腔 CT、脑 MRI）每 3-12 个月，最多 5 年。（S12）
- **F6.3 “皮肤科全身皮肤检查”与“肿瘤科随访”是两条线。** 前者重点是新发/复发皮肤病灶与淋巴结触诊；后者重点是无症状转移的影像监测。产品应允许两条独立计划，不能合并成一个“复诊”。（S04 P88-89；S12）
- **F6.4 LDH 的定位是“预后指标”，不是“复发筛查”。** 中国指南明确不敏感；NCCN 说只在怀疑远处转移时查。把 LDH 做成“每月必查”是过度医疗暗示。（S01 P5；S04 P27）
- **F6.5 脑 MRI 的语境。** NCI 把“钆增强 MRI，常用于脑”列在分期检查中；AIM 的 III 期随访把 brain MRI 列为“可考虑”。早期无症状患者不做常规脑 MRI。中国实际执行差异大，标 **待核验**。（S05；S12；S01 无随访章节）
- **F6.6 中国指南 2022 版没有随访章节。** 因此“中国推荐的随访间隔”不能从 S01 直接得出；CSCO 2025 全文未取得（S26），本稿的间隔数字全部来自 NCCN/AIM，**不是中国指南原文**。（S01；S26）

### 6.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `followup_plan_stage` | enum 0/I/IIA/IIB/IIC/III/IV | 选模板时显示“来源：NCCN 2026，非中国指南” | S04；S12 |
| `visit_type` | enum: dermatology_skin / oncology / imaging / lab / other | 双轨分开 | S04；S12 |
| `skin_exam_done` / `node_exam_done` | bool | 每次随访勾选 | S04 |
| `imaging_type` | enum: CT_chest / CT_abdomen_pelvis / PET_CT / brain_MRI / ultrasound / none | 记录检查，不给“该不该做” | S12 |
| `imaging_result` | enum: negative / suspicious / positive / unknown + text | 与报告原文件绑定 | 产品设计 |
| `ldh_value` / `ldh_date` | number / date | 趋势展示；标注“预后指标，非筛查” | S01；S04 |
| `next_due_date` | date | 由计划生成，允许医生/患者改 | 产品设计 |
| `plan_source` | string（版本+页码） | 每个计划条目都能点回来源 | 项目规范 |
| `actual_vs_plan_gap` | computed | 只显示“超期 X 天”，不显示“你延误了” | 产品边界 |

**展示文案示例（解释不是判断）**
> “这份随访计划按 III 期模板生成，参考 NCCN 2026。中国指南的随访间隔需以你的主治团队和 CSCO 最新版为准。”

### 6.3 来源

- S04 P55、P57、P70、P88-89（分期随访间隔、影像、LDH、脑 MRI 语境）
- S12 AIM Follow Up By Stage（III 期终身皮肤检查、影像 3-12 个月）
- S01 P5（LDH 不敏感、无随访章节）
- S26 CSCO 指南入口（2025 全文未取得，待核验）

---

## 7. 复发与转移：患者可观察信号与产品边界

### 7.1 患者视角关键事实

- **F7.1 复发有五种“位置语言”。** NCCN 患者版分成：真性瘢痕复发（true scar recurrence/persistent）、局部卫星灶、移行转移（in-transit）、淋巴结复发、远处转移。产品字段应直接用这五类，而不是笼统“复发”。（S04 P73-76）
- **F7.2 多数复发在治疗后 3 年内。** NCCN 患者版：“Most recurrences happen within 3 years after treatment.” 这只是群体规律，不是个体时间表。（S04 P73）
- **F7.3 患者能观察到的信号。** 瘢痕内/旁出现硬结节；瘢痕与原淋巴结之间出现新的皮下小结节；淋巴结变大、变硬、固定；新发皮肤斑点；不明原因的气短、骨痛、头痛等。NCCN 原话：复发“often doesn't look like the original melanoma”，常表现为皮下或淋巴结的“lumps”。（S04 P73-76）
- **F7.4 产品只能“记录+提示联系”，不能“判断是不是复发”。** 需要 `patient_reported` 与 `clinician_confirmed` 两个状态；确认手段是活检/影像/病理，不是照片对比。（S04 P73；本稿边界）
- **F7.5 移行转移的定义要说清。** 在原发性与区域淋巴结之间、淋巴管内的复发，未进入淋巴结；局部卫星灶在瘢痕内/周围。两者检测与治疗原则相近，但字段不能混。（S04 P74）

### 7.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `event_type` | enum: scar / satellite / in_transit / nodal / distant / unknown | 五类+未知 | S04 P73-76 |
| `report_source` | enum: patient / clinician / imaging / pathology | 患者上报永远标“未确认” | 本稿边界 |
| `event_date` / `body_site` / `size_mm` | date / string / number | 与照片、门诊记录联动 | 产品设计 |
| `photo_ids` | array | 仅作留档，不作判读 | 本稿边界 |
| `contacted_team` | bool + date | 记录行动，不打分 | 产品设计 |
| `confirmation_status` | enum: unconfirmed / confirmed_benign / confirmed_recurrence / pending | 只有病理/医生能改 confirmed | S04 |
| `confirmation_method` | enum: biopsy / imaging / clinical / unknown | 与报告绑定 | S04 |
| `do_not_say` | const | 禁止“看起来像复发/不像复发” | 本稿边界 |

**展示文案示例（解释不是判断）**
> “你记录的是一个‘新出现的皮下结节’，是否复发需要医生检查，必要时做活检或影像。记录本身不能判断性质。”

### 7.3 来源

- S04 P73-76（五类复发、3 年内常见、患者可观察表现）
- S12 AIM What is Recurrence（患者语言补充）
- S01 P13（局部复发/移行转移的治疗原则，说明这些是临床实体）

---

## 8. 防晒与紫外线：教育口径是“减少暴露”，不是命令

### 8.1 患者视角关键事实

- **F8.1 UV 是明确风险因素，但不是唯一因素。** NCI：“Being exposed to ultraviolet radiation is a risk factor for skin cancer.” 儿童/青少年期多次**起疱性晒伤**与黑色素瘤风险相关；日光浴床/太阳灯也发出 UV。（S06）
- **F8.2 中国指南把“严重日光晒伤史”列为高危人群条件之一。** 同时列出皮肤癌病史、慢性摩擦/切割/针挑等刺激；黏膜型的高危因素尚不明确。（S01 P2）
- **F8.3 具体防护建议（NCCN 患者版）。** 减少 UV 暴露；避免 10:00-16:00 峰值；宽檐帽、UV 防护衣物、太阳镜；广谱防晒 SPF≥30，出门前 15 分钟涂，至少每 2 小时补涂；避免室内晒黑设备。（S04 P13）
- **F8.4 证据边界必须讲清。** NCI 明确：“It has not been proven that using sunscreen to prevent sunburn can protect against melanoma caused by UV radiation.” 防晒能减少晒伤和光化性角化病，但“涂了防晒就不会得黑色素瘤”是错误承诺。教育口径应是“减少暴露”，不是“你必须每天涂”。（S06）
- **F8.5 维生素 D 的平衡说法。** NCI 把“日晒减少导致皮肤合成维生素 D 下降”列为防晒的潜在小危害；把“情绪障碍、睡眠紊乱、血压升高、维生素 D 代谢受损”列为避免日晒的潜在危害。产品不应鼓励“为了维 D 去晒”，也不应制造“见不得太阳”的恐惧；建议与医生讨论饮食/补充剂与检测。（S06）
- **F8.6 职业/户外暴露要单独记录。** 长期户外工作、驾驶、军训、户外运动属于暴露语境，不是“依从性评分”。（S06；S01 P2）

### 8.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `uv_childhood_sunburns` | enum: 0 / 1-2 / 3+ / unsure | 只记录，不计算风险分 | S06 |
| `uv_tanning_bed` | enum: never / past / current / unsure | 不评判、不羞辱 | S06 |
| `uv_occupation` | string + outdoor_hours_per_day | 户外职业/运动 | S06 |
| `sun_protection_habits` | multi: sunscreen / hat / clothing / shade / sunglasses / none | 记录习惯，不做“及格线” | S04 P13 |
| `sunscreen_spf` | number | 仅记录产品信息 | S04 |
| `vitamin_d_value` | number + unit + date | 可选；与检验模块共用 | S06 |
| `education_tone` | const "reduce_exposure" | 文案基调锁定为“减少暴露” | S06 |

**展示文案示例（解释不是判断）**
> “防晒能减少晒伤，但没有任何一种防晒能保证不得黑色素瘤。更稳妥的说法是：能少晒就少晒，尤其在中午；需要出门时用衣物、帽子和防晒霜减少暴露。”

### 8.3 来源

- S06 NCI PDQ Skin Cancer Prevention（晒伤、日光浴床、防晒证据边界、维生素 D 潜在危害）
- S01 P2（中国高危人群：严重晒伤史、慢性刺激）
- S04 P13（NCCN 具体防护建议）
- S10 MRF Understanding Melanoma（约 90% 皮肤型与 UV 相关，页面自述）

---

## 9. 皮肤/身体意象：疤痕、隐私与心理负担

### 9.1 患者视角关键事实

- **F9.1 身体意象是黑色素瘤的独立心理议题。** 2026 年系统综述（9 项研究）指出：手术瘢痕、皮肤转移灶会改变身体意象，进而影响身份感、人际与社交功能；研究把这些影响分为身体意象担忧、社会功能、肿瘤相关变量、人口学变量、与其他心理社会结局的相关五类。（S22）
- **F9.2 疤痕不是“小事”。** NCCN 患者版在活检和扩大切除章节都主动提示“会留疤”，并建议术前询问切口与疤痕；扩大切除可能有疼痛、肿胀、麻木、疤痕，必要时植皮/皮瓣。（S04 P20、P38-39）
- **F9.3 全身皮肤检查天然涉及“脱光”的隐私与尴尬。** 中国指南要求原发灶、受累部位和区域淋巴结的视诊/触诊；NCCN 要求 head-to-toe 包含头皮、口腔、眼睑、耳、躯干、四肢、手指、足趾、甲。产品不能假装这只是“拍张照”。（S01 P2；S04 P29）
- **F9.4 隐私偏好应可设置，而不是默认。** 可设置：是否接受同性医生/护士在场、是否介意医学生旁观、是否允许拍摄、拍摄范围、照片存储与授权。以上是产品设计建议，**没有中国患者访谈数据支撑**，标 B/C 级缺口。（本稿缺口）
- **F9.5 居家/远程皮肤监测对隐私敏感人群可能更友好。** 一项远程皮肤镜定性研究（n=22，弱势人群）显示：参与者重视居家检查的便利、专家反馈带来的安心感；家人/伴侣帮助检查难以看到的部位能提高信心。这是间接证据，不能直接外推到中国诊室尴尬。（补充来源 PMID 42393858；证据级别 B）
- **F9.6  distress 常见，且会影响随访。** NCCN 患者版明确：抑郁、焦虑、恐惧、痛苦在癌症患者中很常见，会妨碍应对与决策，应主动向团队求助。（S04 P85）
- **F9.7 不要做“外观评分”。** 产品可以记录疤痕位置、大小、颜色、是否影响活动（可选），但不能给“美观度打分”或推荐具体祛疤产品。（本稿边界）

### 9.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `privacy_chaperone_pref` | enum: same_sex / any / no_preference / not_set | 就诊前可出示给前台 | 产品设计（缺口） |
| `photo_consent` | object: allow / scope / storage / withdraw | 与照片模块强绑定 | 产品设计 |
| `scar_record` | optional: site, length_mm, date, photo | 只作个人档案，不作疗效评价 | S04 P38-39 |
| `body_image_concern` | optional free text / tags | 用户主动填；不主动追问 | S22 |
| `distress_score` | optional 0-10（用户自评） | 明确“不是诊断量表” | S04 P85 |
| `support_referral` | enum: none / peer / social_worker / psych_onc / unknown | 提供资源，不强制 | S04 P85 |
| `exam_explanation_card` | const text | 解释“为什么要看全身/隐私部位” | S01；S04 P29 |

**展示文案示例（解释不是判断）**
> “全身皮肤检查需要看头皮、口腔、手脚和甲下，这些部位也可能是原发灶。你可以提前说明希望有同性医护人员在场，或是否接受拍摄。”

### 9.3 来源

- S22 身体意象系统综述（2026，9 项研究；瘢痕/皮肤转移对身体意象与社会功能的影响）
- S04 P20、P29、P38-39、P85（疤痕告知、head-to-toe 范围、支持与 distress）
- S01 P2（原发灶/区域淋巴结视诊触诊）
- 远程皮肤镜定性研究（居家监测体验，间接证据；见 §12 备注）

> 缺口说明：没有中国黑色素瘤患者关于“脱光检查尴尬”的定性数据。本主题的字段是设计建议，不是证据结论；上线前应做 5-8 例患者访谈验证。

---

## 10. 特殊人群与亚型：儿童、肢端、黏膜、葡萄膜

### 10.1 患者视角关键事实

- **F10.1 中国黑色素瘤的亚型结构与欧美相反。** 国家卫健委指南：“在亚洲人和其他有色人种中，原发于肢端的黑色素瘤约占 50%，常见于足底、足趾、手指末端及甲下；原发于黏膜（直肠、肛门、外阴、眼、口鼻咽）占 20%～30%；白种人原发皮肤型约 90%，肢端、黏膜分别只占 5%、1%。”（S01 P1）
- **F10.2 中国单中心 522 例的分布可作交叉印证。** 肢端 41.8%、黏膜 22.6%、结节型 19.7%、浅表扩散型 6.3%；初诊 III 期 25.1%、IV 期 12.8%，说明“晚诊”仍是现实。（S15）
- **F10.3 肢端型自查不能照搬 ABCDE。** 中国指南给甲下黑色素瘤 ABCDEF：A＝年龄较大/亚洲或非裔；B＝纵形黑甲条带棕黑、宽度＞3 mm；C＝甲改变或充分治疗无改善；D＝最常受累顺序拇指＞大踇趾＞示指，单指＞多指；E＝病变扩展；F＝个人/家族发育不良痣或黑色素瘤史。普通 ABCDE 对足底/甲下容易漏。（S01 P2-3）
- **F10.4 甲单元黑色素瘤是独立临床实体。** 2026 年国际专家建议：多数表现为成人甲的纵形色素带；在白种人中占全部黑色素瘤 1.5-2.5%，在黑种人中可高达 50%；甲单元面积不足体表 1%，但诊断常延迟。（S23）
- **F10.5 黏膜型分期与治疗都另有一套。** 中国指南对头颈黏膜、外阴、阴道、宫颈、消化道、眼分别说明 pTNM 适用范围；晚期黏膜型以化疗+抗血管生成、BRAF±MEK 为重要选择，PD-1+阿昔替尼当时仍在研究中。（S01 P10、P16）
- **F10.6 儿童/青少年罕见，但 ABCDE 可能不适用。** NCCN 患者版提醒“can occur at any age—even children”；2013 年 70 例儿童/青少年队列提出改良 ABCD（去除成人常用的直径阈值、强调 amelanotic/结节/出血等），说明成人 ABCDE 直接套用会漏诊。（S04 P6；S24）
- **F10.7 葡萄膜黑色素瘤必须另案。** 中国 2021 眼科共识：UM 是成人最常见原发眼内恶性肿瘤，诊断治疗有独立路径；NHC 指南也单列眼黑色素瘤分期，并指出晚期 UM 突变率低、易肝转移、免疫治疗不敏感。工作台不应把 UM 混进皮肤黑色素瘤的随访/免疫模板。（S25；S01 P10、P16）
- **F10.8 肢端型的辅助治疗在中国指南里不是“照搬皮肤型”。** NHC 2022：皮肤型 III 期推荐 PD-1 辅助、BRAF V600 用达拉非尼+曲美替尼 1 年；肢端型“仍推荐大剂量干扰素为主”；黏膜型推荐替莫唑胺+顺铂 6 周期。这个差异必须进入字段与文案，否则会把欧美皮肤型路径误用到中国大多数患者。（S01 P13-14）

### 10.2 字段建议

| 字段 | 类型/取值 | 用途与展示口径 | 依据 |
|---|---|---|---|
| `melanoma_subtype` | enum: cutaneous / acral / mucosal / uveal / unknown_primary / other | 一等字段，决定模板 | S01 P1；S25 |
| `acral_site_detail` | enum: sole / palm / digit / subungual / other | 触发甲下 ABCDEF 与足底自查提示 | S01 P2-3 |
| `mucosal_site` | enum: head_neck / anorectal / vulvovaginal / other | 黏膜模板与分期另挂 | S01 P10 |
| `pediatric_flag` | bool（年龄<18） | 触发“改良 ABCD/罕见”提示 | S24 |
| `uveal_module` | enum: excluded / separate | 明确“另案”，不共享皮肤型随访 | S25 |
| `subtype_self_exam_prompt` | text（只读） | 足底/甲下/生殖器/口腔的部位提示 | S01；S23 |
| `subtype_treatment_note` | text（只读） | “中国指南中肢端型辅助以干扰素为主”等，带版本 | S01 P13-14 |
| `guideline_scope_warning` | const | 非皮肤型页面固定提示“本页模板不适用于葡萄膜” | 本稿边界 |

**展示文案示例（解释不是判断）**
> “在中国，肢端和黏膜型比欧美常见得多。足底、甲下、口腔/生殖器的痣和色素斑需要单独的自查方法，不能只用看手上痣的 ABCDE。”

### 10.3 来源

- S01 P1-3、P10、P13-16（中国亚型比例、甲下 ABCDEF、黏膜/眼分期、辅助治疗差异）
- S15 BMC Cancer 2011（522 例：肢端 41.8%、黏膜 22.6%、III/IV 期比例）
- S23 甲单元黑色素瘤专家建议（2026：纵形色素带、1.5-2.5%/可达 50%）
- S24 儿童改良 ABCD（2013，70 例）
- S25 中国葡萄膜黑色素瘤共识（2021）
- S04 P6（任何年龄、肢端/黏膜/眼可发生）

---

## 11. 中国获批药物核实（专表）

> **核实通道说明**：NMPA 官网 `www.nmpa.gov.cn` 与 `datasearch.nmpa.gov.cn` 均返回 412（瑞数反爬），Playwright 真实浏览器亦未取到内容；因此**无法在本次访问中直接核对批准日期与批件号**。下表“说明书级”指已核对国家药监局批准说明书文本（经中国医药信息查询平台收录），**批准日期/批件号一律标“待核验”**。

| 药物/组合 | 中国说明书适应症（核对文本） | 关键限制/备注 | 核验级别 | 来源 |
|---|---|---|---|---|
| 维莫非尼（vemurafenib） | BRAF V600 突变阳性的不可切除或转移性黑色素瘤 | 需经批准的检测方法确认 V600 | 说明书级；日期待核验 | S13c |
| 达拉非尼（dabrafenib） | BRAF V600E 或 V600K 突变阳性的不可切除或转移性黑色素瘤；V600K 须与曲美替尼合用 | 单药/联合口径不同 | 说明书级；日期待核验 | S13a |
| 曲美替尼（trametinib） | 联合达拉非尼用于 BRAF V600 突变阳性不可切除或转移性黑色素瘤；**联合达拉非尼用于 BRAF V600 突变阳性 III 期黑色素瘤完全切除后的辅助治疗** | 中国已有 III 期辅助适应症；需批准方法检测 | 说明书级；日期待核验 | S13b |
| 帕博利珠单抗（pembrolizumab） | **经一线治疗失败的**不可切除或转移性黑色素瘤 | 附条件批准，基于单臂 ORR；**所见说明书版本未收录辅助治疗** | 说明书级；日期待核验 | S13d |
| 特瑞普利单抗（toripalimab） | 既往接受全身系统治疗失败的不可切除或转移性黑色素瘤 | 国药准字 S20180015 等可见；2026 上海卫健委文章称已前移至一线并进医保（B 级，待医保文件核验） | 说明书级+批准文号 | S13g；S14 |
| 伊匹木单抗（ipilimumab） | 成人不能切除或转移的黑色素瘤 | 说明书用法 3 mg/kg 每 3 周×4 次；**联合 nivolumab 的中国适应症未在所见说明书中体现** | 说明书级；日期待核验 | S13f |
| 纳武利尤单抗（nivolumab） | **所见中国说明书适应症未包含黑色素瘤**（NSCLC、MPM、SCCHN、UC、食管癌、胃癌等；全文 0 次“黑色素瘤”） | 不能把 NCCN 的辅助/晚期 nivolumab 写成“国内已批准” | 说明书级（阴性）；需复核 | S13e |
| 康奈非尼+比美替尼（encorafenib+binimetinib） | **中国医药信息查询平台站内检索无结果** | 可能未在中国上市；NMPA 原库与药企确认前标“待核验”，不得作为可及选项 | 待核验 | dayi.org.cn 站内检索（2026-10-24）；S26 |
| 伊马替尼/尼洛替尼（KIT） | NHC 2022 列为国内上市的黑色素瘤靶向药物（KIT 抑制剂） | 具体黑色素瘤适应症需逐一核对说明书 | 指南级；说明书待核验 | S01 P15 |

**产品规则**
- 药物卡片必须分三层：`中国说明书适应症` / `中国指南提及` / `国际指南推荐`，不能合并成“适合你”。
- 任何“医保可报销”必须另挂医保目录来源；本次未核验，不显示。
- 药物停用/换线原因由用户/医生记录，产品不生成“耐药”结论。

---

## 12. 来源总表

> 访问日期均为 2026-10-24。类型：官方指南/官方患教/专业指南/患者组织/同行评议/药品说明书。

| ID | 机构/作者 | 标题 | URL | 日期/版本 | 类型 | 主要局限 |
|---|---|---|---|---|---|---|
| S01 | 国家卫生健康委员会 | 黑色素瘤诊疗指南（2022年版），24 页 | https://www.nhc.gov.cn/yzygj/c100068/202204/0c1f7d3aca0545abbeb02030ce255930/files/1732863054447_72541.pdf | 2022-04 发布；PDF 创建 2022-03-09 | 官方指南 | 无随访章节；药物清单停留在 2022，未覆盖 2024-2026 新适应症 |
| S03 | NCCN | NCCN Guidelines: Melanoma: Cutaneous, Version 3.2026 | https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1492 | 页面显示 v3.2026 | 专业指南 | 全文需授权；页面仅元信息；美国口径；任务指定的 2.2025 已被取代 |
| S04 | NCCN | NCCN Guidelines for Patients: Melanoma, 2026（基于 v1.2026，2026-02-17） | https://www.nccn.org/patients/guidelines/content/PDF/melanoma-patient.pdf | 2026-02-17 | 患者版指南 | 简化版；患者版基于 v1.2026，可能滞后于临床版 v3.2026；美国可及性；不能替代临床指南原文 |
| S05 | NCI | Melanoma Treatment (PDQ)–Patient Version | https://www.cancer.gov/types/skin/patient/melanoma-treatment-pdq | 页面未标更新日 | 官方患教/证据综述 | 美国口径；治疗药物清单含中国未上市药 |
| S06 | NCI | Skin Cancer Prevention (PDQ)–Patient Version | https://www.cancer.gov/types/skin/patient/skin-prevention-pdq | 页面未标更新日 | 官方患教 | 预防证据多为观察性；防晒与黑色素瘤因果未证实 |
| S07 | American Cancer Society | How Is Melanoma Skin Cancer Diagnosed? | https://www.cancer.org/cancer/types/melanoma-skin-cancer/detection-diagnosis-staging/how-diagnosed.html | 页面未标更新日 | 患者教育 | 美国路径；未提中国“不刮取”口径 |
| S08 | American Cancer Society | Signs and Symptoms of Melanoma Skin Cancer | https://www.cancer.org/cancer/types/melanoma-skin-cancer/detection-diagnosis-staging/signs-and-symptoms.html | 页面未标更新日 | 患者教育 | 未给自查频率 |
| S09 | Melanoma Research Foundation | What Does Melanoma Look Like? | https://melanoma.org/what-does-melanoma-look-like/ | 页面未标更新日 | 患者组织 | 美国；无频率；商业/募资背景需注意 |
| S10 | Melanoma Research Foundation | Understanding Melanoma | https://melanoma.org/what-is-melanoma/understanding-melanoma/ | 内容审阅 2020-08-20 | 患者组织 | 数据偏旧；90% UV 为页面自述 |
| S11 | AIM at Melanoma Foundation | Stages of Melanoma | https://www.aimatmelanoma.org/stages-of-melanoma/ | 版权 2014-2022 | 患者组织 | 简化；美国分期口径 |
| S12 | AIM at Melanoma Foundation | Follow Up By Stage | https://www.aimatmelanoma.org/after-treatment/follow-up-by-stage/ | 页面未标更新日 | 患者组织 | 非指南原文；III 期“终身皮肤检查”比 NCCN 更保守 |
| S13a | 中国医药信息查询平台 | 达拉非尼说明书 | https://www.dayi.org.cn/drug/1154557.html | 访问 2026-10-24 | 药品说明书汇编 | 非 NMPA 原库；批准日期/批件号未显示 |
| S13b | 中国医药信息查询平台 | 曲美替尼片说明书 | https://www.dayi.org.cn/drug/1158226.html | 访问 2026-10-24 | 药品说明书汇编 | 同上 |
| S13c | 中国医药信息查询平台 | 维莫非尼片说明书 | https://www.dayi.org.cn/drug/1153159.html | 访问 2026-10-24 | 药品说明书汇编 | 同上 |
| S13d | 中国医药信息查询平台 | 帕博利珠单抗说明书 | https://www.dayi.org.cn/drug/1155457.html | 访问 2026-10-24 | 药品说明书汇编 | 附条件批准说明；辅助适应症未收录 |
| S13e | 中国医药信息查询平台 | 纳武利尤单抗说明书 | https://www.dayi.org.cn/drug/1157237.html | 访问 2026-10-24 | 药品说明书汇编 | 所见适应症无黑色素瘤；需 NMPA 原库复核 |
| S13f | 中国医药信息查询平台 | 伊匹木单抗说明书 | https://www.dayi.org.cn/drug/1153352.html | 访问 2026-10-24 | 药品说明书汇编 | 单药 3 mg/kg 方案；联合适应症未体现 |
| S13g | 中国医药信息查询平台 | 特瑞普利单抗注射液说明书 | https://www.dayi.org.cn/drug/1158176.html | 访问 2026-10-24 | 药品说明书汇编 | 含国药准字；一线/医保说法需另核 |
| S14 | 上海市卫生健康委员会 | 黑色素瘤相关科普（ABCDE、肢端、特瑞普利单抗一线/医保） | https://wsjkw.sh.gov.cn/zl/20260122/7885d833ecb149f9b094488c074216a4.html | 2026-01-22 | 官方患教 | 科普稿，非指南；“进医保”需医保目录核验 |
| S15 | BMC Cancer | Clinical presentation, histology, and prognoses of malignant melanoma in ethnic Chinese: 522 consecutive cases | https://pubmed.ncbi.nlm.nih.gov/21349197/ | 2011 | 同行评议 | 单中心、2011 年数据；治疗已变化 |
| S16 | Clin Cancer Res | Large-scale analysis of KIT aberrations in Chinese patients with melanoma (n=502) | https://pubmed.ncbi.nlm.nih.gov/21325067/ | 2011 | 同行评议 | 单国、旧数据；KIT 检测方法为 Sanger/qPCR |
| S17 | Melanoma Research | Frequency of mutations in BRAF, NRAS, and KIT in different populations and histological subtypes: systemic review（32 研究/6299 例） | https://pubmed.ncbi.nlm.nih.gov/31274706/ | 2020 | 系统综述 | 汇总异质性大；不等于中国单国数据 |
| S18 | Genome Research | Integrated genomic analyses reveal frequent TERT aberrations in acral melanoma（34 例） | https://pubmed.ncbi.nlm.nih.gov/28373299/ | 2017 | 同行评议 | 样本小；TERT 无获批药物 |
| S19 | Cancer Res Treat | The Pattern of Time to Onset and Resolution of irAEs: pooled analysis of 23 trials, 8436 patients | https://pubmed.ncbi.nlm.nih.gov/33171025/ | 2021 | 汇总分析 | 泛癌种，非黑色素瘤专属；试验间定义差异 |
| S20 | Cancer | Patterns of onset and resolution of irAEs with ipilimumab (phase 3) | https://pubmed.ncbi.nlm.nih.gov/23400564/ | 2013 | Ⅲ期试验二次分析 | 仅 ipilimumab 3 mg/kg；旧方案 |
| S21 | J Clin Oncol | Management of irAEs in Patients Treated With Immune Checkpoint Inhibitor Therapy: ASCO Guideline | https://pubmed.ncbi.nlm.nih.gov/34724392/ | 2021 | 专业指南 | 美国口径；未覆盖中国新药 |
| S22 | Ital J Dermatol Venerol | Living in your own skin. The experience of the body in melanoma patients: systematic review（9 项） | https://pubmed.ncbi.nlm.nih.gov/42023886/ | 2026 | 系统综述 | 研究少、多为西方样本；不能代表中国 |
| S23 | J Eur Acad Dermatol Venereol | Experience-based recommendations for diagnosis and management of early-stage nail unit melanoma | https://pubmed.ncbi.nlm.nih.gov/42865149/ | 2026 | 专家建议 | 经验性共识，非高级别证据 |
| S24 | J Am Acad Dermatol | Pediatric melanoma: large cohort and modified ABCD detection criteria（70 例） | https://pubmed.ncbi.nlm.nih.gov/23395590/ | 2013 | 回顾性队列 | 单中心、样本小；改良标准未外部验证 |
| S25 | 中华眼科杂志 | 中国葡萄膜黑色素瘤诊断和治疗专家共识（2021） | https://pubmed.ncbi.nlm.nih.gov/34865447/ | 2021 | 中国专家共识 | 仅眼科口径；与皮肤型不可混用 |
| S26 | CSCO | 中国临床肿瘤学会官网/指南订购入口 | https://www.csco.org.cn/cn/index.aspx | 访问 2026-10-24 | 学会官网 | CSCO 2025 黑色素瘤指南全文需购买，未取得；本稿未引用其具体页码 |

**补充来源（主题 9 远程监测间接证据）**
- Experiences of patient-led melanoma surveillance and teledermatology in underserved groups (MEL-SELF qualitative sub-study), J Telemed Telecare, 2026, PMID 42393858, https://pubmed.ncbi.nlm.nih.gov/42393858/ 。样本 22 人、澳大利亚弱势人群；仅作“居家检查可能降低隐私门槛”的间接线索，不能外推中国。

---

## 13. 最大缺口与待核验清单

按对产品的影响排序：

1. **CSCO 2025 黑色素瘤指南全文未取得（最大缺口）。** 影响：中国随访间隔、辅助治疗分层、肢端/黏膜最新推荐、医保联动。当前只能以 NHC 2022 + NCCN 2026 组合，必须在界面标“来源与版本”，不能写“中国指南要求”。
2. **NMPA 官方数据库不可达。** 影响：所有药物的批准日期、批件号、适应症变更时间。当前为“说明书级”核验；`nivolumab 无黑色素瘤适应症`、`encorafenib/binimetinib 未见批准` 两条需 NMPA 原库或药企确认。
3. **中国患者隐私/身体意象定性数据为零。** 主题 9 的字段是设计假设；需 5-8 例访谈（含足底/甲下/黏膜患者）验证“脱光检查”的真实语言与缓解方式。
4. **手机照片对比无验证。** 没有证据支持“患者自拍可早期识别复发”；产品只能做“同尺度留档 + 变化提醒”，不能做图像判读或风险评分。
5. **NHC 2022 与 2026 药物现实脱节。** 例如特瑞普利单抗一线/医保、encorafenib、辅助 PD-1 的中国可及性；需要一张“指南版本-药物可及性”时间表。
6. **irAE 时间窗来自泛癌种汇总。** 中国黑色素瘤患者、PD-1/CTLA-4 联合、肢端/黏膜亚型的 irAE 谱缺少本地数据；文案只能用“常见区间”，不能给个体概率。
7. **儿童/黏膜/葡萄膜证据薄。** 儿童仅小样本回顾；黏膜分期与治疗散落在 NHC 附录；葡萄膜必须另案。三者都不适合与皮肤型共用一套随访/免疫模板。
8. **NCCN 版本漂移。** 任务指定 2.2025，但 2026-10 官网已是 3.2026、患者版基于 1.2026；引用时必须写实际版本，不能沿用旧版页码。

---

## 14. 产品文案红线（直接用于评审）

**禁止**
- “根据照片判断：良性/恶性/复发/没事。”
- “你应该是 I 期/III 期。”（分期只能由医生与病理给出）
- “你必须每 3 个月复查。”（改为“某版指南写的是……；你的计划是……”）
- “这个药适合你/你需要用 PD-1。”（改为“说明书适应症是……；是否使用由医生判断”）
- “涂 SPF50 就不会得黑色素瘤。”
- “为了补维生素 D 多晒太阳。”
- “出现这些症状就是免疫性结肠炎/肝炎。”（改为“这些是需要尽快联系团队的信号”）
- “CM 期的辅助免疫国内都能用。”（中国说明书不支持）
- 把 NCCN 的“preferred”直接翻译成“最好/首选”，或把美国上市等同中国可及。

**必须**
- 每个医学结论旁显示：来源 ID + 版本/日期 + “解释不是判断”。
- 药物卡三层分离：中国说明书 / 中国指南 / 国际指南。
- 随访卡显示 `plan_source` 与“计划 vs 实际”的日期差，不做依从性评判。
- 患者上报事件永远先标“未确认”，只有病理/医生记录能改状态。
- 所有“人话解释”使用“通常/可能/在某版指南里”等限定词，不写“一定/必须/就是”。

---

*本稿为产品设计用医学事实底稿；不构成诊疗建议。所有标“待核验”的条目在进入正式工作台前必须补齐原文页码或官方批件。*
