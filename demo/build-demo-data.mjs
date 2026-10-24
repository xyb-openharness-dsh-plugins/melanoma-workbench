#!/usr/bin/env node
/**
 * demo/build-demo-data.mjs — 皮肤黑色素瘤（MEL）工作台演示数据唯一源。
 * 运行：node demo/build-demo-data.mjs → 生成 prototypes/v0.2/demo-data.js（勿手改）。
 *
 * 两档案 × 6 个月窗口（2026-04-24 → 2026-10-24，另带确诊前自查长程锚点）：
 *  - DEMO-1 张伟（演示）45 男：足底肢端黑色素瘤 IIB（Breslow 3.8mm / 溃疡+ / SLNB 阴性），
 *    术后 8 个月，帕博利珠单抗辅助 Q3W 第 4 次；IO 皮疹 1 级（第 6 周）+ 腹泻 1 次；
 *    自查档案 2025-11 足底黑斑（自述「以为是鸡眼」）；双轨随访（皮肤 3 月 / 影像 6 月）；
 *    BRAF 未检测（未检测≠阴性）、NRAS 未检出。
 *  - DEMO-2 王琳（演示）33 女：背部浅表扩散型 IB（Breslow 1.2mm），BRAF V600E 检出 →
 *    达拉非尼 + 曲美替尼辅助第 5 月，发热 + 皮疹；丈夫代检背部盲区（author_role=CAREGIVER）；
 *    private 记录含身体意象/疤痕；复发恐惧 FCR 自评双源（本人 + 丈夫）。
 *
 * 照片：不加载真实图片。照片对比一律用「部位色块卡 + 日期 + 尺寸 + 自述」示意，
 * 页内常驻「照片仅本机保存（接入后）」，不做任何图像判读（medical-constraints §13.4）。
 *
 * 红线（DEV-REQUIREMENTS K1–K6）：
 *  K1 自查档案零诊断性措辞（禁用词见 docs/INTERACTION-DESIGN 与 medical-constraints §14）；ABCDE 只做名词解释；
 *  K2 照片/记录按部位+时间双视图，变化只并列不判读；
 *  K3 分期与 SLNB 三态只引用原文（未做 / 结果原文 / 未记录），无推导列；
 *  K4 分子三态（检出/未检出/未检测），未检测≠阴性；
 *  K5 IO 反应四轨独立于皮损档案，归因只存自评，无 causality 列；
 *  K6 双轨随访各自节奏并列，防晒只做事实提醒（不做命令式）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'prototypes', 'v0.2', 'demo-data.js');

const SITE_ORDER = [
  { code: 'sole', name: '足底' },
  { code: 'web', name: '趾缝' },
  { code: 'nail', name: '甲下' },
  { code: 'palm', name: '手掌' },
  { code: 'finger', name: '指甲' },
  { code: 'side', name: '足侧' },
  { code: 'back', name: '背部' },
  { code: 'scalp', name: '头皮' },
  { code: 'ear', name: '耳后' },
  { code: 'leg', name: '下肢后侧' },
  { code: 'other', name: '其他' }
];

const PHOTO_NOTE = '照片仅本机保存（接入后）；演示用「部位色块 + 日期 + 尺寸 + 自述」示意，不加载真实图片，也不做任何图像判读。';

function buildDemoProfiles() {
  const D = {
    meta: {
      dataStart: '2025-11-02',
      today: '2026-10-24',
      windowStart: '2026-04-24',
      disclaimer: '演示数据（合成）：人物、数值与时间线不指向任何真实患者。',
      sourceNote: '医学口径引用国家卫健委《黑色素瘤诊疗指南（2022 年版）》、NCCN 2026 等，见 research-notes/medical-constraints.md §12 来源总表；所有「人话解释」使用通常/可能/在某版指南里等限定词。',
      photoNote: PHOTO_NOTE,
      trialNote: '试验条目取自 research/melanoma-cancer/trials-2026.jsonl 的真实登记样例（2026-10 快照）；登记状态，未核实，不构成推荐，也不判入组资格。'
    },
    profiles: []
  };

  /* ══════════════ DEMO-1 张伟 · 足底肢端黑色素瘤 IIB · 术后 8 个月 ══════════════ */
  D.profiles.push({
    id: 'demo1',
    name: '张伟（演示）',
    age: 45,
    gender: '男',
    diagnosis: '右足跟肢端黑色素瘤 · 扩大切除术后（演示）',
    diagnosisShort: '肢端黑色素瘤 · 术后 8 个月',
    stageLine: 'IIB 期（AJCC 第 8 版，医生记录引用；本台不自算、不判定）',
    primaryRole: 'PATIENT',
    caregiverLabel: '妻子（照护者）',
    hero: {
      selfCheck: '2025-11 足底黑斑（自述「以为是鸡眼」）',
      dualTrack: '皮肤线 3 个月 · 影像线 6 个月',
      irae: 'IO 皮疹 1 级（第 6 周）· 腹泻 1 次'
    },

    selfCheck: {
      headline: '2025-11 自查发现足底黑斑；自述「以为是鸡眼」，这是一条确诊前的记录。',
      firstFound: {
        d: '2025-11-02',
        site: '足底 · 右足跟内侧',
        text: '洗澡后脱鞋看到一块黑褐色斑，约 8mm；自述「以为是鸡眼」，买过鸡眼贴贴了 2 周。'
      },
      rhythm: '每月一次（本人设定；不鼓励每日检查——每日检查会增加焦虑）',
      siteOrder: SITE_ORDER,
      sites: [
        { code: 'sole', name: '足底', count: 1, latest: '2026-02-10', note: '右足跟内侧 1 条（已手术）' },
        { code: 'web', name: '趾缝', count: 0, latest: null, note: '暂无记录' },
        { code: 'nail', name: '甲下', count: 0, latest: null, note: '暂无记录' },
        { code: 'palm', name: '手掌', count: 0, latest: null, note: '暂无记录' },
        { code: 'finger', name: '指甲', count: 0, latest: null, note: '暂无记录' },
        { code: 'side', name: '足侧', count: 0, latest: null, note: '暂无记录' },
        { code: 'back', name: '背部', count: 1, latest: '2026-03-15', note: '右肩胛新发 1 条' },
        { code: 'scalp', name: '头皮', count: 0, latest: null, note: '暂无记录' },
        { code: 'ear', name: '耳后', count: 0, latest: null, note: '暂无记录' },
        { code: 'leg', name: '下肢后侧', count: 0, latest: null, note: '暂无记录' },
        { code: 'other', name: '其他', count: 0, latest: null, note: '暂无记录' }
      ],
      lesions: [
        {
          id: 'L1', code: 'sole', site: '足底 · 右足跟内侧', first: '2025-11-02', sizeMm: 10,
          color: '黑褐，颜色不均', shape: '边界欠清、不规则', author: 'PATIENT', visibility: 'patient',
          note: '自述「以为是鸡眼」；贴过鸡眼贴 2 周。',
          abcde: { A: '不对称', B: '边界欠清', C: '颜色不均', D: '约 10mm', E: '变大、曾少量出血' }
        },
        {
          id: 'L2', code: 'back', site: '背部 · 右肩胛', first: '2026-03-15', sizeMm: 4,
          color: '褐色，较均匀', shape: '大致对称', author: 'PATIENT', visibility: 'patient',
          note: '新发，自己照镜子看不到，用手机拍的。',
          abcde: { A: '大致对称', B: '边界尚清', C: '颜色较均匀', D: '约 4mm', E: '暂未注意变化' }
        }
      ],
      photos: [
        { id: 'P1', lesion: 'L1', d: '2025-11-02', site: '足底 · 右足跟内侧', sizeMm: 8, tone: '#6b4a3a', text: '自述：黑褐色，像鸡眼，贴过鸡眼贴', author: 'PATIENT' },
        { id: 'P2', lesion: 'L1', d: '2026-01-12', site: '足底 · 右足跟内侧', sizeMm: 9, tone: '#5b3b30', text: '皮肤科门诊：边界欠清、颜色不均（病历原文）', author: 'PATIENT' },
        { id: 'P3', lesion: 'L1', d: '2026-02-10', site: '足底 · 右足跟内侧', sizeMm: 10, tone: '#4d2f27', text: '活检前标尺照片，最大径约 10mm', author: 'PATIENT' },
        { id: 'P4', lesion: 'L2', d: '2026-03-15', site: '背部 · 右肩胛', sizeMm: 4, tone: '#8a6a52', text: '新发小痣，手机对照拍', author: 'PATIENT' }
      ],
      photoNote: PHOTO_NOTE,
      timeline: [
        { d: '2025-11-02', kind: '自查', text: '足底黑斑首次记录（自述「以为是鸡眼」）', author: 'PATIENT' },
        { d: '2026-01-12', kind: '皮肤科', text: '门诊病历：「右足跟内侧可见约 8mm 黑褐色斑，边界欠清。」', author: '医生记录' },
        { d: '2026-02-10', kind: '活检', text: '切除活检（病理报告原文）', author: '医院' },
        { d: '2026-02-24', kind: '手术', text: '扩大切除 + 前哨淋巴结活检', author: '医院' },
        { d: '2026-05-26', kind: '皮肤复查', text: '全身皮肤检查 + 皮肤镜；疤痕愈合（医生记录）', author: '医院' },
        { d: '2026-08-25', kind: '皮肤复查', text: '全身皮肤检查；背部小痣对照（医生记录）', author: '医院' }
      ],
      timelineNote: '同一皮损的历次记录按时间并列；只并列「当时怎么描述」，不生成趋势结论，不做变化判读。',
      acral: {
        intro: '肢端自查顺序按中国语境前置足部；每一步只记「看到什么」，不判断。',
        steps: [
          { n: 1, title: '脱鞋与袜', text: '光线好的地方坐下，脱鞋袜，先看足底与足跟。' },
          { n: 2, title: '足底', text: '看足跟、足弓、前掌；记录位置、颜色、大小（用尺或参照物）。' },
          { n: 3, title: '趾缝', text: '逐个趾缝看有无黑斑、破溃、出血。' },
          { n: 4, title: '趾甲（甲下）', text: '看黑线宽度、是否到甲周、甲板是否破坏；同角度拍一张。' },
          { n: 5, title: '手掌', text: '掌心、指腹、指缝。' },
          { n: 6, title: '指甲', text: '指甲与甲周皮肤。' }
        ],
        questions: ['黑线宽度有没有变化？', '黑线/黑斑是否延伸到甲周皮肤？', '甲板是否出现破坏、裂开或出血？'],
        rhythm: '默认每月一次；节奏由你设定，不鼓励每日检查（每日检查会增加焦虑）。',
        confusion: [
          { term: '鸡眼', text: '常被用来描述足底受压处的角质增厚，可能伴疼痛；它和黑斑不是一回事，但位置上容易混。' },
          { term: '灰指甲', text: '常被用来描述甲板变色、增厚；甲下黑线/黑斑与甲板变色需要皮肤科区分。' },
          { term: '甲下血肿', text: '常被用来描述甲下出血后的暗色区域，多与外伤有关；是否会消退、要不要处理由医生看。' },
          { term: '摩擦淤青', text: '常被用来描述受压或摩擦后的皮下出血；颜色会随时间变化。' }
        ],
        redline: ['出血', '不愈', '变大', '颜色不均'],
        redlineText: '出现以上情况，建议让皮肤科看；本页只做名词解释，不做任何判断。',
        subungualNote: '甲下病变另有 ABCDEF 扩展口径（含甲周皮肤受累等）；本卡不展开，复诊时按皮肤科给的口径对照。'
      },
      abcde: {
        intro: 'ABCDE 是五个观察维度的名词解释，不是自我判断工具，也不能用来排除或确认任何疾病。',
        items: [
          { k: 'A', name: 'Asymmetry · 不对称', text: '把斑块想象成可以对折的形状，两半是否大致相似。' },
          { k: 'B', name: 'Border · 边界', text: '边缘是否清楚、是否呈锯齿状或不规则。' },
          { k: 'C', name: 'Color · 颜色', text: '颜色是否均匀，是否同时有深浅不一、红白蓝黑等混色。' },
          { k: 'D', name: 'Diameter · 直径', text: '最大径多少毫米；用尺或参照物记录，不靠记忆。' },
          { k: 'E', name: 'Elevation · 隆起（中国指南口径）', text: '病变是否有隆起/变厚。中国指南的 ABCDE 里 E 指 Elevation（隆起）；国际常见版本 E 指 Evolving（演变）。两套口径并列记录，本卡不替你择一，也不据此判断。' },
          { k: 'E（国际版）', name: 'Evolving · 演变', text: '大小、形状、颜色、症状（痒、痛、出血）是否有变化。与上一条 Elevation 并列；看医生时把两条都带上。' }
        ],
        note: 'ABCDE 只解释名词；是否符合哪几条、意味着什么，由皮肤科医生结合检查说明。本页不出现「符合几条=风险」之类判断。'
      }
    },

    stage: {
      subtype: '肢端黑色素瘤（右足跟）',
      breslow: 3.8,
      ulcer: '有溃疡（报告原文）',
      mitoses: '8 个/mm²（报告原文）',
      margins: '切缘阴性，最近切缘约 1.2cm（报告原文）',
      pathologyQuote: '「右足跟皮肤黑色素瘤，Breslow 厚度 3.8 mm，溃疡形成，核分裂 8 个/mm²；切缘阴性；前哨淋巴结 0/2 枚见转移。pT3bN0M0，AJCC 第 8 版 IIB 期。」（病理报告原文摘录，2026-03-02）',
      pathologyNote: '厚度、溃疡、核分裂、切缘逐项照抄报告；本台不由厚度推 T，也不解释「严重不严重」。',
      stageHistory: [
        { d: '2026-03-05', label: 'IIB 期', quote: '「AJCC 第 8 版 IIB 期（pT3bN0M0）。」（医生记录原文摘录）' },
        { d: '2026-08-25', label: 'IIB 期（维持）', quote: '「分期维持 IIB 期，继续辅助治疗与双轨随访。」（复诊记录原文摘录）' }
      ],
      stageNote: '分期只引用医生与病理原文，本台不自算、不生成 TNM→分期推导。',
      slnb: {
        state: 'result', label: '结果原文', d: '2026-02-24',
        quote: '「前哨淋巴结 0/2 枚见转移（阴性）。」（病理报告原文摘录）',
        why: '医生记录：用于判断区域淋巴结是否有转移，结果会进入分期与后续讨论。',
        when: '与扩大切除同次手术（2026-02-24）。',
        change: '结果会进入分期档案；是否做、何时做由治疗团队决定，本页不做推荐。',
        states: ['未做', '结果原文', '未记录']
      },
      molecular: [
        {
          marker: 'BRAF V600E', status: 'not_tested', value: null, date: null, method: null,
          explain: '未检测。未检测不等于阴性——报告里没有的项目按「未检测」记；是否补测、以及对方案的影响，由医生结合分期与治疗讨论。'
        },
        {
          marker: 'NRAS', status: 'not_detected', value: '「NRAS 基因未检出突变」（分子病理报告原文摘录）',
          date: '2026-03-02', method: 'PCR / 测序（报告原文）',
          explain: '未检出是「送检了、结果为阴性」的意思，与「未检测」不同。'
        },
        {
          marker: 'TERT 启动子', status: 'not_tested', value: null, date: null, method: null,
          explain: '未检测。未检测不等于阴性；TERT 目前没有获批的针对性药物，是否补测由医生说明。'
        }
      ],
      molecularNote: '三态并列：检出 / 未检出 / 未检测。阳性可能有靶向选项；阴性仍有免疫治疗等其他选项——具体方案由医生判断，本页不推荐。'
    },

    treatment: {
      pathway: [
        { d: '2025-11-02', phase: '自查', text: '足底黑斑首次记录（自述「以为是鸡眼」）' },
        { d: '2026-01-12', phase: '就诊', text: '皮肤科门诊；建议活检（病历原文）' },
        { d: '2026-02-10', phase: '活检', text: '切除活检（病理报告原文）' },
        { d: '2026-02-24', phase: '手术', text: '扩大切除 + 前哨淋巴结活检' },
        { d: '2026-03-05', phase: '分期', text: 'AJCC 第 8 版 IIB 期（医生记录原文）' },
        { d: '2026-07-31', phase: '辅助治疗', text: '帕博利珠单抗辅助治疗开始（医生方案原文）' }
      ],
      pathwayNote: '辅助 vs 晚期、计划 vs 实际分列；换线或停药原因只留痕，不评疗效、不判进展。',
      planVsActual: [
        { item: '辅助免疫方案', plan: '帕博利珠单抗 200mg Q3W，计划 12 个月（医生方案原文）', actual: '已完成 4 次，最近 2026-10-02；下次 2026-10-30（预约）' },
        { item: '皮肤随访', plan: '每 3 个月（医生计划原文）', actual: '2026-05-26、2026-08-25 已完成；下一次 2026-11-24（预约）' },
        { item: '影像随访', plan: '每 6 个月（医生计划原文）', actual: '2026-08-20 已完成；下一次 2027-02 前后' }
      ],
      surgeries: [
        {
          d: '2026-02-24', title: '右足跟扩大切除 + 前哨淋巴结活检',
          hospital: '省肿瘤医院 骨与软组织肿瘤科（演示）',
          quote: '「右足跟病灶扩大切除，最近切缘约 1.2cm；前哨淋巴结 2 枚送检。」（手术记录原文摘录）',
          stay: '住院 4 天',
          impact: '术后 2 周内足底负重疼痛，行走改用足跟外侧；恢复节奏与康复由医生安排。',
          margins: '切缘阴性（病理原文）'
        }
      ],
      systemic: {
        kind: 'IO 辅助',
        regimen: '帕博利珠单抗 200 mg 静脉输注，每 3 周一次（医生方案原文）',
        start: '2026-07-31',
        cycles: [
          { n: 1, d: '2026-07-31', status: '已完成' },
          { n: 2, d: '2026-08-21', status: '已完成' },
          { n: 3, d: '2026-09-11', status: '已完成' },
          { n: 4, d: '2026-10-02', status: '已完成' },
          { n: 5, d: '2026-10-30', status: '已预约' }
        ],
        note: '周期、延迟与停药原因只记录；不评疗效、不判进展。'
      }
    },

    irae: {
      intro: 'IO / 靶向毒性四轨并列，各自独立，不与皮损档案混；永不加总、不折算。',
      tracks: [
        { key: 'skin', name: 'A 轨 · 皮肤（皮疹/瘙痒）', status: '1 级（院方记录原文）', latest: '2026-09-11 起', detail: '第 6 周出现面颊与前胸散在红斑、瘙痒；院方记录「1 级皮疹」。', color: '#c46a2b' },
        { key: 'gi', name: 'B 轨 · 胃肠（腹泻）', status: '1 次（本人记录，未分级）', latest: '2026-10-05', detail: '腹泻 1 次，当日缓解；未伴发热、便血。', color: '#8a5a0c' },
        { key: 'liver', name: 'C 轨 · 肝（ALT/AST）', status: 'ALT 轻度升高（化验单原文）', latest: '2026-10-16 ALT 48 U/L', detail: 'ALT 30→58→62→48 U/L（化验单原文）；是否与药物相关由医生判断。', color: '#2E6B4F' },
        { key: 'endocrine', name: 'D 轨 · 内分泌（TSH/FT4）', status: 'TSH 2.0 mIU/L（化验单原文）', latest: '2026-10-16', detail: 'TSH 1.8→2.2→2.4→2.0 mIU/L；参考区间以化验单为准。', color: '#55707E' }
      ],
      events: [
        { d: '2026-09-11', track: 'skin', text: '面颊、前胸散在红斑伴瘙痒；院方记录 1 级（原文引用）' },
        { d: '2026-09-25', track: 'skin', text: '皮疹范围未扩大（本人照片记录，不做判读）' },
        { d: '2026-10-05', track: 'gi', text: '腹泻 1 次，当日缓解（本人记录）' },
        { d: '2026-10-16', track: 'liver', text: '复查 ALT 48 U/L（化验单原文）' }
      ],
      note: '严重度只引用院方 / CTCAE 原文；四轨各自归一化，永不加总。',
      rashPhotos: [
        { d: '2026-09-11', site: '面颊', tone: '#e4b1a4', text: '散在红斑，瘙痒（本人记录）' },
        { d: '2026-09-25', site: '前胸', tone: '#dfae9f', text: '范围未扩大（本人记录）' }
      ],
      photoNote: PHOTO_NOTE,
      questions: [
        { q: '皮疹是否伴发热？', a: '无（本人记录 2026-09-11）' },
        { q: '是否伴气短？', a: '无（本人记录 2026-09-11）' },
        { q: '是否伴黄疸？', a: '无（本人记录 2026-09-11）' },
        { q: '腹泻次数是否增加？', a: '1 次，当日缓解（2026-10-05）' }
      ],
      attribution: {
        options: ['像药的反应', '像病的变化', '其他', '不知道'],
        self: '不知道（本人自评）',
        note: '自评只记录感受，不做归因；界面不出现「这是药引起的」。'
      },
      delayed: '皮肤反应可能延迟出现，甚至出现在停药后（C8）；出现新皮疹时，时间关系由治疗团队判断。',
      redlines: ['皮疹伴发热或寒战', '大面积水疱或皮肤剥脱', '腹泻次数明显增加或便血', '眼白/皮肤发黄', '气短或胸闷'],
      redlineNote: '出现以上任一情况，尽快联系治疗团队；本页只列信号，不做分诊、不下诊断。',
      contacts: [{ d: '2026-09-12', text: '已致电治疗团队：皮疹 1 级，按医嘱继续观察（本人记录）' }]
    },

    followup: {
      intro: '两轨不同频是正常的：A 轨皮肤线、B 轨影像线各自节奏、各自下一次节点；不生成合并「下次总复查」。',
      tracks: [
        { key: 'skin', name: 'A 轨 · 皮肤线', start: '2026-05-26', interval: '每 3 个月（医生计划原文）', next: '2026-11-24', nextNote: '以预约为准', items: ['全身皮肤检查', '皮肤镜（按医生安排）', '疤痕与新发痣对照'] },
        { key: 'imaging', name: 'B 轨 · 影像线', start: '2026-08-20', interval: '每 6 个月（医生计划原文）', next: '2027-02-20 前后', nextNote: '以预约为准', items: ['区域淋巴结超声', '按医生安排的其他影像'] }
      ],
      skinVisits: [
        { d: '2026-05-26', kind: '全身皮肤检查 + 皮肤镜', quote: '「右足跟术后疤痕愈合良好，全身皮肤未见明确新发异常。」（复诊记录原文摘录）', scope: '全身皮肤（含足底、趾缝、甲下）', author: '医生记录' },
        { d: '2026-08-25', kind: '全身皮肤检查', quote: '「背部右肩胛小痣约 4mm，建议对照观察。」（复诊记录原文摘录）', scope: '全身皮肤（含足底、趾缝、甲下）', author: '医生记录' }
      ],
      imagingVisits: [
        { d: '2026-08-20', kind: '区域淋巴结超声', quote: '「双侧腹股沟区未见明确异常淋巴结。」（超声报告原文摘录）', measure: '未见需测量的靶淋巴结（报告原文）', method: '超声（同一模态）' }
      ],
      imagingNote: '同一模态才可并列，跨模态不共轴；不判读。',
      privacy: {
        default: '仅本人可见（演示默认）',
        options: ['检查范围（全身/局部）', '是否保留内衣', '医生性别偏好', '是否需要陪同', '是否需要屏风'],
        note: '偏好只存本机，默认仅本人可见；到院前流程卡可导出给陪同者。'
      },
      flow: ['到院签到', '更换检查服（可按偏好保留内衣）', '全身皮肤检查（含足底 / 趾缝 / 甲下）', '医生说明与下次预约'],
      nextNote: '下一次节点按各自轨道显示；具体项目与间隔以医生安排为准，本页不暗示可以减少检查。'
    },

    metrics: {
      numeric: {
        WEIGHT: [
          { d: '2026-04-24', v: 68.5, src: '术后复查（体重秤记录）' },
          { d: '2026-05-26', v: 68.0, src: '皮肤复查同窗' },
          { d: '2026-07-31', v: 67.2, src: '辅助治疗前' },
          { d: '2026-09-11', v: 66.8, src: '皮疹出现时' },
          { d: '2026-10-16', v: 67.0, src: '复查同窗' }
        ],
        ALT: [
          { d: '2026-04-24', v: 30, src: '辅助治疗前化验（化验单原文）' },
          { d: '2026-05-26', v: 34, src: '复查化验' },
          { d: '2026-07-31', v: 41, src: '治疗前化验' },
          { d: '2026-09-11', v: 58, src: '皮疹同期化验（化验单原文）' },
          { d: '2026-10-02', v: 62, src: '第 4 次治疗前化验' },
          { d: '2026-10-16', v: 48, src: '复查化验' }
        ],
        TSH: [
          { d: '2026-04-24', v: 1.8, src: '辅助治疗前化验' },
          { d: '2026-05-26', v: 1.9, src: '复查化验' },
          { d: '2026-07-31', v: 2.2, src: '治疗前化验' },
          { d: '2026-09-11', v: 2.4, src: '皮疹同期化验' },
          { d: '2026-10-16', v: 2.0, src: '复查化验' }
        ],
        LESION_MM: [
          { d: '2025-11-02', v: 8, src: '自查标尺照片（自述）' },
          { d: '2026-01-12', v: 9, src: '皮肤科门诊标尺照片' },
          { d: '2026-02-10', v: 10, src: '活检前标尺照片' }
        ]
      },
      qual: {
        LESION_EVENT: [
          { d: '2026-01-12', code: 1, label: '皮肤科就诊', src: '门诊记录（原文）' },
          { d: '2026-02-10', code: 2, label: '活检', src: '病理报告（原文）' },
          { d: '2026-02-24', code: 3, label: '手术', src: '手术记录（原文）' },
          { d: '2026-05-26', code: 4, label: '皮肤复查', src: '复诊记录（原文）' }
        ],
        IRAE_SKIN: [
          { d: '2026-09-11', code: 1, label: '1 级皮疹', src: '院方记录原文（只引用，不判定）' }
        ]
      }
    },

    care: {
      intake: [
        { d: '2026-09-01', text: '早餐：粥 + 鸡蛋；午餐：米饭半碗 + 青菜 + 鱼（本人记录）' },
        { d: '2026-09-15', text: '食欲一般，晚餐只吃了半碗面（本人记录）' }
      ],
      weightNote: '体重进指标；不给食谱或热量处方。',
      sun: {
        behaviors: [
          { d: '2026-05-20', text: '户外步行 30 分钟，戴帽子（本人记录）' },
          { d: '2026-07-08', text: '海边半天，长袖 + 防晒霜（本人记录）' }
        ],
        exposure: '晒伤史：儿童期有过 1 次晒伤（本人回忆，未核实）',
        facts: [
          '某版指南提到：减少紫外线暴露是皮肤防护的常见建议（S06，官方患教）。',
          '防晒行为与黑色素瘤的因果关系在观察性研究中并不等于个人归因；是否防护、怎么防护，由你和医生商量。'
        ],
        blame: '「是不是我自己晒出来的」——自责不是道德失败；暴露史是事实记录，不是过错判定。'
      },
      fatigue: [
        { d: '2026-09-20', text: '足底术后走 20 分钟需要休息；上下楼吃力（本人记录）' },
        { d: '2026-10-10', text: '午后疲劳明显，午睡 30 分钟（本人记录）' }
      ],
      fatigueNote: '只记行走与疲劳事实，不给康复处方。'
    },

    mind: {
      fcr: {
        title: '复发恐惧（FCR）自评 · 双源并列',
        patient: [
          { d: '2026-09-28', v: 4, text: '复查前一周睡不好，总摸足底疤痕（本人自评 0–10）' },
          { d: '2026-10-20', v: 3, text: '这周好一些，看到预约短信还是紧（本人自评）' }
        ],
        caregiver: [
          { d: '2026-09-29', v: 5, text: '他嘴上说没事，我看他半夜查手机（妻子自评 0–10）' }
        ],
        note: '患者与照护者各自记录、并列展示、不平均；不承诺恐惧会消失，也不把恐惧当作需要纠正的错误。'
      },
      bodyImage: [
        { d: '2026-10-01', text: '不太愿意让人看到足底疤痕；在家穿袜子（本人记录，private）', visibility: 'private' },
        { d: '2026-10-12', text: '洗澡时看到疤痕会想起手术那天（本人记录，private）', visibility: 'private' }
      ],
      bodyNote: '身体意象与疤痕默认仅本人可见，可逐项授权；不做「好不好看」评价。',
      intimacy: [
        { d: '2026-10-15', text: '和伴侣谈过亲密话题，暂时不想（本人记录，private）', visibility: 'private' }
      ],
      intimacyNote: '默认私密、三处过滤；可选话题不是必填表；不按年龄推断，不给「能不能」结论。',
      genetic: {
        note: 'BRAF 突变是肿瘤细胞里的体细胞改变，通常不遗传（D5）；家属风险沟通由患者决定，本页只加提示不加判定。',
        qa: [
          { q: '孩子需要做基因检测吗？', a: '「BRAF V600E 是体细胞突变，不作为遗传筛查指征；如家族内有其他肿瘤史，可另与遗传门诊讨论。」（医生答复原文摘录，2026-08-25）' }
        ]
      }
    },

    docs: {
      materials: [
        { id: 'm1', name: '病理报告原件（含 Breslow / 溃疡 / 切缘 / SLNB）', why: '分期与随访解读的原文出处', state: 'ready' },
        { id: 'm2', name: '手术记录与出院小结', why: '术式、切缘与术后注意事项的原文出处', state: 'ready' },
        { id: 'm3', name: '分子检测报告（NRAS 阴性；BRAF 未检测）', why: '三态核对用', state: 'ready' },
        { id: 'm4', name: '最近一次血常规 / 肝功 / 甲功化验单', why: 'IO 轨道对照用', state: 'partial' },
        { id: 'm5', name: '最近一次区域淋巴结超声报告', why: '影像线对照用', state: 'ready' },
        { id: 'm6', name: '医保报销材料（属地流程自行咨询）', why: '复诊费用报销', state: 'todo' }
      ],
      documents: [
        { id: 'd1', name: '病理报告 2026-03-02（扫描件）', kind: 'pdf', size: '1.2 MB', status: '已核对' },
        { id: 'd2', name: '手术记录 2026-02-24', kind: 'pdf', size: '0.5 MB', status: '已核对' },
        { id: 'd3', name: '分子检测报告 2026-03-02', kind: 'pdf', size: '0.4 MB', status: '已核对' },
        { id: 'd4', name: '化验单 2026-10-16（手机拍照）', kind: '图片', size: '2.1 MB', status: '待核对' }
      ],
      candidates: [
        { id: 'c1', field: 'ALT', value: '48 U/L', src: '化验单 2026-10-16 拍照识别（演示候选）', state: '待核对' },
        { id: 'c2', field: 'TSH', value: '2.0 mIU/L', src: '化验单 2026-10-16 拍照识别（演示候选）', state: '待核对' },
        { id: 'c3', field: '皮疹分级（院方原文）', value: '「1 级皮疹」', src: '门诊记录 2026-09-11 拍照识别（演示候选）', state: '待核对' }
      ],
      questions: [
        { id: 'q1', text: 'BRAF 没检测，要不要补测？补测会改变现在的辅助方案吗？', asked: false, src: '分子三态 · 2026-08-25 复诊后生成' },
        { id: 'q2', text: '皮疹 1 级 + ALT 轻度升高，下一次治疗前还要查什么？', asked: false, src: 'IO 不良反应轨道 · 2026-10-16 化验后生成' },
        { id: 'q3', text: '足底疤痕走路还疼，康复要练到什么程度？', asked: false, src: '疲劳与日常活动 · 场景生成' }
      ],
      trials: [
        { key: 'chinadrugtrials:CTR20200504', title: '达拉非尼联合曲美替尼作为BRAF突变阳性黑色素瘤辅助治疗', phase: '登记信息未列', status: '登记状态，未核实', source: 'chinadrugtrials' },
        { key: 'chinadrugtrials:CTR20231034', title: '在高危黑色素瘤中比较MK-7684A与帕博利珠单抗辅助治疗的III期研究', phase: 'III', status: '登记状态，未核实', source: 'chinadrugtrials' },
        { key: 'chinadrugtrials:CTR20233401', title: 'GC101 TIL治疗晚期黑色素瘤患者的临床试验', phase: '登记信息未列', status: '登记状态，未核实', source: 'chinadrugtrials' }
      ],
      exportNote: '两区导出：事实（记录与原文） / 我的看法与担心；private 默认过滤，导出不含完整本机路径。'
    }
  });

  /* ══════════════ DEMO-2 王琳 · 背部浅表扩散型 IB · 靶向辅助第 5 月 ══════════════ */
  D.profiles.push({
    id: 'demo2',
    name: '王琳（演示）',
    age: 33,
    gender: '女',
    diagnosis: '背部浅表扩散型黑色素瘤 · 扩大切除术后（演示）',
    diagnosisShort: '浅表扩散型 IIIB · 术后 8 个月',
    stageLine: 'IIIB 期（pT2aN1bM0；AJCC 第 8 版，医生记录引用；本台不自算、不判定）',
    primaryRole: 'CAREGIVER',
    caregiverLabel: '丈夫（照护者 · 代记为主）',
    hero: {
      selfCheck: '背部盲区由丈夫代检并代记（author_role=CAREGIVER）',
      dualTrack: '皮肤线 3 个月 · 影像线 6 个月',
      irae: '靶向发热 + 皮疹（第 5 月）'
    },

    selfCheck: {
      headline: '背部自己看不到，丈夫代检并代记；这是一条确诊前的记录。',
      firstFound: {
        d: '2026-01-05',
        site: '背部 · 左肩胛下',
        text: '洗澡后丈夫发现背上一颗痣颜色变深、边缘不整齐；她本人看不到，由丈夫拍照留存。'
      },
      rhythm: '每 2 个月一次（本人与丈夫共同设定；不鼓励每日检查）',
      siteOrder: SITE_ORDER,
      sites: [
        { code: 'sole', name: '足底', count: 0, latest: null, note: '暂无记录' },
        { code: 'web', name: '趾缝', count: 0, latest: null, note: '暂无记录' },
        { code: 'nail', name: '甲下', count: 0, latest: null, note: '暂无记录' },
        { code: 'palm', name: '手掌', count: 0, latest: null, note: '暂无记录' },
        { code: 'finger', name: '指甲', count: 0, latest: null, note: '暂无记录' },
        { code: 'side', name: '足侧', count: 0, latest: null, note: '暂无记录' },
        { code: 'back', name: '背部', count: 1, latest: '2026-02-01', note: '左肩胛下 1 条（已手术）；丈夫代检' },
        { code: 'scalp', name: '头皮', count: 0, latest: null, note: '暂无记录' },
        { code: 'ear', name: '耳后', count: 0, latest: null, note: '暂无记录' },
        { code: 'leg', name: '下肢后侧', count: 0, latest: null, note: '暂无记录' },
        { code: 'other', name: '其他', count: 0, latest: null, note: '暂无记录' }
      ],
      lesions: [
        {
          id: 'L1', code: 'back', site: '背部 · 左肩胛下', first: '2026-01-05', sizeMm: 9,
          color: '深褐 + 黑色，颜色不均', shape: '边缘不规则', author: 'CAREGIVER', visibility: 'shared',
          note: '丈夫代检发现；本人看不到，由丈夫拍照并代记。',
          abcde: { A: '不对称', B: '边缘不规则', C: '颜色不均', D: '约 9mm', E: '颜色变深、边缘变化' }
        }
      ],
      photos: [
        { id: 'P1', lesion: 'L1', d: '2026-01-05', site: '背部 · 左肩胛下', sizeMm: 9, tone: '#4a3a3f', text: '丈夫代拍：颜色变深、边缘不整齐', author: 'CAREGIVER' },
        { id: 'P2', lesion: 'L1', d: '2026-01-12', site: '背部 · 左肩胛下', sizeMm: 9, tone: '#443338', text: '皮肤科标尺照片（丈夫陪同）', author: 'CAREGIVER' },
        { id: 'P3', lesion: 'L1', d: '2026-02-01', site: '背部 · 左肩胛下', sizeMm: 10, tone: '#3c2c31', text: '术前标尺照片，最大径约 10mm', author: 'CAREGIVER' }
      ],
      photoNote: PHOTO_NOTE,
      timeline: [
        { d: '2026-01-05', kind: '代检', text: '丈夫发现背部痣颜色变深、边缘不整齐（照护者代记）', author: 'CAREGIVER' },
        { d: '2026-01-12', kind: '皮肤科', text: '门诊病历：「左肩胛下约 9mm 色素性皮损，边缘不规则。」', author: '医生记录' },
        { d: '2026-01-20', kind: '活检', text: '切除活检（病理报告原文）', author: '医院' },
        { d: '2026-02-05', kind: '手术', text: '扩大切除（前哨淋巴结未做，医生记录原文）', author: '医院' },
        { d: '2026-06-10', kind: '皮肤复查', text: '全身皮肤检查；背部疤痕愈合（医生记录）', author: '医院' },
        { d: '2026-09-09', kind: '皮肤复查', text: '全身皮肤检查 + 皮肤镜（医生记录）', author: '医院' }
      ],
      timelineNote: '同一皮损的历次记录按时间并列；照护者代记条目带「照护者代记」徽章，只并列描述，不生成结论。',
      acral: {
        intro: '肢端自查顺序按中国语境前置足部；背部属于盲区，可由照护者按同一顺序代检并代记。',
        steps: [
          { n: 1, title: '足底', text: '看足跟、足弓、前掌；记录位置、颜色、大小。' },
          { n: 2, title: '趾缝', text: '逐个趾缝看有无黑斑、破溃、出血。' },
          { n: 3, title: '甲下', text: '看黑线宽度、是否到甲周、甲板是否破坏。' },
          { n: 4, title: '手掌与指甲', text: '掌心、指腹、指缝与甲周。' },
          { n: 5, title: '背部（盲区）', text: '由照护者代检：分上背/中背/下背三块，拍照留存并标注部位。' },
          { n: 6, title: '头皮与耳后', text: '由照护者拨开头发看；记录部位与大小。' }
        ],
        questions: ['黑线宽度有没有变化？', '黑线/黑斑是否延伸到甲周皮肤？', '甲板是否出现破坏、裂开或出血？'],
        rhythm: '默认每 2 个月一次；由本人与照护者共同设定，不鼓励每日检查。',
        confusion: [
          { term: '鸡眼', text: '常被用来描述足底受压处的角质增厚，可能伴疼痛；它和黑斑不是一回事，但位置上容易混。' },
          { term: '灰指甲', text: '常被用来描述甲板变色、增厚；甲下黑线/黑斑与甲板变色需要皮肤科区分。' },
          { term: '甲下血肿', text: '常被用来描述甲下出血后的暗色区域，多与外伤有关；是否会消退、要不要处理由医生看。' },
          { term: '摩擦淤青', text: '常被用来描述受压或摩擦后的皮下出血；颜色会随时间变化。' }
        ],
        redline: ['出血', '不愈', '变大', '颜色不均'],
        redlineText: '出现以上情况，建议让皮肤科看；本页只做名词解释，不做任何判断。'
      },
      abcde: {
        intro: 'ABCDE 是五个观察维度的名词解释，不是自我判断工具，也不能用来排除或确认任何疾病。',
        items: [
          { k: 'A', name: 'Asymmetry · 不对称', text: '把斑块想象成可以对折的形状，两半是否大致相似。' },
          { k: 'B', name: 'Border · 边界', text: '边缘是否清楚、是否呈锯齿状或不规则。' },
          { k: 'C', name: 'Color · 颜色', text: '颜色是否均匀，是否同时有深浅不一、红白蓝黑等混色。' },
          { k: 'D', name: 'Diameter · 直径', text: '最大径多少毫米；用尺或参照物记录，不靠记忆。' },
          { k: 'E', name: 'Elevation · 隆起（中国指南口径）', text: '病变是否有隆起/变厚。中国指南的 ABCDE 里 E 指 Elevation（隆起）；国际常见版本 E 指 Evolving（演变）。两套口径并列记录，本卡不替你择一，也不据此判断。' },
          { k: 'E（国际版）', name: 'Evolving · 演变', text: '大小、形状、颜色、症状（痒、痛、出血）是否有变化。与上一条 Elevation 并列；看医生时把两条都带上。' }
        ],
        note: 'ABCDE 只解释名词；是否符合哪几条、意味着什么，由皮肤科医生结合检查说明。本页不出现「符合几条=风险」之类判断。'
      }
    },

    stage: {
      subtype: '浅表扩散型黑色素瘤（背部）',
      breslow: 1.2,
      ulcer: '无溃疡（报告原文）',
      mitoses: '1 个/mm²（报告原文）',
      margins: '切缘阴性，最近切缘约 1.0cm（报告原文）',
      pathologyQuote: '「背部皮肤黑色素瘤，浅表扩散型，Breslow 厚度 1.2 mm，无溃疡，核分裂 1 个/mm²；切缘阴性。pT2aN0M0，AJCC 第 8 版 IB 期。」（病理报告原文摘录，2026-01-26）',
      pathologyNote: '厚度、溃疡、核分裂、切缘逐项照抄报告；本台不由厚度推 T，也不解释「严重不严重」。',
      stageHistory: [
        { d: '2026-02-02', label: 'IB 期', quote: '「AJCC 第 8 版 IB 期（pT2aN0M0）。」（医生记录原文摘录）' },
        { d: '2026-09-09', label: 'IB 期（维持）', quote: '「分期维持 IB 期，继续辅助治疗与双轨随访。」（复诊记录原文摘录）' }
      ],
      stageNote: '分期只引用医生与病理原文，本台不自算、不生成 TNM→分期推导。',
      slnb: {
        state: 'not_done', label: '未做', d: '2026-02-05',
        quote: '「Breslow 1.2 mm，与患者讨论后未行前哨淋巴结活检；按医生安排随访。」（门诊记录原文摘录）',
        why: '医生记录：前哨淋巴结活检用于判断区域淋巴结是否有转移；做与不做会结合厚度、溃疡与患者情况讨论。',
        when: '通常与扩大切除同期讨论；本例未做（原文）。',
        change: '未做也是一个明确状态，不等于「没记录」；后续是否补做由治疗团队决定。',
        states: ['未做', '结果原文', '未记录']
      },
      molecular: [
        {
          marker: 'BRAF V600E', status: 'detected', value: '「BRAF V600E 突变阳性」（分子病理报告原文摘录）',
          date: '2026-01-26', method: 'PCR（报告原文）',
          explain: '检出表示送检样本中发现了该突变。阳性可能有靶向选项；是否使用、用哪种，由医生结合分期与获益/风险讨论。'
        },
        {
          marker: 'NRAS', status: 'not_tested', value: null, date: null, method: null,
          explain: '未检测。未检测不等于阴性；是否补测由医生决定。'
        },
        {
          marker: 'TERT 启动子', status: 'not_tested', value: null, date: null, method: null,
          explain: '未检测。未检测不等于阴性；TERT 目前没有获批的针对性药物。'
        }
      ],
      molecularNote: '三态并列：检出 / 未检出 / 未检测。阳性可能有靶向选项；阴性仍有免疫治疗等其他选项——具体方案由医生判断，本页不推荐。'
    },

    treatment: {
      pathway: [
        { d: '2026-01-05', phase: '代检', text: '丈夫发现背部痣变化（照护者代记）' },
        { d: '2026-01-12', phase: '就诊', text: '皮肤科门诊；建议活检（病历原文）' },
        { d: '2026-01-20', phase: '活检', text: '切除活检（病理报告原文）' },
        { d: '2026-02-02', phase: '分期', text: 'AJCC 第 8 版 IB 期（医生记录原文）' },
        { d: '2026-02-05', phase: '手术', text: '扩大切除（前哨淋巴结未做）' },
        { d: '2026-05-20', phase: '辅助治疗', text: '达拉非尼 + 曲美替尼辅助治疗开始（医生方案原文）' }
      ],
      pathwayNote: '辅助 vs 晚期、计划 vs 实际分列；换线或停药原因只留痕，不评疗效、不判进展。',
      planVsActual: [
        { item: '靶向辅助方案', plan: '达拉非尼 + 曲美替尼，计划 12 个月（医生方案原文）', actual: '已治疗满 5 个月（第 5 周期 2026-09-20 已完成）；2026-10-18 因发热 + 皮疹联系团队（记录）' },
        { item: '皮肤随访', plan: '每 3 个月（医生计划原文）', actual: '2026-06-10、2026-09-09 已完成；下一次 2026-12-09（预约）' },
        { item: '影像随访', plan: '每 6 个月（医生计划原文）', actual: '2026-08-12 已完成；下一次 2027-02 前后' }
      ],
      surgeries: [
        {
          d: '2026-02-05', title: '背部扩大切除',
          hospital: '省肿瘤医院 皮肤科 / 黑色素瘤中心（演示）',
          quote: '「左肩胛下病灶扩大切除，最近切缘约 1.0cm；未行前哨淋巴结活检（术前讨论记录）。」（手术记录原文摘录）',
          stay: '住院 2 天',
          impact: '背部切口在穿衣与睡觉时有牵拉感；疤痕护理与活动限制由医生安排。',
          margins: '切缘阴性（病理原文）'
        }
      ],
      systemic: {
        kind: '靶向辅助',
        regimen: '达拉非尼 + 曲美替尼（口服，按说明书与医嘱；剂量照医嘱）',
        start: '2026-05-20',
        cycles: [
          { n: 1, d: '2026-05-20', status: '第 1 月' },
          { n: 2, d: '2026-06-20', status: '第 2 月' },
          { n: 3, d: '2026-07-20', status: '第 3 月' },
          { n: 4, d: '2026-08-20', status: '第 4 月' },
          { n: 5, d: '2026-09-20', status: '第 5 月' }
        ],
        note: '靶向治疗按日口服，周期按月记录；剂量变更与停药原因只留痕，不评疗效、不判进展。'
      }
    },

    irae: {
      intro: '靶向治疗也会出现皮肤与全身反应；四轨并列，各自独立，不与皮损档案混。',
      tracks: [
        { key: 'skin', name: 'A 轨 · 皮肤（皮疹/瘙痒）', status: '皮疹（院方记录待核对）', latest: '2026-10-18', detail: '面部与躯干散在红斑、瘙痒；已拍照记录，等待复诊核对分级。', color: '#c46a2b' },
        { key: 'gi', name: 'B 轨 · 胃肠（腹泻）', status: '暂无记录', latest: '—', detail: '本档案暂无腹泻记录。', color: '#8a5a0c' },
        { key: 'liver', name: 'C 轨 · 肝（ALT/AST）', status: 'ALT 36 U/L（化验单原文）', latest: '2026-10-18', detail: 'ALT 22→28→36 U/L（化验单原文）；是否与药物相关由医生判断。', color: '#2E6B4F' },
        { key: 'endocrine', name: 'D 轨 · 内分泌（TSH/FT4）', status: 'TSH 1.6 mIU/L（化验单原文）', latest: '2026-10-18', detail: 'TSH 1.4→1.6 mIU/L；参考区间以化验单为准。', color: '#55707E' }
      ],
      events: [
        { d: '2026-10-17', track: 'skin', text: '面部、躯干散在红斑伴瘙痒（本人记录）' },
        { d: '2026-10-18', track: 'skin', text: '发热 38.2°C，当日联系治疗团队（本人记录）' },
        { d: '2026-10-18', track: 'liver', text: '复查 ALT 36 U/L（化验单原文）' }
      ],
      note: '严重度只引用院方 / CTCAE 原文；四轨各自归一化，永不加总。发热单列为全身信号，不并入皮肤轨。',
      rashPhotos: [
        { d: '2026-10-17', site: '面部', tone: '#e7b3a8', text: '散在红斑，瘙痒（本人记录）' },
        { d: '2026-10-18', site: '躯干', tone: '#e2ab9e', text: '范围扩大，伴发热 38.2°C（本人记录）' }
      ],
      photoNote: PHOTO_NOTE,
      questions: [
        { q: '皮疹是否伴发热？', a: '是，38.2°C（2026-10-18 本人记录）' },
        { q: '是否伴气短？', a: '无（本人记录）' },
        { q: '是否伴黄疸？', a: '无（本人记录）' },
        { q: '腹泻次数是否增加？', a: '本档案暂无腹泻记录' }
      ],
      attribution: {
        options: ['像药的反应', '像病的变化', '其他', '不知道'],
        self: '像药的反应（本人自评）',
        note: '自评只记录感受，不做归因；界面不出现「这是药引起的」。'
      },
      delayed: '皮肤反应可能在治疗中出现，也可能在停药后出现；出现新皮疹时，时间关系由治疗团队判断。',
      redlines: ['皮疹伴发热或寒战', '大面积水疱或皮肤剥脱', '腹泻次数明显增加或便血', '眼白/皮肤发黄', '气短或胸闷'],
      redlineNote: '出现以上任一情况，尽快联系治疗团队；本页只列信号，不做分诊、不下诊断。',
      contacts: [{ d: '2026-10-18', text: '已致电治疗团队：发热 38.2°C + 皮疹，按医嘱暂停当日服药并复诊（本人记录）' }]
    },

    followup: {
      intro: '两轨不同频是正常的：A 轨皮肤线、B 轨影像线各自节奏、各自下一次节点；不生成合并「下次总复查」。',
      tracks: [
        { key: 'skin', name: 'A 轨 · 皮肤线', start: '2026-06-10', interval: '每 3 个月（医生计划原文）', next: '2026-12-09', nextNote: '以预约为准', items: ['全身皮肤检查', '皮肤镜（按医生安排）', '背部疤痕与盲区代检对照'] },
        { key: 'imaging', name: 'B 轨 · 影像线', start: '2026-08-12', interval: '每 6 个月（医生计划原文）', next: '2027-02-12 前后', nextNote: '以预约为准', items: ['区域淋巴结超声', '按医生安排的其他影像'] }
      ],
      skinVisits: [
        { d: '2026-06-10', kind: '全身皮肤检查', quote: '「背部术后疤痕愈合良好，全身皮肤未见明确新发异常。」（复诊记录原文摘录）', scope: '全身皮肤（含足底、趾缝、甲下）', author: '医生记录' },
        { d: '2026-09-09', kind: '全身皮肤检查 + 皮肤镜', quote: '「背部疤痕周围未见明确异常；左肩胛下色素沉着，建议对照。」（复诊记录原文摘录）', scope: '全身皮肤（含足底、趾缝、甲下）', author: '医生记录' }
      ],
      imagingVisits: [
        { d: '2026-08-12', kind: '区域淋巴结超声', quote: '「双侧腋窝、腹股沟区未见明确异常淋巴结。」（超声报告原文摘录）', measure: '未见需测量的靶淋巴结（报告原文）', method: '超声（同一模态）' }
      ],
      imagingNote: '同一模态才可并列，跨模态不共轴；不判读。',
      privacy: {
        default: '仅本人可见（演示默认）；代记条目可见性逐条设置',
        options: ['检查范围（全身/局部）', '是否保留内衣', '医生性别偏好', '是否需要陪同', '是否需要屏风'],
        note: '偏好只存本机，默认仅本人可见；丈夫代记不等于自动共享，逐条由本人授权。'
      },
      flow: ['到院签到', '更换检查服（可按偏好保留内衣）', '全身皮肤检查（含背部盲区）', '医生说明与下次预约'],
      nextNote: '下一次节点按各自轨道显示；具体项目与间隔以医生安排为准，本页不暗示可以减少检查。'
    },

    metrics: {
      numeric: {
        WEIGHT: [
          { d: '2026-04-20', v: 55.6, src: '治疗前体重' },
          { d: '2026-06-10', v: 55.2, src: '皮肤复查同窗' },
          { d: '2026-08-12', v: 54.8, src: '影像复查同窗' },
          { d: '2026-10-18', v: 54.1, src: '发热复诊同窗' }
        ],
        ALT: [
          { d: '2026-04-20', v: 22, src: '治疗前化验（化验单原文）' },
          { d: '2026-06-10', v: 25, src: '复查化验' },
          { d: '2026-08-12', v: 28, src: '复查化验' },
          { d: '2026-10-18', v: 36, src: '发热复诊化验' }
        ],
        TSH: [
          { d: '2026-04-20', v: 1.4, src: '治疗前化验' },
          { d: '2026-06-10', v: 1.5, src: '复查化验' },
          { d: '2026-08-12', v: 1.6, src: '复查化验' },
          { d: '2026-10-18', v: 1.6, src: '发热复诊化验' }
        ],
        LESION_MM: [
          { d: '2026-01-05', v: 9, src: '丈夫代拍标尺照片' },
          { d: '2026-01-12', v: 9, src: '皮肤科标尺照片' },
          { d: '2026-02-01', v: 10, src: '术前标尺照片' }
        ]
      },
      qual: {
        LESION_EVENT: [
          { d: '2026-01-12', code: 1, label: '皮肤科就诊', src: '门诊记录（原文）' },
          { d: '2026-01-20', code: 2, label: '活检', src: '病理报告（原文）' },
          { d: '2026-02-05', code: 3, label: '手术', src: '手术记录（原文）' },
          { d: '2026-06-10', code: 4, label: '皮肤复查', src: '复诊记录（原文）' }
        ],
        IRAE_SKIN: [
          { d: '2026-10-17', code: 1, label: '皮疹（待核对）', src: '本人记录，待院方核对分级' }
        ]
      }
    },

    care: {
      intake: [
        { d: '2026-09-05', text: '早餐：牛奶 + 面包；午餐：半碗饭 + 蔬菜 + 鸡胸（丈夫代记）' },
        { d: '2026-10-10', text: '发热那两天食欲差，只喝粥（丈夫代记）' }
      ],
      weightNote: '体重进指标；不给食谱或热量处方。',
      sun: {
        behaviors: [
          { d: '2026-06-15', text: '上下班打伞，午间少出门（本人记录）' },
          { d: '2026-08-02', text: '周末公园散步 40 分钟，长袖 + 帽子（丈夫代记）' }
        ],
        exposure: '晒伤史：无明确晒伤史（本人回忆，未核实）',
        facts: [
          '某版指南提到：减少紫外线暴露是皮肤防护的常见建议（S06，官方患教）。',
          '防晒行为与黑色素瘤的因果关系在观察性研究中并不等于个人归因；是否防护、怎么防护，由你和医生商量。'
        ],
        blame: '「是不是我晒出来的」——自责不是道德失败；暴露史是事实记录，不是过错判定。'
      },
      fatigue: [
        { d: '2026-09-25', text: '下午容易累，工作后不想做饭（本人记录）' },
        { d: '2026-10-18', text: '发热后明显乏力，卧床半天（丈夫代记）' }
      ],
      fatigueNote: '只记疲劳与活动事实，不给康复处方。'
    },

    mind: {
      fcr: {
        title: '复发恐惧（FCR）自评 · 双源并列',
        patient: [
          { d: '2026-09-30', v: 5, text: '复查前一周开始睡不着，身上每一处痕迹都让我恐慌（本人自评 0–10）' },
          { d: '2026-10-19', v: 4, text: '发热那晚更怕，脑子里全是「是不是又来了」（本人自评）' }
        ],
        caregiver: [
          { d: '2026-09-30', v: 6, text: '她半夜查手机，我也睡不着；我的怕是另一份（丈夫自评 0–10）' }
        ],
        note: '患者与照护者各自记录、并列展示、不平均；不承诺恐惧会消失，也不把恐惧当作需要纠正的错误。'
      },
      bodyImage: [
        { d: '2026-10-02', text: '背部疤痕不敢穿露背的衣服；拍照时会躲（本人记录，private）', visibility: 'private' },
        { d: '2026-10-14', text: '摸到疤痕还是会难受，觉得身体不再完整（本人记录，private）', visibility: 'private' }
      ],
      bodyNote: '身体意象与疤痕默认仅本人可见，可逐项授权；不做「好不好看」评价。',
      intimacy: [
        { d: '2026-10-16', text: '暂时不想谈亲密话题；希望丈夫先问再靠近（本人记录，private）', visibility: 'private' }
      ],
      intimacyNote: '默认私密、三处过滤；可选话题不是必填表；不按年龄推断，不给「能不能」结论。',
      genetic: {
        note: 'BRAF 突变是肿瘤细胞里的体细胞改变，通常不遗传（D5）；家属风险沟通由患者决定，本页只加提示不加判定。',
        qa: [
          { q: '父母和妹妹需要做基因检测吗？', a: '「BRAF V600E 是体细胞突变，不作为家族遗传筛查指征；如家族内有其他肿瘤史，可另与遗传门诊讨论。」（医生答复原文摘录，2026-09-09）' }
        ]
      }
    },

    docs: {
      materials: [
        { id: 'm1', name: '病理报告原件（含 Breslow / 溃疡 / 切缘）', why: '分期与随访解读的原文出处', state: 'ready' },
        { id: 'm2', name: '手术记录与出院小结', why: '术式、切缘与术后注意事项的原文出处', state: 'ready' },
        { id: 'm3', name: '分子检测报告（BRAF V600E 阳性）', why: '靶向辅助方案的原始依据', state: 'ready' },
        { id: 'm4', name: '最近一次肝功 / 甲功化验单', why: '靶向治疗轨道对照用', state: 'ready' },
        { id: 'm5', name: '最近一次区域淋巴结超声报告', why: '影像线对照用', state: 'ready' },
        { id: 'm6', name: '医保报销材料（属地流程自行咨询）', why: '复诊费用报销', state: 'todo' }
      ],
      documents: [
        { id: 'd1', name: '病理报告 2026-01-26（扫描件）', kind: 'pdf', size: '1.1 MB', status: '已核对' },
        { id: 'd2', name: '手术记录 2026-02-05', kind: 'pdf', size: '0.4 MB', status: '已核对' },
        { id: 'd3', name: '分子检测报告 2026-01-26', kind: 'pdf', size: '0.4 MB', status: '已核对' },
        { id: 'd4', name: '化验单 2026-10-18（手机拍照）', kind: '图片', size: '2.0 MB', status: '待核对' }
      ],
      candidates: [
        { id: 'c1', field: 'ALT', value: '36 U/L', src: '化验单 2026-10-18 拍照识别（演示候选）', state: '待核对' },
        { id: 'c2', field: 'TSH', value: '1.6 mIU/L', src: '化验单 2026-10-18 拍照识别（演示候选）', state: '待核对' },
        { id: 'c3', field: '体温', value: '38.2°C', src: '本人记录 2026-10-18 拍照识别（演示候选）', state: '待核对' }
      ],
      questions: [
        { id: 'q1', text: '发热 38.2°C + 皮疹，达拉非尼/曲美替尼要停到什么时候？由谁决定？', asked: false, src: '免疫与靶向反应 · 2026-10-18 联系团队后生成' },
        { id: 'q2', text: '背部疤痕穿衣服总摩擦，日常怎么护理？', asked: false, src: '身体意象与疤痕 · 场景生成' },
        { id: 'q3', text: '靶向辅助满 12 个月后，复查节奏怎么排？', asked: false, src: '双轨日历 · 场景生成' }
      ],
      trials: [
        { key: 'chinadrugtrials:CTR20200504', title: '达拉非尼联合曲美替尼作为BRAF突变阳性黑色素瘤辅助治疗', phase: '登记信息未列', status: '登记状态，未核实', source: 'chinadrugtrials' },
        { key: 'chinadrugtrials:CTR20211613', title: 'Encorafenib治疗中国晚期转移性BRAF V600E突变实体瘤的I期安全性研究', phase: 'I', status: '登记状态，未核实', source: 'chinadrugtrials' },
        { key: 'chinadrugtrials:CTR20244769', title: 'GC101 TIL治疗晚期黑色素瘤患者的II期临床试验', phase: 'II', status: '登记状态，未核实', source: 'chinadrugtrials' }
      ],
      exportNote: '两区导出：事实（记录与原文） / 我的看法与担心；private 默认过滤，导出不含完整本机路径。'
    }
  });

  return D;
}

function finalize() {
  return buildDemoProfiles();
}

if (process.argv[1] && process.argv[1].endsWith('build-demo-data.mjs')) {
  const data = finalize();
  mkdirSync(dirname(OUT), { recursive: true });
  const body = '// 由 demo/build-demo-data.mjs 生成——唯一数据源，勿手改（DEV-REQUIREMENTS R5）\nconst DEMO_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
  writeFileSync(OUT, body);
  /* ② 开发版离线回退：同一份数据，挂到 window 上（public/app.js 在 API 不通时回退到它）。 */
  const publicDir = join(ROOT, 'public');
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, 'demo-data.js'),
    '/* 由 demo/build-demo-data.mjs 生成；勿手改，改数据请改生成器后重新运行。 */\n'
    + `window.DEMO_DATA = ${JSON.stringify(data)};\n`);
  /* ③ sqlite：schema/00*.sql 全部迁移 + dsh/demo.js 的 seedDemo——与开发版启动同一条播种路径。
     子进程隔离（本脚本直接 import dsh/demo.js 会与它的 build-demo-data import 成环）。 */
  const { execFileSync } = await import('node:child_process');
  const { readdirSync, rmSync } = await import('node:fs');
  const schemaDir = join(ROOT, 'schema');
  const sqlitePath = join(ROOT, 'demo', 'demo-data.sqlite');
  rmSync(sqlitePath, { force: true });
  execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', join(ROOT, 'demo', 'seed-demo-sqlite.mjs'), sqlitePath], { stdio: 'inherit' });
  const executed = readdirSync(schemaDir).filter((f) => f.endsWith('.sql')).sort();
  console.log(`demo-data.js → ${OUT}（profiles=${data.profiles.length}）`);
  console.log(`public/demo-data.js → ${join(publicDir, 'demo-data.js')}（window.DEMO_DATA）`);
  console.log(`demo/demo-data.sqlite → ${sqlitePath}（迁移 ${executed.join(' + ')} + seedDemo 播种）`);
}

export { buildDemoProfiles, finalize };
