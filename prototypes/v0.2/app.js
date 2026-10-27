'use strict';
/* 小痣宝 MolePal · 皮肤黑色素瘤（MEL）工作台原型 v0.2.0（prototypes/v0.2）。
   页面树唯一权威：research-notes/family-landscape.md §6.1–§6.3（10 一级 / 30 二级）。
   红线（DEV-REQUIREMENTS K1–K6）：
   K1 自查档案零诊断性措辞（禁用词见 docs/INTERACTION-DESIGN 与 medical-constraints §14）；ABCDE 只做名词解释；
   K2 皮损照片/记录按部位+时间双视图，变化只并列不判读；
   K3 分期（AJCC 8）与前哨淋巴结只引用原文（三态：未做/结果原文/未记录）；
   K4 分子三态（BRAF/NRAS/TERT，未检测≠阴性）；
   K5 IO 不良反应四轨独立于皮损档案，"皮疹是药还是病"只列问题不归因；
   K6 双轨随访各自节奏并列；防晒只做事实提醒，不做命令式。
   一图秀：数值线用 Fritsch–Carlson 单调三次（防过冲，THY 教训），分类节点只画点不连线；
   .chart .line 的 computed fill 必须是 none（THY 黑块教训）。
   AI 协助：aiPromptWithCtx(page) 生成「场景提示词 + 本页病情上下文」→ postMessage mel:agent-draft
   → 外壳 client 填入原生会话草稿；不自动发送。 */

const APP_INFO = {
  version: '0.2.0',
  build: '2026-10-24',
  channel: 'dsh',
  channelLabel: '开发版 · 交互原型',
  brand: '小痣宝 MolePal',
  en: 'melanoma'
};
APP_INFO.displayVersion = `v${APP_INFO.version}`;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uidSeq = 0;
const uid = (p) => p + (++uidSeq);
const DAY = 86400000;

/* ---------------- icons & nav ---------------- */
const icons = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  mole: 'M12 4a5 5 0 0 1 5 5c0 2.5-1.7 3.4-1.7 5.5H8.7C8.7 12.4 7 11.5 7 9a5 5 0 0 1 5-5ZM9.5 20h5',
  stage: 'M4 19V5m0 14h16M7 15l3-4 3 2 4-6',
  treat: 'M4 20l6-6M10 14 20 4l-1 5-6 6-3-1ZM4 20h5',
  reaction: 'M12 3c3 4 6 7 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10ZM9 14h6',
  calendar: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2m4 0h2',
  chart: 'M4 20V5m0 15h16M8 16l3-5 3 3 4-7',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  mind: 'M9 21v-3H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3 5 5 0 0 1 10 0 3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2v3M9 13h.01M15 13h.01',
  docs: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16M9 15l2 2 4-4'
};
const icon = (k) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[k] || icons.home}"/></svg>`;

/* 页面树（family-landscape §6.2/§6.3：10 一级 / 30 二级） */
const PAGES = [
  ['dash', '看板', 'home'],
  ['self', '自查档案', 'mole'],
  ['stage', '我的分期与分子', 'stage'],
  ['treatment', '治疗历程', 'treat'],
  ['irae', '免疫与靶向反应', 'reaction'],
  ['followup', '双轨随访', 'calendar'],
  ['chart', '病情一图秀', 'chart'],
  ['care', '营养、防晒与体力', 'sun'],
  ['mind', '情绪与身体意象', 'mind'],
  ['docs', '资料与就诊准备', 'docs']
];
const SUBPAGES = {
  self: [['map', '部位地图与皮损列表'], ['lesion', '皮损详情与照片'], ['timeline', '变化与症状时间轴'], ['acral', '肢端专项自查引导'], ['abcde', 'ABCDE 与易混词说明卡']],
  stage: [['pathology', '病理与 Breslow'], ['slnb', '前哨淋巴结与区域淋巴结'], ['record', '分期档案（AJCC 8 引用）'], ['molecular', '分子三态（BRAF·NRAS·TERT）']],
  treatment: [['pathway', '治疗路径与方案'], ['surgery', '手术记录'], ['systemic', '系统治疗周期']],
  irae: [['tracks', 'IO 不良反应轨道'], ['rash', '皮疹照片与「药还是病」问题清单'], ['redline', '致电红线与处理记录']],
  followup: [['calendar', '双轨日历（皮肤线 / 影像线）'], ['skin', '皮肤复查记录'], ['imaging', '影像复查记录'], ['privacy', '复查准备与隐私偏好']],
  care: [['intake', '食量与体重'], ['sun', '防晒与暴露史'], ['fatigue', '疲劳与日常活动']],
  mind: [['feelings', '当下感受（FCR·双人）'], ['body', '身体意象与疤痕'], ['intimacy', '性与亲密（私密）'], ['genetic', '遗传与家属沟通']],
  docs: [['library', '资料库与导入'], ['candidates', '整理草稿与核对'], ['prepare', '就诊准备与导出'], ['trials', '试验线索']]
};
const SUBTITLES = {
  dash: '四点位加三张特色状态卡：自查待记录、双轨下次节点、IO 反应待观察；双主体入口（本人 / 代记）。',
  self: '家族首次「确诊前」入口：部位地图（足底 / 趾缝 / 甲下前置）+ 照片双视图 + 变化时间轴 + 肢端翻译卡；不判断疾病性质、不下结论。',
  stage: 'Breslow / 溃疡 / 核分裂 / 切缘 + SLNB 三态 + AJCC 8 引用 + BRAF/NRAS/TERT 三态；未检测≠阴性。',
  treatment: 'WLE / SLNB / 清扫 + IO 周期 + BRAF/MEK 靶向；计划 vs 实际、停药原因留痕，不评疗效。',
  irae: '四轨并列：A 皮肤 / B 胃肠 / C 肝 / D 内分泌；各轨独立、永不加总，不与皮损档案混。',
  followup: 'A 轨皮肤线、B 轨影像线各自节奏并列；不生成合并「下次总复查」，不暗示可以减少检查。',
  chart: '体重 / IO 实验室（ALT·TSH）/ 同模态皮损测量放回同一段时间；分类节点只画点不连线。',
  care: '食量与体重、防晒与暴露史（只做事实提醒）、足底术后行走与疲劳；不给食谱或康复处方。',
  mind: 'FCR 双人记录（患者 / 照护者并列不平均）+ 疤痕与可见皮肤 + 性与亲密（私密）+ 遗传沟通。',
  docs: '资料库、候选核对、两区导出（private 默认过滤）、试验线索；线索不是推荐。'
};

/* 13 场景直达（INTERACTION-DESIGN v1：S01–S13；HVT X1/X2 的走查锚点） */
const SCENES = [
  ['S01', '痣变了', 'self', 'map', '皮损档案'],
  ['S02', '前哨淋巴结', 'stage', 'slnb', 'SLNB 三态'],
  ['S03', 'BRAF', 'stage', 'molecular', '分子三态'],
  ['S04', '起疹子', 'irae', 'tracks', 'IO 轨道'],
  ['S05', '双轨', 'followup', 'calendar', '双轨日历'],
  ['S06', '复诊准备', 'docs', 'prepare', '复诊摘要'],
  ['S07', '防晒', 'care', 'sun', '暴露史'],
  ['S08', '新发痣', 'self', 'map', '新增部位'],
  ['S09', '影像并列', 'followup', 'imaging', '并列表'],
  ['S10', '营养', 'care', 'intake', '语境记录'],
  ['S11', '身体意象', 'mind', 'body', 'private 记录'],
  ['S12', '试验', 'docs', 'trials', '线索收藏'],
  ['S13', '导入', 'docs', 'library', '候选核对']
];

/* ---------------- 指标目录（与一图秀同一来源：分组单一来源） ---------------- */
const CATALOG = {
  WEIGHT: { name: '体重', unit: 'kg', cat: '体格与营养', color: '#C46A2B', dec: 1, note: '只记体重事实；变化含义请结合饮食与活动记录给医生看，解读归医生与营养科。' },
  ALT: { name: 'ALT（丙氨酸氨基转移酶）', unit: 'U/L', cat: 'IO 实验室', color: '#2E6B4F', dec: 0, note: 'ALT 只照抄化验单；是否与药物相关由治疗团队判断，本台不归因。' },
  TSH: { name: 'TSH（促甲状腺激素）', unit: 'mIU/L', cat: 'IO 实验室', color: '#55707E', dec: 2, note: 'TSH 只照抄化验单与参考区间；是否属于内分泌不良反应由医生判断。' },
  LESION_MM: { name: '皮损最大径（标尺照片）', unit: 'mm', cat: '皮损与反应节点', color: '#8A7F71', dec: 0, note: '同一测量方式（标尺照片 / 报告测量）才可并列；跨模态不共轴，本台不判读。' },
  LESION_EVENT: { name: '皮损记录节点', unit: '', cat: '皮损与反应节点', color: '#8A7F71', dec: 0, categorical: true, note: '就诊 / 活检 / 手术 / 皮肤复查只画节点不连线；节点是记录事实，不是趋势结论。' },
  IRAE_SKIN: { name: 'IO 皮肤反应节点', unit: '', cat: '皮损与反应节点', color: '#A98A5B', dec: 0, categorical: true, note: '严重度只引用院方 / CTCAE 原文；节点不连线，永不加总。' }
};
const CAT_ORDER = ['体格与营养', 'IO 实验室', '皮损与反应节点'];

/* ---------------- AI 协助示例（INTERACTION-DESIGN：填入输入框但不自动发送；候选核对闭环） ---------------- */
const AI_DEMOS = {
  dash: { prompt: '帮我把这半年的自查、双轨随访和 IO 反应排成一段话，复诊时照着说。', cand: { title: '复诊摘要候选（演示）', fields: [['最近自查', '右足跟黑斑 2025-11 发现（自述「以为是鸡眼」）'], ['双轨下次', '皮肤线 2026-11-24 / 影像线 2027-02 前后'], ['IO 反应', '皮疹 1 级（2026-09-11）· 腹泻 1 次']], src: '看板摘要（演示）' } },
  self: { prompt: '帮我把这颗痣从发现到现在的记录按时间排好，只写我当时怎么描述。', cand: { title: '皮损时间线候选（演示）', fields: [['部位', '足底 · 右足跟内侧'], ['首次记录', '2025-11-02（自述「以为是鸡眼」）'], ['变化描述', '只并列当时描述，不判读']], src: '自查档案（演示）' } },
  stage: { prompt: '帮我把 Breslow、溃疡、SLNB 和 BRAF 状态各解释成一句大白话。', cand: { title: '术语解释候选（演示）', fields: [['Breslow', '厚度 3.8 mm（报告原文），解释不是判断'], ['SLNB', '0/2 枚见转移（结果原文）'], ['BRAF', '未检测 ≠ 阴性（本页常驻句）']], src: '分期与分子（演示）' } },
  treatment: { prompt: '帮我把手术、辅助免疫的周期和计划/实际差异整理成一张表。', cand: { title: '治疗时间线候选（演示）', fields: [['手术', '2026-02-24 扩大切除 + SLNB'], ['辅助免疫', '帕博利珠单抗 Q3W 第 4 次（2026-10-02）'], ['口径', '只记录，不评疗效']], src: '治疗历程（演示）' } },
  irae: { prompt: '帮我把皮疹、腹泻、ALT 和 TSH 分开列，别合成一个分数。', cand: { title: 'IO 四轨摘要候选（演示）', fields: [['A 皮肤', '1 级皮疹（院方原文）'], ['B 胃肠', '腹泻 1 次（本人记录）'], ['C/D', 'ALT 48 / TSH 2.0（化验单原文）']], src: 'IO 不良反应轨道（演示）' } },
  followup: { prompt: '帮我把皮肤线和影像线的下一次节点分开列，不要合成一个「总复查」。', cand: { title: '双轨节点候选（演示）', fields: [['A 皮肤线', '下一次 2026-11-24（以预约为准）'], ['B 影像线', '下一次 2027-02 前后'], ['口径', '两轨不同频是正常的']], src: '双轨日历（演示）' } },
  chart: { prompt: '把最近 6 个月的体重、ALT、TSH 变化讲一段给我听，标注哪些是不同指标。', cand: { title: '时段摘要候选（演示）', fields: [['时段', '2026-04-24 → 2026-10-16'], ['体重', '68.5 → 67.0 kg（原文数值）'], ['口径', '每条线按自身范围缩放，不可比']], src: '病情一图秀（演示）' } },
  care: { prompt: '帮我把防晒记录和暴露史整理成事实清单，不要写成命令。', cand: { title: '防晒事实候选（演示）', fields: [['记录', '户外步行 / 海边半天（本人记录）'], ['暴露史', '儿童期 1 次晒伤（未核实）'], ['口径', '只做事实提醒，不做命令式']], src: '防晒与暴露史（演示）' } },
  mind: { prompt: '帮我记一条我自己的感受：复查前一周睡不着。', cand: { title: '感受候选（演示 · 默认私密）', fields: [['内容', '复查前一周睡不着'], ['记录人', '本人'], ['可见性', 'private（默认不进导出）']], src: '当下感受（演示）' } },
  docs: { prompt: '帮我把复诊要问的几条整理成疑问清单。', cand: { title: '疑问清单候选（演示）', fields: [['问题 1', 'BRAF 没检测要不要补测'], ['问题 2', '皮疹 + ALT 升高，下次治疗前查什么'], ['来源', '就诊准备生成']], src: '就诊准备（演示）' } }
};

/* ---------------- state ---------------- */
const state = {
  page: 'dash', sub: {}, profileId: 'demo1',
  range: 'all', zoom: 100,
  sel: { demo1: ['WEIGHT', 'ALT', 'TSH', 'LESION_MM'], demo2: ['WEIGHT', 'ALT', 'TSH', 'LESION_MM'] },
  toggles: { treatment: true, keypoints: true },
  pin: null, flipped: new Set(),
  agent: { open: false, w: 35, draft: null, cand: null },
  cfg: {
    root: '/Users/demo/Documents/MolePal（演示）', size: { doc: 2.4, derived: 0.4, db: 0.2 },
    mineru: true, clinical: false
  }
};

const DATA = typeof DEMO_DATA !== 'undefined' ? DEMO_DATA : { meta: { today: '2026-10-24' }, profiles: [] };
const TODAY = DATA.meta?.today || '2026-10-24';
const profile = () => DATA.profiles.find((p) => p.id === state.profileId) || DATA.profiles[0];
const mem = () => profile();

/* ---------------- 通用 UI ---------------- */
let toastTimer = null;
function toast(t, opts = {}) {
  const el = $('#toast');
  el.innerHTML = `${esc(t)}${opts.back ? '<button class="toast-back" data-action="go" data-page="dash">回看板</button>' : ''}`;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3600);
}
function openModal(title, body, foot = '', eyebrow = '小痣宝 · 交互演示') {
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = body;
  $('#dialog-foot').innerHTML = foot || '<button data-action="close">关闭</button>';
  const d = $('#dialog');
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}
function closeModal() {
  const d = $('#dialog');
  if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
}
function navigate(page, sub) {
  state.page = page;
  state.sub[page] = sub || (SUBPAGES[page] ? SUBPAGES[page][0][0] : '');
  const hash = `#${page}${sub || SUBPAGES[page] ? `/${state.sub[page]}` : ''}`.replace(/\/$/, '');
  if (location.hash !== hash) location.hash = hash; else render();
  render();
}
function aiPromptWithCtx(key) {
  const base = AI_DEMOS[key]?.prompt || '请基于我的记录给出整理建议。';
  const p = profile();
  const ctx = [];
  try {
    ctx.push(`档案：${p.name}，${p.age ?? '—'} 岁，${p.diagnosisShort || p.diagnosis || '皮肤黑色素瘤'}`);
    if (p.stageLine) ctx.push(`当前阶段：${p.stageLine}`);
    if (key === 'self' || key === 'dash') {
      ctx.push(`自查起点：${p.selfCheck.firstFound.d} ${p.selfCheck.firstFound.site}；皮损 ${p.selfCheck.lesions.length} 条（作者角色含 PATIENT / CAREGIVER）`);
    }
    if (key === 'stage') {
      const m = p.stage.molecular.map((x) => `${x.marker}=${({ detected: '检出', not_detected: '未检出', not_tested: '未检测' })[x.status]}`).join('；');
      ctx.push(`分期：${p.stage.subtype}，Breslow ${p.stage.breslow} mm，${p.stage.ulcer}；SLNB=${p.stage.slnb.label}；分子：${m}`);
    }
    if (key === 'irae') {
      const t = p.irae.tracks.map((x) => `${x.name.split('·')[1]?.trim() || x.name}：${x.status}`).join('；');
      ctx.push(`IO/靶向四轨：${t}；自评归因：${p.irae.attribution.self}（只自评，不归因）`);
    }
    if (key === 'followup' || key === 'dash') {
      ctx.push(`双轨：${p.followup.tracks.map((x) => `${x.name} 下一次 ${x.next}`).join('；')}`);
    }
    if (key === 'chart') {
      const w = lastOf('WEIGHT'); const a = lastOf('ALT'); const t = lastOf('TSH');
      ctx.push(`最近数值：体重 ${w?.v ?? '—'} kg（${w?.d ?? '—'}）、ALT ${a?.v ?? '—'} U/L、TSH ${t?.v ?? '—'} mIU/L（均照抄化验单）`);
    }
    if (key === 'mind') {
      const shared = (p.mind.fcr?.visibility ?? 'private') === 'shared';
      if (shared) {
        const f = p.mind.fcr.patient[p.mind.fcr.patient.length - 1];
        ctx.push(`FCR 自评（本人）：${f?.v ?? '—'}/10（${f?.d ?? '—'}）；照护者另有独立记录`);
      } else {
        ctx.push('FCR 与身体意象记录为私密（visibility=private），已按三出口规则过滤，未带入对话');
      }
    }
    if (key === 'docs') {
      ctx.push(`待问 ${p.docs.questions.length} 条；材料 ${p.docs.materials.filter((x) => x.state === 'ready').length}/${p.docs.materials.length} 已备`);
    }
  } catch { /* 上下文取不到就只发提示词本身 */ }
  ctx.push('以上来自本机记录（演示数据），判断由我和治疗团队做。');
  return `${base}\n\n${ctx.join('\n')}`;
}
function lastOf(code) {
  const pts = seriesAll(code);
  return pts.length ? pts[pts.length - 1] : null;
}
function head(title, desc, action = '') {
  return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="actions"><button class="soft" data-action="ai-draft" data-ai="${state.page}">AI 协助</button>${action}</div></div>`;
}
function srcLink(text, src) {
  return `<button class="source-link" data-action="src" data-src="${esc(src)}">${esc(text)}</button>`;
}
function pill(text, kind = '') { return `<span class="pill ${kind}">${esc(text)}</span>`; }
function caregiverBadge(author) { return author === 'CAREGIVER' ? '<span class="caregiver-badge">照护者代记</span>' : ''; }
function stateLabel(status) {
  return ({ detected: '检出', not_detected: '未检出', not_tested: '未检测' })[status] || status;
}

/* ---------------- 序列与治疗条 ---------------- */
function seriesAll(code) {
  const p = profile();
  const m = CATALOG[code];
  if (!m) return [];
  if (m.categorical) return ((p.metrics.qual || {})[code] || []).map((x) => ({ d: x.d, v: x.code, src: x.src, label: x.label }));
  return ((p.metrics.numeric || {})[code] || []).map((x) => ({ d: x.d, v: x.v, src: x.src }));
}
function profileStart() { return DATA.meta?.dataStart || '2025-11-02'; }
function dominoEnd() { return Date.parse(TODAY); }

/* 一图秀（数值线 + 分类节点 + 治疗/随访条） */
const CW = 980, CH = 432, CX0 = 56, CX1 = 950, CY0 = 96, CY1 = 322, NODE_Y = 356;

function domain() {
  const end = dominoEnd();
  const months = { '3m': 3, '6m': 6, '12m': 12 }[state.range];
  const start = months ? new Date(new Date(end).setMonth(new Date(end).getMonth() - months)).getTime() : Date.parse(profileStart());
  const span = end - start;
  const kept = span * state.zoom / 100;
  return [end - kept, end];
}
const inDomain = (d, t0, t1) => { const t = Date.parse(d); return t >= t0 && t <= t1; };
const xOf = (t, t0, t1) => CX0 + (t - t0) / Math.max(1, t1 - t0) * (CX1 - CX0);
function smoothPath(coords) { /* 单调三次 Hermite（Fritsch–Carlson）：过点、防过冲、采样间隔不均匀安全（THY 平滑教训，整段继承） */
  if (!coords.length) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  const n = coords.length, dx = [], sl = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = coords[i + 1].x - coords[i].x;
    sl[i] = dx[i] === 0 ? 0 : (coords[i + 1].y - coords[i].y) / dx[i];
  }
  m[0] = sl[0]; m[n - 1] = sl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (sl[i - 1] * sl[i] <= 0) { m[i] = 0; continue; }
    const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
    m[i] = (w1 + w2) / (w1 / sl[i - 1] + w2 / sl[i]);
  }
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / sl[i], b = m[i + 1] / sl[i], q = a * a + b * b;
    if (q > 9) { const t = 3 / Math.sqrt(q); m[i] = t * a * sl[i]; m[i + 1] = t * b * sl[i]; }
  }
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${(coords[i].x + h).toFixed(1)} ${(coords[i].y + m[i] * h).toFixed(1)}, ${(coords[i + 1].x - h).toFixed(1)} ${(coords[i + 1].y - m[i + 1] * h).toFixed(1)}, ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  return d;
}
function seriesFor(code, t0, t1) {
  const m = CATALOG[code];
  const all = seriesAll(code);
  if (!all.length) return { code, m, lo: 0, hi: 1, span: 1, pts: [], all };
  const vals = all.map((p) => p.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || Math.max(Math.abs(hi) * 0.08, 1);
  return { code, m, lo, hi, span, pts: all.filter((p) => inDomain(p.d, t0, t1)), all };
}
function monthTicks(t0, t1) {
  const out = []; const d = new Date(t0); let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  if (cur.getTime() < t0) cur.setMonth(cur.getMonth() + 1);
  while (cur.getTime() <= t1) {
    const x = xOf(cur.getTime(), t0, t1);
    if (x > CX0 + 6 && x < CX1 - 6) out.push({ x, label: `${String(cur.getFullYear()).slice(2)}-${String(cur.getMonth() + 1).padStart(2, '0')}` });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const step = out.length > 18 ? 4 : out.length > 8 ? 2 : 1;
  return step === 1 ? out : out.filter((_, i) => i % step === 0);
}
function bandsAll(p) {
  const out = [];
  (p.treatment.surgeries || []).forEach((s) => out.push({ kind: 'surgery', label: '手术', date: s.d, color: '#1F4E38' }));
  if (p.treatment.systemic?.start) out.push({ kind: 'systemic', label: '辅助治疗开始', date: p.treatment.systemic.start, color: '#E8590C' });
  (p.followup.skinVisits || []).forEach((x) => out.push({ kind: 'skin', label: '皮肤复查', date: x.d, color: '#8A7F71' }));
  (p.followup.imagingVisits || []).forEach((x) => out.push({ kind: 'imaging', label: '影像复查', date: x.d, color: '#55707E' }));
  return out;
}
function chartSVG(t0, t1) {
  const sel = state.sel[state.profileId];
  const numeric = sel.filter((c) => CATALOG[c] && !CATALOG[c].categorical);
  const cats = state.toggles.keypoints ? ['LESION_EVENT', 'IRAE_SKIN'].filter((c) => CATALOG[c]) : [];
  const series = numeric.map((c) => seriesFor(c, t0, t1)).filter((s) => s.pts.length);
  if (!series.length && !cats.length) {
    return `<div class="empty"><h3>这个时间窗里没有所选指标</h3><p>扩大时间范围，或在左侧加选一个指标。</p></div>`;
  }
  const p = profile();
  const bands = state.toggles.treatment ? bandsAll(p).filter((b) => inDomain(b.date, t0, t1)) : [];
  const yOf = (s, v) => CY1 - (v - s.lo) / s.span * (CY1 - CY0);
  const grid = [0, 1, 2, 3, 4].map((i) => { const y = CY0 + i * (CY1 - CY0) / 4; return `<line class="grid" x1="${CX0}" x2="${CX1}" y1="${y}" y2="${y}"/>`; }).join('');
  const ticks = monthTicks(t0, t1).map((m) => `<text class="tick" x="${m.x}" y="${CY1 + 18}" text-anchor="middle">${m.label}</text>`).join('');
  const xAxis = `<line class="axis" x1="${CX0}" x2="${CX1}" y1="${CY1}" y2="${CY1}"/>`;
  const bandEls = bands.map((b) => {
    const x = xOf(Date.parse(b.date), t0, t1);
    return `<line x1="${x}" x2="${x}" y1="${CY0 - 8}" y2="${CY1}" stroke="${b.color}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".55"/>`
      + `<text x="${x + 3}" y="${CY0 - 12}" fill="${b.color}" font-size="9">${esc(b.label)}</text>`;
  }).join('');
  const lineEls = series.map((s) => {
    const pts = s.pts.map((x) => ({ x: xOf(Date.parse(x.d), t0, t1), y: yOf(s, x.v) }));
    const path = smoothPath(pts);
    const dots = pts.map((pt, i) => `<circle class="pt" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.2" fill="${s.m.color}" data-action="pin" data-code="${s.code}" data-date="${esc(s.pts[i].d)}"/>`).join('');
    const last = s.pts[s.pts.length - 1];
    const label = `<text x="${(pts[pts.length - 1].x + 7).toFixed(1)}" y="${(pts[pts.length - 1].y - 7).toFixed(1)}" fill="${s.m.color}" font-size="10">${esc(s.m.name.split('（')[0])} ${last.v}${esc(s.m.unit)}</text>`;
    return `<path class="line" d="${path}" stroke="${s.m.color}"/>${dots}${label}`;
  }).join('');
  const catEls = cats.map((code, idx) => {
    const s = seriesFor(code, t0, t1);
    const y = NODE_Y + idx * 20;
    return s.pts.map((x, i) => {
      const cx = xOf(Date.parse(x.d), t0, t1);
      const ly = y + (i % 2 ? 12 : -7);
      return `<rect x="${(cx - 3.6).toFixed(1)}" y="${y - 3.6}" width="7.2" height="7.2" transform="rotate(45 ${cx.toFixed(1)} ${y})" fill="${s.m.color}" opacity=".9"/>`
        + `<text x="${cx + 7}" y="${ly}" fill="#6B6157" font-size="8.5">${esc(x.label)}</text>`;
    }).join('');
  }).join('');
  const legend = numeric.map((c) => CATALOG[c] && `<span><i style="background:${CATALOG[c].color}"></i>${esc(CATALOG[c].name)} <span class="range">${fmtRange(c)}</span></span>`).join('');
  const catLegend = cats.map((c) => `<span><i style="background:${CATALOG[c].color};transform:rotate(45deg)"></i>${esc(CATALOG[c].name)}（节点不连线）</span>`).join('');
  return `<div class="legend">${legend}${catLegend}</div>
    <div class="chart-wrap"><svg class="chart" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="多指标时间轴：各条线按自身范围缩放，分类节点只画点不连线">
      <text x="${CX0}" y="22" fill="#8A7F71" font-size="10">${esc(profile().name)} · ${new Date(t0).toISOString().slice(0, 10)} → ${new Date(t1).toISOString().slice(0, 10)}</text>
      ${grid}${xAxis}${ticks}${bandEls}${lineEls}${catEls}
      <text x="${CX1}" y="${CH - 6}" text-anchor="end" fill="#A6B0A7" font-size="9">各条线按自身范围缩放，不代表不同指标数值可比；分类节点只画点不连线</text>
      <text x="${CX0}" y="${NODE_Y + 34}" fill="#A6B0A7" font-size="9">节点轨道：就诊 · 活检 · 手术 · 皮肤复查（只画点）</text>
    </svg></div>`;
}
function fmtRange(code) {
  const s = seriesAll(code);
  if (!s.length) return '';
  const vals = s.map((x) => x.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const m = CATALOG[code];
  return `${lo}–${hi} ${m.unit}`.trim();
}
function metricCard(code) {
  const m = CATALOG[code];
  const all = seriesAll(code);
  if (m.categorical) {
    const last = all[all.length - 1];
    return `<div class="ccard"><span class="cat"><i></i>${esc(m.cat)}</span><span class="name">${esc(m.name)}</span><span class="val">${last ? esc(last.label) : '—'}</span><span class="rec">${last ? esc(last.d) : '暂无记录'} · 只画节点</span><div class="vals">${all.map((x) => `<span>${esc(x.d)} <b>${esc(x.label)}</b></span>`).join('')}</div></div>`;
  }
  const last = all[all.length - 1];
  const prev = all[all.length - 2];
  const delta = last && prev ? (last.v - prev.v) : null;
  const pts = all.slice(-8).map((x, i, arr) => ({ x: 4 + i * (92 / Math.max(1, arr.length - 1)), y: 34 - (x.v - Math.min(...arr.map((z) => z.v))) / Math.max(1, Math.max(...arr.map((z) => z.v)) - Math.min(...arr.map((z) => z.v))) * 26 }));
  const spark = pts.length > 1 ? `<svg class="spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path class="sp-line" d="${smoothPath(pts)}" stroke="${m.color}"/><circle class="sp-dot" cx="${pts[pts.length - 1].x}" cy="${pts[pts.length - 1].y}" r="2.6" fill="${m.color}"/></svg>` : '<div class="na">仅 1 个点，不画趋势线。</div>';
  return `<button class="mcard" data-action="flip" data-code="${code}" aria-pressed="${state.flipped.has(code)}" aria-label="${esc(m.name)}：翻面看口径">
    <span class="mcard-inner"><span class="mface front"><span class="cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span><span class="name">${esc(m.name)}</span><span class="val">${last ? last.v : '—'}<small>${esc(m.unit)}</small></span><span class="delta">${delta === null ? '—' : `${delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} <em>${Math.abs(delta).toFixed(m.dec)}</em> ${esc(m.unit)}（与上次）`}</span>${spark}<span class="rec">${last ? esc(last.d) : '暂无记录'} · ${all.length} 个点</span></span>
    <span class="mface back"><span class="name">${esc(m.name)} · 口径</span><span class="count">${esc(m.note)}</span><span class="foot">点开后不改变数据；口径卡请与复诊时带给医生。</span></span></span></button>`;
}

/* ---------------- 看板 ---------------- */
/* 36 号 §2.6 · 看板首卡状态卡四件：eyebrow / 派生天数 / 现状行 / 出口按钮排。
   天数一律由锚点日（手术日 = Day 0）与演示「今天」计算，不手填；无锚点显示待初始化。 */
function isoDay(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}
function dayDiff(from, to) {
  const a = isoDay(from), b = isoDay(to);
  return a === null || b === null ? null : Math.round((b - a) / 86400000);
}
function primerButton() {
  /* 不用 data-primer-open：那个属性由 primer.js 接管，顶栏「?」会因此不被自动挂载（36 号 §3.2）。
     也不新增 data-action（开发版 public/app.js 没有该模块）；用独立属性 + 本文件自己的委托监听。
     模块未接入（开发版当前状态）时不渲染，避免留一个点了没反应的按钮。 */
  if (typeof window === 'undefined' || !window.DiseasePrimer) return '';
  return '<button class="soft" data-primer-cta aria-haspopup="dialog" aria-controls="disease-primer">疾病概要：皮肤黑色素瘤是什么？</button>';
}
function statusCard(p) {
  const meta = (typeof DEMO_DATA !== 'undefined' && DEMO_DATA.meta) || {};
  const surgery = ((p.treatment && p.treatment.surgeries) || [])[0] || null;
  const anchor = surgery ? surgery.d : '';
  const days = dayDiff(anchor, meta.today || '');
  const nodes = ((p.followup && p.followup.tracks) || []).map((t) => ({
    label: String(t.name || '').replace(/^[A-Z] 轨 · /, ''),
    d: (String(t.next || '').match(/\d{4}-\d{2}-\d{2}/) || [''])[0]
  })).filter((x) => x.d).sort((a, b) => a.d.localeCompare(b.d));
  const nextNode = nodes[0] || null;
  const systemic = (p.treatment && p.treatment.systemic) || null;
  const done = systemic && Array.isArray(systemic.cycles) ? systemic.cycles.filter((c) => c.status === '已完成').length : 0;
  const planLine = ((p.treatment && p.treatment.planVsActual) || []).find((x) => /辅助免疫/.test(String(x.item || '')));
  const nextVisit = planLine ? (String(planLine.actual || '').match(/下次\s*(\d{4}-\d{2}-\d{2})/) || ['', ''])[1] : '';

  if (days === null) {
    return `<div class="stage-strip" data-status-card="uninitialized"><span class="eyebrow">D+N 状态卡</span>`
      + `<span class="stage-now"><b>待初始化</b><small>未找到锚点日（手术日 / Day 0），天数不由本台手填。先去「分期与分子」补手术日期与病理原文；本台暂无独立三步向导。</small></span>`
      + `<div class="actions"><button class="primary" data-action="go" data-page="stage" data-sub="pathology">去补手术日期 →</button>${primerButton()}</div>`
      + `</div>`;
  }
  const nextDate = nextVisit || (nextNode ? nextNode.d : '');
  const nextItem = nextVisit ? '系统治疗预约' : (nextNode ? nextNode.label + '复查' : '');
  const nextTxt = nextDate ? `下次：${nextDate}（${nextItem}）` : '下次：待预约';
  const stateText = systemic ? `${systemic.kind === 'IO 辅助' ? '辅助免疫治疗' : (systemic.kind || '系统治疗')}进行中 · 已完成 ${done} 次` : '治疗后随访';
  return `<div class="stage-strip" data-status-card="ready"><span class="eyebrow">D+${days} 状态卡 · 距${nextNode ? nextNode.label + '复查' : '下一阶段'}</span>`
    + `<span class="stage-day"><b>第 ${days} 天</b><small>锚点 ${esc(anchor)} ${esc(surgery ? surgery.title : '')}（Day 0）</small></span>`
    + `<span class="stage-now"><b>${esc(p.stageLine || '阶段待补')}</b><small>${esc(stateText)} · ${esc(nextTxt)} · 只引用医生与病理原文</small></span>`
    + `<div class="actions"><button class="primary" data-action="go" data-page="treatment" data-sub="systemic">看系统治疗周期 →</button>${primerButton()}</div>`
    + `</div>`;
}
function pageDash() {
  const p = profile();
  const tasks = [
    ['记录一颗痣 / 一块斑', '部位地图 → 新增一条', 'self', 'map', '＋'],
    ['看我的分期与分子', 'Breslow / SLNB / BRAF 三态', 'stage', 'pathology', '◈'],
    ['记一次 IO 反应', '四轨分开，不加总', 'irae', 'tracks', '◎'],
    ['下次皮肤 / 影像复查', '两条线各自节点', 'followup', 'calendar', '▤'],
    ['代记一条变化', 'author_role=CAREGIVER', 'self', 'map', '✎'],
    ['背部盲区代检', '照护者按顺序看一遍', 'self', 'acral', '☑'],
    ['陪诊隐私偏好', '范围 / 内衣 / 陪同', 'followup', 'privacy', '◐'],
    ['复诊材料清单', '两区导出 private 过滤', 'docs', 'prepare', '⇩']
  ];
  const patientTasks = tasks.slice(0, 4).map((t) => `<button class="task-entry" data-action="go" data-page="${t[2]}" data-sub="${t[3]}"><span class="entry-icon">${t[4]}</span><b>${esc(t[0])}</b><span>${esc(t[1])}</span><span class="arrow">›</span></button>`).join('');
  const careTasks = tasks.slice(4).map((t) => `<button class="task-entry" data-action="go" data-page="${t[2]}" data-sub="${t[3]}"><span class="entry-icon">${t[4]}</span><b>${esc(t[0])}</b><span>${esc(t[1])}</span><span class="arrow">›</span></button>`).join('');
  const lesion = p.selfCheck.lesions[0];
  const skin = p.followup.tracks.find((x) => x.key === 'skin');
  const img = p.followup.tracks.find((x) => x.key === 'imaging');
  const latestTrack = p.irae.tracks[0];
  const chips = SCENES.map(([id, label]) => `<button class="scene-chip" data-action="scene" data-scene="${id}">${id} ${esc(label)}</button>`).join('');
  const metricCards = state.sel[state.profileId].map(metricCard).join('');
  return `${head('看板', '把今天能做的一件事放在最前面；自查、双轨随访与 IO 反应都从这里出发。')}
  ${statusCard(p)}
  <div class="duo">
    <div class="duo-col"><span class="duo-tag"><i></i>本人入口 · ${esc(p.name)}</span><div class="task-grid">${patientTasks}</div></div>
    <div class="duo-col care"><span class="duo-tag"><i></i>${esc(p.caregiverLabel)} · 代记入口</span><div class="task-grid">${careTasks}</div></div>
  </div>
  <div class="change-strip">
    <div class="chg"><span>自查待记录</span><b>${esc(lesion.site)} · 最大径 ${lesion.sizeMm}mm</b><p>最近照片 ${esc(p.selfCheck.photos[p.selfCheck.photos.length - 1].d)} · 只并列不判读</p></div>
    <div class="chg"><span>双轨下次节点</span><b>A 皮肤 ${esc(skin.next)}</b><p>B 影像 ${esc(img.next)} · 两轨不同频是正常的</p></div>
    <div class="chg"><span>IO 反应待观察</span><b>${esc(latestTrack.status)}</b><p>${esc(latestTrack.latest)} · 四轨独立、永不加总</p></div>
    <div class="actions"><button class="soft" data-action="go" data-page="self" data-sub="map">去记录</button></div>
  </div>
  <div class="scene-strip"><span class="lab">13 场景直达</span>${chips}</div>
  <div class="notice blue"><b>本页常驻口径：</b>ABCDE 只解释名词，不是判断；分子「未检测」不等于「阴性」；「皮疹是药还是病」只列问题、不归因；照片仅本机保存（接入后）。</div>
  <div class="section-title"><div><h2>最近指标</h2><p>点卡片翻面看口径；数值只照抄化验单 / 记录。</p></div><button class="text-button" data-action="go" data-page="chart">打开一图秀 →</button></div>
  <div class="metric-grid">${metricCards}</div>
  <div class="notice plain" style="margin-top:14px">私密内容（visibility=private）默认不进导出、不进 AI 上下文；需要带入时逐条显式勾选。</div>`;
}

/* ---------------- 线 2 · 自查档案 ---------------- */
function pageSelfMap() {
  const p = profile();
  const sc = p.selfCheck;
  const sites = sc.sites.map((s) => `<div class="site-card ${s.count ? 'has' : ''} ${s.code === sc.lesions[0].code ? 'first' : ''}"><b>${esc(s.name)}</b><span>${s.count ? `${s.count} 条 · 最近 ${esc(s.latest)}` : '暂无记录'}</span><p class="small-note" style="margin-top:3px">${esc(s.note)}</p></div>`).join('');
  const lesions = sc.lesions.map((l) => `<div class="lesion-card"><div class="ls-head"><b>${esc(l.site)}</b>${pill(l.author === 'CAREGIVER' ? '照护者代记' : '本人记录', 'blue')}${pill('visibility=' + l.visibility, 'mist')}</div><p class="small-note">${esc(l.note)}</p><div class="ls-meta"><span><em>首次记录</em>${esc(l.first)}</span><span><em>最大径</em>${l.sizeMm}mm</span><span><em>颜色</em>${esc(l.color)}</span><span><em>形状</em>${esc(l.shape)}</span></div><div class="abcde-mini">${Object.entries(l.abcde).map(([k, v]) => `<span>${k} · ${esc(v)}</span>`).join('')}</div></div>`).join('');
  const photos = sc.photos.map((x) => `<div class="photo-card"><div class="photo-block" style="background:${x.tone}">${esc(x.site)}<br>示意色块</div><div class="ph-meta"><b>${esc(x.d)} · ${esc(x.lesion)}</b><span>最大径 <span class="ph-size">${x.sizeMm}mm</span> · ${x.author === 'CAREGIVER' ? '照护者代拍' : '本人拍摄'}</span></div><div class="ph-text">${esc(x.text)}</div></div>`).join('');
  return `${head('自查档案 · 部位地图与皮损列表', '体表分区按中国语境足底 / 趾缝 / 甲下前置；每条皮损一行，新增部位 = 新增一条，不改表。', '<button class="primary" data-action="lesion-add">＋ 记录一颗痣 / 一块斑</button>')}
  <div class="notice"><b>这是确诊前的入口，也是一条长期存在的线：</b>${esc(sc.firstFound.d)} ${esc(sc.firstFound.site)} · ${esc(sc.firstFound.text)} 节奏：${esc(sc.rhythm)}</div>
  <div class="site-grid">${sites}</div>
  <div class="translation-card" style="margin-top:14px"><h3>肢端翻译卡 · 足底 / 趾缝 / 甲下的自查语境</h3><p>中国语境里，足底与甲下常是第一屏。下面这些词常被用来描述你看到或感觉到的东西；本卡只解释名词，不是诊断，也不写「像什么」。</p><div class="confusion-grid">${sc.acral.confusion.map((c) => `<div class="confusion-card"><b>${esc(c.term)}</b><p>${esc(c.text)}</p><span class="flag">名词解释 · 不是判断</span></div>`).join('')}</div><p style="margin-top:9px"><b>红线（只列信号）：</b>${sc.acral.redline.map((x) => `<span class="pill orange">${esc(x)}</span>`).join(' ')} — ${esc(sc.acral.redlineText)}</p></div>
  <div class="section-title"><div><h2>皮损列表</h2><p>部位 + 时间双视图；变化只并列，不判读。</p></div><button class="text-button" data-action="go" data-page="self" data-sub="lesion" data-step="self-lesion">看皮损详情 →</button></div>
  <div class="lesion-list">${lesions}</div>
  <div class="section-title"><div><h2>照片对比（部位 + 时间）</h2><p>无真实图片：部位色块卡 + 自述文字 + 尺寸变化。</p></div></div>
  <div class="photo-note"><b>照片仅本机保存（接入后）。</b>${esc(sc.photoNote)}</div>
  <div class="photo-compare">${photos}</div>
  <div class="photo-legend"><span><i style="background:#4d2f27"></i>颜色越深 = 自述颜色越深（示意，不是判读）</span><span>尺寸变化只并列数字，不生成结论</span></div>`;
}

function pageSelfLesion() {
  const p = profile();
  const sc = p.selfCheck;
  const l = sc.lesions[0];
  const photos = sc.photos.filter((x) => x.lesion === l.id).map((x) => `<div class="photo-card"><div class="photo-block" style="background:${x.tone}">${esc(x.site)}<br>${x.sizeMm}mm</div><div class="ph-meta"><b>${esc(x.d)}</b><span>${x.author === 'CAREGIVER' ? '照护者代拍' : '本人拍摄'}</span></div><div class="ph-text">${esc(x.text)}</div></div>`).join('');
  const timeline = sc.timeline.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)} · ${esc(x.kind)}</b><p>${esc(x.text)}${caregiverBadge(x.author)}</p></div></div><span class="pill grey">${esc(x.author)}</span></div>`).join('');
  return `${head('皮损详情与照片', '单条皮损的部位 + 时间双视图：带日期的色块照片、自述变化、author_role；只并列不判读。', `<details class="more-menu"><summary aria-label="更多操作">⋯</summary><div class="menu"><button data-action="manual-edit">改这一条（=登记新版本）</button><button data-action="photo-new">补一张照片</button></div></details>`)}
  <div class="grid two">
    <div class="card"><div class="card-head"><div><h2>${esc(l.site)}</h2><p>${esc(l.note)}</p></div>${pill(l.author === 'CAREGIVER' ? 'author_role=CAREGIVER' : 'author_role=PATIENT', 'blue')}</div><div class="ls-meta"><span><em>首次记录</em>${esc(l.first)}</span><span><em>最大径</em>${l.sizeMm}mm</span><span><em>颜色</em>${esc(l.color)}</span><span><em>形状</em>${esc(l.shape)}</span><span><em>可见性</em>${esc(l.visibility)}</span></div><div class="abcde-mini">${Object.entries(l.abcde).map(([k, v]) => `<span>${k} · ${esc(v)}</span>`).join('')}</div><div class="notice plain" style="margin-top:11px"><b>ABCDE 只是名词解释：</b>这里列出的是当时记录的五个维度，不代表任何判断。</div></div>
    <div class="card"><div class="card-head"><div><h2>照片（部位 + 时间）</h2><p>同角度、带标尺 / 参照物；无真实图片。</p></div></div><div class="photo-note"><b>照片仅本机保存（接入后）。</b>不加载真实图片，不做图像判读。</div><div class="photo-compare">${photos}</div></div>
  </div>
  <div class="section-title"><div><h2>变化与症状（同一皮损）</h2><p>只并列「当时怎么描述」。</p></div><button class="text-button" data-action="go" data-page="self" data-sub="timeline" data-step="self-timeline">完整时间轴 →</button></div>
  <div class="card">${timeline}<p class="small-note" style="margin-top:8px">${esc(sc.timelineNote)}</p></div>`;
}

function pageSelfTimeline() {
  const p = profile();
  const sc = p.selfCheck;
  const rows = sc.timeline.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)} · ${esc(x.kind)}</b><p>${esc(x.text)}${caregiverBadge(x.author)}</p></div></div><span class="pill grey">${esc(x.author)}</span></div>`).join('');
  return `${head('变化与症状时间轴', '同一皮损的历次记录按时间排；只并列当时描述，不生成趋势结论。')}
  <div class="card">${rows}<p class="small-note" style="margin-top:8px">${esc(sc.timelineNote)}</p></div>
  <div class="notice blue" style="margin-top:14px">时间轴上的「变大 / 颜色变化」都是当时描述或报告原文；本台不把任何一条解释成病情变化，也不预测下一步。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="self" data-sub="acral" data-step="self-acral">去肢端自查引导 →</button></div>`;
}

function pageSelfAcral() {
  const p = profile();
  const a = p.selfCheck.acral;
  const steps = a.steps.map((s) => `<div class="acral-step"><span class="n">${s.n}</span><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div>`).join('');
  const qs = a.questions.map((q) => `<div>${esc(q)}</div>`).join('');
  return `${head('肢端专项自查引导', '脱鞋 → 足底 → 趾缝 → 趾甲 → 手掌 → 指甲逐部位；看到什么就记什么，不用判断。')}
  <div class="notice"><b>顺序说明：</b>${esc(a.intro)} 节奏：${esc(a.rhythm)}</div>
  <div class="acral-flow">${steps}</div>
  <div class="grid two" style="margin-top:14px">
    <div class="card"><div class="card-head"><div><h2>趾甲 / 甲下三问</h2><p>只问「有没有变化」，不下结论。</p></div></div><div class="acral-q">${qs}</div><p class="small-note" style="margin-top:9px">如果三项里有说不清的，拍照留存，复诊时给皮肤科看。</p></div>
    <div class="card"><div class="card-head"><div><h2>看到这些，建议让皮肤科看</h2><p>只列信号，不做分诊。</p></div></div><div class="redline-box"><b>红线信号</b><div class="tags">${a.redline.map((x) => `<span>${esc(x)}</span>`).join('')}</div><p>${esc(a.redlineText)}</p></div><p class="small-note" style="margin-top:9px">本页不出现「符合几条 = 风险」，也不写让你先等等看这类话。</p></div>
  </div>
  <div class="actions" style="margin-top:14px"><button class="soft" data-action="go" data-page="self" data-sub="abcde" data-step="self-abcde">看 ABCDE 与易混词说明卡 →</button></div>`;
}

function pageSelfAbcde() {
  const p = profile();
  const a = p.selfCheck.abcde;
  return `${head('ABCDE 与易混词说明卡', 'ABCDE 只做名词解释，不是自我判断工具；解释不是判断。')}
  <div class="notice warn"><b>先记住一句：</b>ABCDE 解释不是判断。它只是五个观察维度的名字，不能用来排除或确认任何疾病；是否符合、意味着什么，由皮肤科医生结合检查说明。</div>
  <div class="abcde-grid">${a.items.map((x) => `<div class="abcde-card"><span class="k">${x.k}</span><b>${esc(x.name)}</b><p>${esc(x.text)}</p></div>`).join('')}</div>
  <div class="notice" style="margin-top:14px">${esc(a.note)}</div>
  <div class="translation-card" style="margin-top:14px"><h3>易混词对照（足底 / 趾缝 / 甲下）</h3><p>这些词常被混用；本卡只解释「常被用来描述什么」，不是诊断。</p><div class="confusion-grid">${p.selfCheck.acral.confusion.map((c) => `<div class="confusion-card"><b>${esc(c.term)}</b><p>${esc(c.text)}</p><span class="flag">名词解释 · 不是判断</span></div>`).join('')}</div></div>
  <p class="small-note" style="margin-top:12px">「未检测 ≠ 阴性」「照片仅本机保存（接入后）」两条口径同样适用于自查档案；记录与判断分开。</p>`;
}

/* ---------------- 线 3 · 我的分期与分子 ---------------- */
function pageStagePathology() {
  const p = profile();
  const s = p.stage;
  return `${head('病理与 Breslow', '厚度、溃疡、核分裂、亚型、切缘逐项照抄报告；不由厚度推 T。')}
  <div class="stage-facts">
    <div class="stage-fact"><span>亚型（报告原文）</span><b>${esc(s.subtype)}</b></div>
    <div class="stage-fact"><span>Breslow 厚度</span><b>${s.breslow} mm</b></div>
    <div class="stage-fact"><span>溃疡</span><b>${esc(s.ulcer)}</b></div>
    <div class="stage-fact"><span>核分裂率</span><b>${esc(s.mitoses)}</b></div>
    <div class="stage-fact"><span>切缘</span><b>${esc(s.margins)}</b></div>
  </div>
  <div class="section-title"><div><h2>报告原文</h2><p>解释不是判断；原文旁标来源与日期。</p></div></div>
  <div class="stage-quote">${esc(s.pathologyQuote)}</div>
  <div class="notice plain">${esc(s.pathologyNote)} 来源：病理报告（演示）· 2026-03-02。</div>
  <div class="section-title"><div><h2>分期版本链</h2><p>医生每次给出新分期 = 新增一条，旧记录保留。</p></div></div>
  ${s.stageHistory.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)} · ${esc(x.label)}</b><p>${esc(x.quote)}</p></div></div>${pill('医生记录', 'green')}</div>`).join('')}
  <p class="small-note" style="margin-top:8px">${esc(s.stageNote)}</p>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="treatment" data-sub="pathway" data-step="treatment-pathway">看治疗路径 →</button></div>`;
}

function pageStageSlnb() {
  const p = profile();
  const s = p.stage.slnb;
  const stateKind = s.state === 'result' ? 'green' : s.state === 'not_done' ? 'yellow' : 'dashed';
  return `${head('前哨淋巴结与区域淋巴结', '三态只引用原文：未做 / 结果原文 / 未记录；回答为什么做、什么时候做、做了会改变什么。')}
  <div class="notice blue"><b>三态定义：</b>${s.states.map((x) => `<span class="pill ${x === s.label ? 'green' : 'grey'}">${esc(x)}</span>`).join(' ')} —— 「未做」是一个明确状态，不等于「没记录」。</div>
  <div class="card"><div class="card-head"><div><h2>本例状态：${esc(s.label)}</h2><p>${esc(s.d)} · 来源：病理 / 门诊记录原文</p></div>${pill('SLNB ' + s.label, stateKind)}</div>
    <div class="stage-quote">${esc(s.quote)}</div>
    <div class="stack" style="margin-top:10px">
      <div class="row"><div class="row-main"><div><b>为什么做</b><p>${esc(s.why)}</p></div></div></div>
      <div class="row"><div class="row-main"><div><b>什么时候做</b><p>${esc(s.when)}</p></div></div></div>
      <div class="row"><div class="row-main"><div><b>做了会改变什么</b><p>${esc(s.change)}</p></div></div></div>
    </div>
  </div>
  <div class="notice" style="margin-top:13px">本页不写「要做 / 不要做」的推荐；是否活检、是否清扫，由治疗团队结合厚度、溃疡、患者情况讨论。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="stage" data-sub="pathology" data-step="stage-pathology">回病理与 Breslow →</button></div>
      <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="stage" data-sub="record" data-step="stage-record">看原始记录 →</button></div>
    `;
}

function pageStageRecord() {
  const p = profile();
  const s = p.stage;
  return `${head('分期档案（AJCC 8 引用）', '医生给出的分期、依据原文、日期；版本链留旧分期，不自算、不解释严重不严重。')}
  <div class="stage-facts">
    <div class="stage-fact"><span>当前分期（医生记录）</span><b>${esc(s.stageHistory[s.stageHistory.length - 1].label)}</b></div>
    <div class="stage-fact"><span>分期体系</span><b>AJCC 第 8 版（报告原文）</b></div>
    <div class="stage-fact"><span>最近确认</span><b>${esc(s.stageHistory[s.stageHistory.length - 1].d)}</b></div>
  </div>
  <div class="section-title"><div><h2>版本链</h2><p>只列医生记录与病理原文。</p></div></div>
  ${s.stageHistory.map((x) => `<div class="card" style="margin-bottom:10px"><div class="card-head"><div><h3>${esc(x.d)} · ${esc(x.label)}</h3><p>来源：复诊记录原文摘录</p></div>${pill('引用', 'blue')}</div><div class="stage-quote">${esc(x.quote)}</div></div>`).join('')}
  <div class="notice warn">${esc(s.stageNote)} 本页没有 TNM→分期的推导列，也没有「严重程度」评分。</div>
      <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="stage" data-sub="slnb" data-step="stage-slnb">看前哨淋巴结记录 →</button></div>
    `;
}function pageStageMolecular() {
  const p = profile();
  const mols = p.stage.molecular.map((m) => `<div class="mol-card ${m.status === 'not_tested' ? 'notested' : ''}"><div class="mol-head"><b>${esc(m.marker)}</b>${pill(stateLabel(m.status), m.status === 'detected' ? 'orange' : m.status === 'not_detected' ? 'green' : 'dashed')}</div><div class="val">${m.value ? esc(m.value) : '未检测（报告里没有这一项）'}</div><p>${esc(m.explain)}</p><div class="mol-meta">${m.date ? `检测日期 ${esc(m.date)} · 方法 ${esc(m.method)}` : '没有检测日期与报告原文'} · 未检测 ≠ 阴性</div></div>`).join('');
  return `${head('分子三态（BRAF·NRAS·TERT）', '检出 / 未检出 / 未检测三态并列；未检测不等于阴性；不写具体比例。')}
  <div class="notice warn"><b>本页最重要的一句：</b>未检测不等于阴性。报告里没有的项目按「未检测」记，不能当作「没有突变」。</div>
  <div class="mol-grid">${mols}</div>
  <div class="notice" style="margin-top:13px">${esc(p.stage.molecularNote)}</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="treatment" data-sub="systemic" data-step="treatment-systemic">看系统治疗周期 →</button></div>`;
}

/* ---------------- 线 4 · 治疗历程 ---------------- */
function pageTreatPathway() {
  const p = profile();
  const t = p.treatment;
  /* 阶段折叠卡（TREATMENT-PATHWAY-FOLDOUT 模版）：默认只显「阶段 · 日期 · 一句话概要」；
     医生/家属按需展开五块细节——方案 / 指标和趋势 / 影像发现 / 副作用总结 / 心理与营养措施及效果。
     原生 <details>：零 JS、打印时展开（见 style.css @media print）。 */
  const fold = (x) => `<details class="phase-fold">
      <summary>
        <span class="tl-dot"></span>
        <b class="ph-name">${esc(x.phase)}</b>
        <span class="ph-date">${esc(x.d)}</span>
        <span class="ph-brief">${esc(x.text)}</span>
        <span class="ph-hint">展开细节</span>
      </summary>
      <div class="phase-detail">
        ${[['方案', x.detail?.regimen], ['指标和趋势', x.detail?.metrics], ['影像发现', x.detail?.imaging], ['副作用总结', x.detail?.ae], ['心理与营养措施及效果', x.detail?.support]]
          .map(([title, blk]) => blk ? `<section class="pd-block"><h4>${title}</h4>
            <p class="pd-summary">${esc(blk.summary || '')}</p>
            ${(blk.items || []).map(([k, v]) => `<div class="pd-row"><em>${esc(k)}</em><span>${esc(v)}</span></div>`).join('')}
          </section>` : '').join('')}
      </div>
    </details>`;
  return `${head('治疗路径与方案', '按阶段折叠：默认概要，点开看方案 / 指标 / 影像 / 副作用 / 支持措施；只记录不推荐。')}
  <div class="fold-line">${t.pathway.map(fold).join('')}</div>
  <div class="section-title"><div><h2>计划 vs 实际</h2><p>日期差只并列，不做依从性评判。</p></div></div>
  <div class="table-wrap"><table><thead><tr><th>项目</th><th>计划（医生原文）</th><th>实际（记录）</th></tr></thead><tbody>${t.planVsActual.map((x) => `<tr><td><b>${esc(x.item)}</b></td><td>${esc(x.plan)}</td><td>${esc(x.actual)}</td></tr>`).join('')}</tbody></table></div><div class="scroll-hint">左右滑动查看表格</div>
  <p class="small-note" style="margin-top:8px">${esc(t.pathwayNote)}</p>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="treatment" data-sub="surgery" data-step="treatment-surgery">看手术记录 →</button></div>`;
}

function pageTreatSurgery() {
  const p = profile();
  const ops = p.treatment.surgeries.map((s) => `<div class="card" style="margin-bottom:11px"><div class="card-head"><div><h2>${esc(s.title)}</h2><p>${esc(s.d)} · ${esc(s.hospital)}</p></div>${pill(s.stay, 'grey')}</div><div class="stage-quote">${esc(s.quote)}</div><div class="ls-meta"><span><em>切缘</em>${esc(s.margins)}</span><span><em>住院</em>${esc(s.stay)}</span></div><p class="small-note" style="margin-top:8px">${esc(s.impact)}</p></div>`).join('');
  return `${head('手术记录', 'WLE 范围与切缘、SLNB、淋巴结清扫、足底术后行走影响；术式独立字段，不与系统治疗混写。')}
  ${ops}
  <div class="notice plain">手术相关的不适与康复节奏由医生安排；本页只记录事实，不给康复处方。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="treatment" data-sub="systemic" data-step="treatment-systemic">看系统治疗周期 →</button></div>`;
}

function pageTreatSystemic() {
  const p = profile();
  const s = p.treatment.systemic;
  const rows = s.cycles.map((c) => `<tr class="${c.status === '已预约' ? 'next' : ''}"><td class="num">第 ${c.n} 次</td><td class="num">${esc(c.d)}</td><td>${pill(esc(c.status), c.status === '已预约' ? 'yellow' : 'green')}</td><td class="small-note">周期与状态只按记录；不评疗效</td></tr>`).join('');
  return `${head('系统治疗周期', 'IO 周期（起止、延迟、停药原因）与 BRAF/MEK 靶向分列；不评疗效、不判进展。', '<button class="primary" data-action="cycle-add">＋ 登记一次治疗</button>')}
  <div class="plan-card" style="margin-bottom:13px"><div><span class="eyebrow">当前方案（医生原文）</span><div class="big" style="margin-top:5px">${esc(s.regimen)}</div><p class="small-note" style="margin-top:5px">开始日期 ${esc(s.start)} · 类型 ${esc(s.kind)} · 剂量与周期照医嘱</p></div>${pill('只记录', 'blue')}</div>
  <div class="table-wrap"><table class="cycle-table"><thead><tr><th>周期</th><th>日期</th><th>状态</th><th>口径</th></tr></thead><tbody>${rows}</tbody></table></div><div class="scroll-hint">左右滑动查看表格</div>
  <div class="notice plain" style="margin-top:12px">${esc(s.note)} 剂量变更与停药原因只留痕；界面不出现「耐药」「进展」这类结论。</div>`;
}

/* ---------------- 线 5 · 免疫与靶向反应 ---------------- */
function pageIraeTracks() {
  const p = profile();
  const t = p.irae;
  const tracks = t.tracks.map((x) => `<div class="irae-track"><div class="tr-head"><i style="background:${x.color}"></i><b>${esc(x.name)}</b></div><div class="tr-status">${esc(x.status)}</div><div class="tr-latest">${esc(x.latest)}</div><p>${esc(x.detail)}</p></div>`).join('');
  const events = t.events.map((e) => `<div class="row"><div class="row-main"><div><b>${esc(e.d)} · ${esc((t.tracks.find((x) => x.key === e.track) || {}).name || e.track)}</b><p>${esc(e.text)}</p></div></div></div>`).join('');
  return `${head('IO 不良反应轨道', '四轨并列：A 皮肤 / B 胃肠 / C 肝 / D 内分泌；各轨独立归一化、永不加总；不与皮损档案混。')}
  <div class="notice blue">${esc(t.intro)} <b>皮疹是药还是病</b>只在「问题清单」里记录自评，不在本页下结论。</div>
  <div class="irae-tracks">${tracks}</div>
  <p class="irae-note">${esc(t.note)} 本页不是皮损档案：IO 皮疹不会出现在自查皮损列表里，也不进皮损时间轴。</p>
  <div class="section-title"><div><h2>事件时间线（四轨分开）</h2><p>只记事实与原文；不合并成一个分数。</p></div><button class="text-button" data-action="go" data-page="irae" data-sub="rash" data-step="irae-rash">看皮疹照片与问题清单 →</button></div>
  <div class="card">${events}</div>`;
}

function pageIraeRash() {
  const p = profile();
  const t = p.irae;
  const photos = t.rashPhotos.map((x) => `<div class="photo-card"><div class="photo-block" style="background:${x.tone}">${esc(x.site)}<br>示意色块</div><div class="ph-meta"><b>${esc(x.d)}</b><span>${esc(x.site)} · 本人拍摄</span></div><div class="ph-text">${esc(x.text)}</div></div>`).join('');
  const qs = t.questions.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.q)}</b><p>${esc(x.a)}</p></div></div></div>`).join('');
  const opts = t.attribution.options.map((x) => `<span class="${t.attribution.self.startsWith(x) ? 'on' : ''}">${esc(x)}</span>`).join('');
  return `${head('皮疹照片与「药还是病」问题清单', '照片时间线 + 是否伴腹泻 / 气短 / 黄疸等内脏信号 + 自评；只列问题不归因。', '<button class="primary" data-action="rash-add">＋ 记一次皮疹</button>')}
  <div class="notice warn"><b>口径：</b>「皮疹是药还是病」不归因。本页只记录自评与伴随信号，是否与药物相关由治疗团队判断。</div>
  <div class="photo-note"><b>照片仅本机保存（接入后）。</b>${esc(t.photoNote)}</div>
  <div class="photo-compare">${photos}</div>
  <div class="grid two" style="margin-top:14px">
    <div class="card"><div class="card-head"><div><h2>需要一起看的内脏信号</h2><p>只列问题与本人记录，不做分诊。</p></div></div>${qs}</div>
    <div class="attrib-box"><h2 style="font-size:15px">自评：更像什么？</h2><p style="margin-top:4px">只记录你的感受，不是归因，也不改变任何医疗记录。</p><div class="opts">${opts}</div><p>当前自评：<b>${esc(t.attribution.self)}</b>。${esc(t.attribution.note)}</p></div>
  </div>
  <div class="actions" style="margin-top:14px"><button class="soft" data-action="go" data-page="irae" data-sub="redline" data-step="irae-redline">看致电红线与处理记录 →</button></div>`;
}

function pageIraeRedline() {
  const p = profile();
  const t = p.irae;
  return `${head('致电红线与处理记录', '什么时候需要尽快联系治疗团队（按院方 / 共识原文）；已联系记录与医嘱原话；不给处理方案。')}
  <div class="notice warn"><b>延迟性：</b>${esc(t.delayed)}</div>
  <div class="redline-box"><b>出现以下任一情况，尽快联系治疗团队</b><div class="tags">${t.redlines.map((x) => `<span>${esc(x)}</span>`).join('')}</div><p>${esc(t.redlineNote)}</p></div>
  <div class="section-title"><div><h2>已联系记录</h2><p>只记「联系了谁、当时医嘱原话」；不写处理方案。</p></div></div>
  <div class="card">${t.contacts.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)}</b><p>${esc(x.text)}</p></div></div></div>`).join('') || '<div class="empty"><h3>暂无联系记录</h3><p>如果联系过团队，记一条日期与原话。</p></div>'}</div>
  <div class="notice plain" style="margin-top:12px">本页不写「出现这些症状就是免疫性结肠炎 / 肝炎」这类判断；它只是联系信号清单。</div>`;
}

/* ---------------- 线 6 · 双轨随访 ---------------- */
function pageFuCalendar() {
  const p = profile();
  const f = p.followup;
  const cols = f.tracks.map((t) => `<div class="track-col"><div class="tk-head"><b>${esc(t.name)}</b>${pill(t.interval, 'blue')}</div><p class="small-note">起点 ${esc(t.start)} · 节点 = 起点 + k×间隔（工作台约定，具体以医生为准）</p><div class="next">下一次：${esc(t.next)}<small>${esc(t.nextNote)}</small></div><ul>${t.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  return `${head('双轨日历（皮肤线 / 影像线）', 'A 轨皮肤、B 轨影像各自节奏并列；不生成合并「下次复查」，不暗示可以减少检查。')}
  <div class="dual-note">${esc(f.intro)}</div>
  <div class="dual-track">${cols}</div>
  <div class="notice warn" style="margin-top:14px">本页没有「总复查」日期；两条线的下一次节点分开算。具体项目与间隔以医生安排为准。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="followup" data-sub="skin" data-step="fu-skin">看皮肤复查记录 →</button></div>`;
}

function pageFuSkin() {
  const p = profile();
  const f = p.followup;
  return `${head('皮肤复查记录', '全身皮肤检查 / 皮肤镜、检查范围、医生原话；隐私偏好在本页生效。', '<button class="primary" data-action="skin-add">＋ 登记一次皮肤复查</button>')}
  <div class="privacy-grid" style="margin-bottom:13px"><div class="privacy-item"><b>隐私默认</b><p>${esc(f.privacy.default)}</p></div><div class="privacy-item"><b>检查范围偏好</b><p>可在「复查准备与隐私偏好」逐项设置</p></div><div class="privacy-item"><b>照片</b><p>仅本机保存（接入后）；不随导出默认带出</p></div></div>
  ${f.skinVisits.map((x) => `<div class="card" style="margin-bottom:11px"><div class="card-head"><div><h2>${esc(x.kind)}</h2><p>${esc(x.d)} · ${esc(x.scope)}</p></div>${pill(x.author, 'grey')}</div><div class="stage-quote">${esc(x.quote)}</div></div>`).join('')}
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="followup" data-sub="imaging" data-step="fu-imaging">看影像复查记录 →</button></div>`;
}

function pageFuImaging() {
  const p = profile();
  const f = p.followup;
  return `${head('影像复查记录', '超声 / CT / PET 原文、部位、测量值与方法；同一模态才可并列，跨模态不共轴。', '<button class="primary" data-action="imaging-add">＋ 登记一次影像复查</button>')}
  <div class="table-wrap"><table><thead><tr><th>日期</th><th>检查</th><th>测量原文</th><th>方法</th><th>原文摘录</th></tr></thead><tbody>${f.imagingVisits.map((x) => `<tr><td class="num">${esc(x.d)}</td><td><b>${esc(x.kind)}</b></td><td>${esc(x.measure)}</td><td>${esc(x.method)}</td><td class="small-note">${esc(x.quote)}</td></tr>`).join('')}</tbody></table></div><div class="scroll-hint">左右滑动查看表格</div>
  <div class="notice plain" style="margin-top:12px">${esc(f.imagingNote)} 本页不判读，也不把影像数值和化验数值画在同一根轴上。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="followup" data-sub="privacy" data-step="fu-privacy">看复查准备与隐私偏好 →</button></div>`;
}

function pageFuPrivacy() {
  const p = profile();
  const f = p.followup;
  return `${head('复查准备与隐私偏好', '到院前「会发生什么」流程卡 + 隐私偏好表 + 问题清单；偏好只存本机、默认仅患者可见。')}
  <div class="grid two">
    <div class="card"><div class="card-head"><div><h2>到院前会经历什么</h2><p>流程卡可导出给陪同者。</p></div></div><div class="flow-steps">${f.flow.map((x) => `<span>${esc(x)}</span>`).join('')}</div><p class="small-note" style="margin-top:9px">${esc(f.privacy.note)}</p></div>
    <div class="card"><div class="card-head"><div><h2>隐私偏好（只存本机）</h2><p>${esc(f.privacy.default)}</p></div></div><div class="privacy-grid">${f.privacy.options.map((x) => `<div class="privacy-item">${esc(x)}<br><span class="small-note">可在复诊前逐项设置</span></div>`).join('')}</div></div>
  </div>
  <div class="notice blue" style="margin-top:13px">检查范围 / 内衣 / 医生性别 / 陪同 / 屏风只影响你在本机的记录与到院提示，不改变医院流程；具体安排以医院为准。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="docs" data-sub="prepare" data-step="docs-prepare">去就诊准备与导出 →</button></div>`;
}

/* ---------------- 线 7 · 一图秀 ---------------- */
function pageChart() {
  const p = profile();
  const [t0, t1] = domain();
  const picks = CAT_ORDER.map((cat) => {
    const codes = Object.keys(CATALOG).filter((c) => CATALOG[c].cat === cat);
    return `<div class="cat-label">${esc(cat)}</div>${codes.map((c) => `<label class="metric-pick"><input type="checkbox" data-action="sel" data-code="${c}" ${state.sel[state.profileId].includes(c) ? 'checked' : ''}><i style="background:${CATALOG[c].color}"></i><span>${esc(CATALOG[c].name)}</span><small>${CATALOG[c].categorical ? '节点' : fmtRange(c)}</small></label>`).join('')}`;
  }).join('');
  const pin = state.pin ? `<div class="pin"><div><b>${esc(CATALOG[state.pin.code].name)} · ${esc(state.pin.date)}</b><p>${esc((seriesAll(state.pin.code).find((x) => x.d === state.pin.date) || {}).src || '记录')}</p></div><button class="text-button" data-action="unpin">收起</button></div>` : '';
  return `${head('病情一图秀', '体重 / IO 实验室（ALT·TSH）/ 同模态皮损测量放回同一段时间；分类节点只画点不连线，跨模态不共轴。')}
  <div class="overview">
    <div class="rail">
      <details class="pick" open><summary>指标 <small>最多 4 个</small></summary>${picks}</details>
      <section><h3>时间窗</h3><div class="chips">${[['3m', '3 个月'], ['6m', '6 个月'], ['12m', '12 个月'], ['all', '全病程']].map(([k, v]) => `<button class="chip" data-action="range" data-range="${k}" aria-pressed="${state.range === k}">${v}</button>`).join('')}</div></section>
      <section><h3>图层</h3><div class="chips"><button class="chip" data-action="toggle" data-key="treatment" aria-pressed="${state.toggles.treatment}">治疗 / 随访条</button><button class="chip" data-action="toggle" data-key="keypoints" aria-pressed="${state.toggles.keypoints}">节点标签</button></div>
        <div class="zoom"><input type="range" min="35" max="100" value="${state.zoom}" data-action="zoom" aria-label="缩放"><span>${state.zoom}%</span></div></section>
      <p class="small-note" style="margin-top:12px">各条线按自身 min/max 缩放，只表示自身变化；不同指标不可比。</p>
    </div>
    <div class="timeline-main"><div class="chart-panel"><div class="chart-top"><div><h2>${esc(p.name)} · 一图秀</h2><p class="small-note">数值只照抄化验单 / 标尺照片；分类节点不连线。</p></div>${pill('不判读', 'blue')}</div>${chartSVG(t0, t1)}<div class="scroll-hint">左右滑动查看图表</div>${pin}</div>
      <div class="notice plain">ALT / TSH 属于 IO 实验室轨道；出现数值变化时，是否与药物相关由治疗团队判断。皮损测量只在「同一测量方式」内并列。</div>
    </div>
  </div>`;
}

/* ---------------- 线 8 · 营养、防晒与体力 ---------------- */
function pageCareIntake() {
  const p = profile();
  const c = p.care;
  return `${head('食量与体重', '份量、食物、症状；体重进指标；不给食谱 / 热量处方。', '<button class="primary" data-action="intake-add">＋ 记一次进食</button>')}
  <div class="card">${c.intake.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)}</b><p>${esc(x.text)}</p></div></div></div>`).join('')}</div>
  <div class="notice" style="margin-top:12px">${esc(c.weightNote)} 体重变化请与进食记录一起给医生 / 营养科看。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="care" data-sub="fatigue" data-step="care-fatigue">看疲劳与日常活动 →</button></div>`;
}

function pageCareSun() {
  const p = profile();
  const c = p.care.sun;
  return `${head('防晒与暴露史', '防晒行为、户外活动、晒伤史；只做事实提醒，不做命令式。', '<button class="primary" data-action="sun-add">＋ 记一次户外 / 防晒</button>')}
  <div class="card"><div class="card-head"><div><h2>已记录的行为与暴露史</h2><p>只记事实，不评判。</p></div></div>${c.behaviors.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)}</b><p>${esc(x.text)}</p></div></div></div>`).join('')}<div class="row"><div class="row-main"><div><b>暴露史</b><p>${esc(c.exposure)}</p></div></div></div></div>
  <div class="section-title"><div><h2>事实提醒（不是命令）</h2><p>限定词：通常 / 可能 / 在某版指南里。</p></div></div>
  <div class="flag-list">${c.facts.map((x) => `<div>${esc(x)}</div>`).join('')}</div>
  <div class="notice warn" style="margin-top:12px">${esc(c.blame)}</div>
  <div class="notice plain" style="margin-top:10px">本页不写命令式的防晒要求；是否防护、怎么防护，由你和医生商量。</div>`;
}

function pageCareFatigue() {
  const p = profile();
  const c = p.care;
  return `${head('疲劳与日常活动', '足底术后行走、工作 / 家务节奏、疲劳强度；不给康复处方。', '<button class="primary" data-action="fatigue-add">＋ 记一次活动 / 疲劳</button>')}
  <div class="card">${c.fatigue.map((x) => `<div class="row"><div class="row-main"><div><b>${esc(x.d)}</b><p>${esc(x.text)}</p></div></div></div>`).join('')}</div>
  <div class="notice" style="margin-top:12px">${esc(c.fatigueNote)}</div>
  <div class="notice warn" style="margin-top:10px">足底术后走路疼、需要休息是常见记录项；康复节奏与活动限制请按医生 / 康复团队安排，本台不生成训练计划。</div>`;
}

/* ---------------- 线 9 · 情绪与身体意象 ---------------- */
function pageMindFeelings() {
  const p = profile();
  const f = p.mind.fcr;
  const col = (arr, cls, tag) => `<div class="fcr-col ${cls}"><div class="fcr-tag">${esc(tag)}</div>${arr.map((x) => `<div class="fcr-item"><div class="fcr-score"><b>${x.v}</b><span>/10</span><div class="fcr-bar"><i style="width:${x.v * 10}%"></i></div><span>${esc(x.d)}</span></div><p>${esc(x.text)}</p></div>`).join('')}</div>`;
  return `${head('当下感受（FCR · 双人）', '患者 / 照护者各自记录、并列展示、不平均；检查前 7 天可记睡眠 / 焦虑；不承诺恐惧会消失。', '<button class="primary" data-action="fcr-add">＋ 记一条感受</button>')}
  <div class="notice blue"><b>复发恐惧不是「想太多」：</b>0–IIA 期也可能出现明显 FCR；本页只做自评记录，不诊断焦虑，也不劝你「别想」。</div>
  <div class="fcr-dual">${col(f.patient, '', '本人自评（PATIENT）')}${col(f.caregiver, 'caregiver', '照护者自评（CAREGIVER）')}</div>
  <p class="small-note" style="margin-top:9px">${esc(f.note)}</p>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="mind" data-sub="body" data-step="mind-body">看身体意象与疤痕 →</button></div>`;
}

function pageMindBody() {
  const p = profile();
  const m = p.mind;
  return `${head('身体意象与疤痕', '疤痕、可见皮肤、色素改变；默认仅患者可见，可逐项授权。', '<button class="primary" data-action="body-add">＋ 记一条身体感受</button>')}
  <div class="notice">${esc(m.bodyNote)}</div>
  ${m.bodyImage.map((x) => `<div class="private-row"><b>private · ${esc(x.d)}</b><p>${esc(x.text)}</p></div>`).join('')}
  <div class="notice plain" style="margin-top:12px">本页记录默认不进导出、不进 AI 上下文；需要时由你逐条勾选授权。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="mind" data-sub="intimacy" data-step="mind-intimacy">看性与亲密（私密）→</button></div>
      <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="mind" data-sub="feelings" data-step="mind-feelings">回到 FCR 双人记录 →</button></div>
    `;
}

function pageMindIntimacy() {
  const p = profile();
  const m = p.mind;
  return `${head('性与亲密（私密）', '默认私密、三处过滤；可选话题不是必填表；不按年龄推断，不给「能不能」结论。')}
  <div class="notice legal"><b>默认仅本人可见。</b>${esc(m.intimacyNote)}</div>
  ${m.intimacy.map((x) => `<div class="private-row"><b>private · ${esc(x.d)}</b><p>${esc(x.text)}</p></div>`).join('')}
  <div class="notice" style="margin-top:12px">话题可以空着；如果你想和医生谈，本页可以生成一条疑问放进清单（不自动发送）。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="mind" data-sub="genetic" data-step="mind-genetic">看遗传与家属沟通 →</button></div>`;
}

function pageMindGenetic() {
  const p = profile();
  const g = p.mind.genetic;
  return `${head('遗传与家属沟通', '家属风险沟通由患者决定；只加提示不加判定。')}
  <div class="notice blue">${esc(g.note)}</div>
  <div class="card">${g.qa.map((x) => `<div class="qa-item"><div class="qa-q">${esc(x.q)}</div><blockquote>${esc(x.a)}</blockquote><span class="place">医生答复原文 · 只记录不判定</span></div>`).join('')}</div>
  <div class="notice plain" style="margin-top:12px">是否告诉家人、什么时候告诉、告诉多少，由你决定；本页不评价。</div>`;
}

/* ---------------- 线 10 · 资料与就诊准备 ---------------- */
function pageDocsLibrary() {
  const p = profile();
  const d = p.docs;
  return `${head('资料库与导入', '原件保留、MinerU 解析、失败不产候选；病理 / 影像 / 基因报告分类。', '<button class="primary" data-action="doc-add">＋ 导入一份资料</button>')}
  <div class="notice">导入 → 解析 → 候选 → 核对 → 入库（MinerU 六部件按 18 号）；解析失败不生成候选，原件保留。</div>
  <div class="table-wrap"><table><thead><tr><th>文件</th><th>类型</th><th>大小</th><th>状态</th></tr></thead><tbody>${d.documents.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.kind)}</td><td class="num">${esc(x.size)}</td><td>${pill(x.status, x.status === '已核对' ? 'green' : 'yellow')}</td></tr>`).join('')}</tbody></table></div><div class="scroll-hint">左右滑动查看表格</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="docs" data-sub="candidates" data-step="docs-candidates">去整理草稿与核对 →</button></div>`;
}

function pageDocsCandidates() {
  const p = profile();
  const d = p.docs;
  return `${head('整理草稿与核对', '解析候选逐项 accept 前不进正式数据；候选带来源页与置信标记。')}
  <div class="notice warn"><b>候选不是事实。</b>确认前只在草稿区；确认后进入事实层，拒收不产生副作用。删除不存在——更正 = 登记新版本。</div>
  <div class="card">${d.candidates.map((c) => `<div class="row"><div class="row-main"><div><b>${esc(c.field)} · ${esc(c.value)}</b><p>${esc(c.src)}</p></div></div><div class="actions">${pill(c.state, c.state === '待核对' ? 'yellow' : c.state === '已入库' ? 'green' : 'grey')}${c.state === '待核对' ? `<button class="text-button" data-action="cand-accept" data-id="${c.id}">确认入库</button><button class="text-button" data-action="cand-reject2" data-id="${c.id}">拒收</button>` : ''}</div></div>`).join('')}</div>
  <div class="notice plain" style="margin-top:12px">每条候选都带来源（文件 + 日期 + 页码位）；本页不展示完整本机路径。</div>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="docs" data-sub="prepare" data-step="docs-prepare">去就诊准备与导出 →</button></div>`;
}

function pageDocsPrepare() {
  const p = profile();
  const d = p.docs;
  const mat = d.materials.map((m) => `<div class="mat-row ${m.state === 'ready' ? 'done' : ''}"><input type="checkbox" ${m.state === 'ready' ? 'checked' : ''} aria-label="${esc(m.name)}"><div class="mat-main"><b>${esc(m.name)}</b><p>${esc(m.why)} · ${m.state === 'ready' ? '已备齐' : m.state === 'partial' ? '部分' : '未备齐'}</p></div></div>`).join('');
  return `${head('就诊准备与导出', '两区导出（事实 / 我的看法与担心）+ private 默认过滤；问题清单版本与已过时标记。', '<button class="primary" data-action="q-add">＋ 添加疑问</button>')}
  <div class="grid two">
    <div class="card"><div class="card-head"><div><h2>复诊材料清单</h2><p>只整理复诊与报销材料。</p></div></div><div class="mat-list">${mat}</div></div>
    <div class="card"><div class="card-head"><div><h2>疑问清单</h2><p>只整理不回答；勾选 = 已问。</p></div></div>${d.questions.map((q) => `<div class="q-item"><input type="checkbox" ${q.asked ? 'checked' : ''} data-action="q-asked" data-id="${q.id}" aria-label="已问"><div><b style="font-size:12px">${esc(q.text)}</b><p class="small-note">${esc(q.src)}</p></div></div>`).join('')}</div>
  </div>
  <div class="section-title"><div><h2>两区导出预览</h2><p>事实区 / 我的看法与担心；private 默认过滤。</p></div><div class="actions"><button class="soft" data-action="export">预览导出</button></div></div>
  <pre class="export-pre">${esc(exportMarkdown(p))}</pre>
  <div class="actions" style="margin-top:12px"><button class="soft" data-action="go" data-page="docs" data-sub="trials" data-step="docs-trials">看试验线索 →</button></div>`;
}

function pageDocsTrials() {
  const p = profile();
  const d = p.docs;
  return `${head('试验线索', 'BRAF/MEK、anti-PD-1/CTLA-4、TIL 等 2026 线索；线索不是推荐，不判入组资格。')}
  <div class="notice warn"><b>登记状态，未核实。</b>${esc(DATA.meta.trialNote)}</div>
  ${d.trials.map((t) => `<div class="trial-card"><div class="card-head"><div><h2>${esc(t.title)}</h2><p>${esc(t.key)} · 分期 ${esc(t.phase)} · 来源 ${esc(t.source)}</p></div>${pill(t.status, 'yellow')}</div><p class="small-note">线索只陈列；是否适合参加由研究团队按入组标准判断，本台不判资格。</p></div>`).join('')}
  <div class="notice plain">没有可核实的研究库时不提供检索入口；本页条目来自 2026-10 登记快照，仅作线索。</div>`;
}

/* ---------------- 导出 ---------------- */
function exportMarkdown(p) {
  const fcrPrivate = (p.mind.fcr?.visibility ?? 'private') !== 'shared';
  const privateRows = [...p.mind.bodyImage, ...p.mind.intimacy].length + (fcrPrivate ? 1 : 0);
  return `# ${p.name} · 复诊摘要（演示导出）\n\n## 事实区（记录与原文）\n- 阶段：${p.stageLine}\n- 自查起点：${p.selfCheck.firstFound.d} ${p.selfCheck.firstFound.site}\n- 病理：${p.stage.subtype} · Breslow ${p.stage.breslow}mm · ${p.stage.ulcer}\n- SLNB：${p.stage.slnb.label}\n- 分子：${p.stage.molecular.map((m) => `${m.marker}=${stateLabel(m.status)}`).join('；')}\n- 双轨下一次：${p.followup.tracks.map((t) => `${t.name} ${t.next}`).join('；')}\n- 最近 IO 轨道：${p.irae.tracks.map((t) => `${t.name} ${t.status}`).join('；')}\n\n## 我的看法与担心\n- FCR 自评：${fcrPrivate ? '（私密，已按 visibility 过滤，未包含在本导出）' : p.mind.fcr.patient.map((x) => `${x.d} ${x.v}/10`).join('；')}\n- 照护者另有独立记录（不合并、不平均）\n- private 记录 ${privateRows} 条，默认过滤（未包含在本导出）\n\n口径：只导出记录与原文；不含完整本机路径；判断由我与治疗团队做。`;
}

/* ---------------- 渲染分派 ---------------- */
const RENDERERS = {
  'dash/': pageDash,
  'self/map': pageSelfMap, 'self/lesion': pageSelfLesion, 'self/timeline': pageSelfTimeline, 'self/acral': pageSelfAcral, 'self/abcde': pageSelfAbcde,
  'stage/pathology': pageStagePathology, 'stage/slnb': pageStageSlnb, 'stage/record': pageStageRecord, 'stage/molecular': pageStageMolecular,
  'treatment/pathway': pageTreatPathway, 'treatment/surgery': pageTreatSurgery, 'treatment/systemic': pageTreatSystemic,
  'irae/tracks': pageIraeTracks, 'irae/rash': pageIraeRash, 'irae/redline': pageIraeRedline,
  'followup/calendar': pageFuCalendar, 'followup/skin': pageFuSkin, 'followup/imaging': pageFuImaging, 'followup/privacy': pageFuPrivacy,
  'chart/': pageChart,
  'care/intake': pageCareIntake, 'care/sun': pageCareSun, 'care/fatigue': pageCareFatigue,
  'mind/feelings': pageMindFeelings, 'mind/body': pageMindBody, 'mind/intimacy': pageMindIntimacy, 'mind/genetic': pageMindGenetic,
  'docs/library': pageDocsLibrary, 'docs/candidates': pageDocsCandidates, 'docs/prepare': pageDocsPrepare, 'docs/trials': pageDocsTrials
};
function subnav(page) {
  const subs = SUBPAGES[page];
  if (!subs) return '';
  const cur = state.sub[page] || subs[0][0];
  return `<div class="subnav" role="tablist" aria-label="二级页签">${subs.map(([k, label]) => `<button role="tab" data-action="sub" data-sub="${k}" aria-selected="${cur === k}">${esc(label)}</button>`).join('')}</div>`;
}
function renderNav() {
  $('#nav').innerHTML = PAGES.map(([k, label, ic]) => `<button class="nav-button" data-action="go" data-page="${k}" aria-current="${state.page === k ? 'page' : 'false'}">${icon(ic)}<span>${esc(label)}</span></button>`).join('');
}
function render(opts) {
  const keepScroll = Boolean(opts && opts.keepScroll);
  const p = profile();
  $('#profile-name').textContent = `${p.name.replace('（演示）', '')}的资料`;
  $('#profile-meta').textContent = `${p.age} 岁 · ${p.diagnosisShort}`;
  $('#profile-avatar').textContent = p.name.slice(0, 1);
  $('#breadcrumb').textContent = state.page === 'dash' ? '看板' : (PAGES.find((x) => x[0] === state.page)?.[1] || '') + (SUBPAGES[state.page] ? ' · ' + (SUBPAGES[state.page].find((x) => x[0] === (state.sub[state.page] || SUBPAGES[state.page][0][0]))?.[1] || '') : '');
  const sub = state.sub[state.page] || (SUBPAGES[state.page] ? SUBPAGES[state.page][0][0] : '');
  const fn = RENDERERS[`${state.page}/${sub}`] || RENDERERS[`${state.page}/`] || pageDash;
  $('#main').innerHTML = `<div class="page-enter">${state.page === 'dash' ? '' : '<div class="back-row"><button class="text-button" data-action="go" data-page="dash">← 回看板</button></div>'}${subnav(state.page)}${fn()}</div>`;
  renderNav();
  setAgent(state.agent.open);
  document.body.setAttribute('data-booted', '1');
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ---------------- AI 面板 ---------------- */
function clampAgentW(w) { return Math.min(45, Math.max(25, w)); }
function renderAgent() {
  if (!state.agent.open) return;
  const cand = state.agent.cand;
  const candHtml = cand ? `<div class="agent-cand"><b>候选 · 待核对</b><div class="cand-title">${esc(cand.title)}</div><ul>${cand.fields.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}</ul><small>来源：${esc(cand.src)} · 确认前不进事实层</small><div class="actions"><button class="primary" data-action="cand-ok">确认入库</button><button data-action="cand-fix">逐项修改</button><button data-action="cand-reject">拒收</button></div></div>` : '';
  $('#agent-pane').innerHTML = `<div class="agent-head"><span id="agent-label" class="agent-label">AI 对话 · 演示</span><button id="agent-hide" class="icon-button" data-action="agent-hide" aria-label="收起 AI 对话">×</button></div>
    <div class="agent-body"><div class="notice plain">演示面板：未接入真实 AI，不会发送；真实版本走宿主接口。私密内容默认不进上下文。</div>
    <div class="agent-msg user"><b>本页提示词（已带病情上下文）</b><p>${esc(state.agent.draft ? aiPromptWithCtx(state.agent.draft) : '点页面上的「AI 协助」按钮，会把本页病情上下文一起填入。')}</p></div>
    <div class="agent-msg bot"><b>演示回复（未接通）</b><p>真实版本会基于已核对记录生成候选；本原型只展示候选核对闭环。</p></div>${candHtml}</div>
    <div class="agent-foot"><input placeholder="演示：未接入，输入不可用" disabled aria-label="演示输入框，未接入"></div>`;
}
function setAgent(open) {
  state.agent.open = !!open;
  const pane = $('#agent-pane'); const sp = $('#agent-splitter'); const btn = $('#agent-toggle');
  pane.hidden = !open; sp.hidden = !open;
  btn.setAttribute('aria-expanded', String(!!open));
  btn.textContent = open ? '收起 AI 对话' : 'AI 对话';
  document.documentElement.style.setProperty('--agent-w', `${state.agent.w}%`);
  if (open) renderAgent();
}
function agentResize(delta) {
  state.agent.w = clampAgentW(state.agent.w + delta);
  document.documentElement.style.setProperty('--agent-w', `${state.agent.w}%`);
  const sp = $('#agent-splitter');
  if (sp) sp.setAttribute('aria-valuenow', String(state.agent.w));
}

/* ---------------- 弹窗：档案 / 设置 / 关于 / 导出 ---------------- */
function openProfiles() {
  const rows = DATA.profiles.map((p) => `<button class="profile-row ${p.id === state.profileId ? 'on' : ''}" data-action="use-profile" data-id="${p.id}"><div><b>${esc(p.name)}</b><p>${p.age} 岁 · ${esc(p.diagnosisShort)} · ${esc(p.stageLine)}</p></div><span class="profile-caret">${p.id === state.profileId ? '当前' : '切换'}</span></button>`).join('');
  openModal('切换演示档案', rows, '<button data-action="close">关闭</button>', '小痣宝 · 档案');
}
function openSettings(tab = 'ws') {
  const c = state.cfg;
  openModal('设置（演示）', `<div class="cfg-tabs"><button aria-selected="${tab === 'ws'}">工作区</button><button aria-selected="${tab === 'doc'}">文档解析</button></div>
    <div class="cfg-block" style="margin-top:12px"><b style="font-size:12px">资料目录</b><div class="path-row"><code>${esc(c.root)}</code><button class="soft" data-action="pick-root">更换</button></div><p class="small-note" style="margin-top:5px">不能选主目录、根目录或桌面根；原型只存内存。</p></div>
    <div class="cfg-block" style="margin-top:10px"><b style="font-size:12px">文档解析</b><p class="small-note" style="margin-top:4px">MinerU：${c.mineru ? '已启用（演示）' : '未启用'} · 失败不产候选 · 原件保留</p><p class="small-note">临床数据包：${c.clinical ? '已启用' : '未启用'}（本原型不接真实数据）</p></div>`,
    '<button data-action="close">关闭</button>', '小痣宝 · 设置');
}
function openAbout() {
  openModal('关于小痣宝', `<p style="font-size:12px">${APP_INFO.brand} · 皮肤黑色素瘤（MEL）工作台交互原型</p><p class="small-note" style="margin-top:7px">版本 ${APP_INFO.displayVersion} · 构建 ${APP_INFO.build} · 渠道 ${esc(APP_INFO.channelLabel)}</p><p class="small-note" style="margin-top:7px">演示数据（合成），不指向任何真实患者；不构成诊疗建议。判读归皮肤科与肿瘤治疗团队。</p>`, '<button data-action="close">关闭</button>', '小痣宝 · 关于');
}
function openHelp() {
  openModal('原型操作说明', `<div class="flag-list"><div><b>导航：</b>左侧 10 条一级线，页内二级页签；看板 13 枚场景 chip 可直达。</div><div><b>AI 协助：</b>每页右上「AI 协助」把提示词 + 本页病情上下文填入会话草稿，不自动发送。</div><div><b>记录：</b>每页显式编辑入口 ≤1；表单 ≤6 字段；删除不存在，更正 = 新增版本。</div><div><b>私密：</b>private 默认不进导出 / 不进 AI 上下文。</div><div><b>照片：</b>演示用部位色块 + 日期 + 尺寸；照片仅本机保存（接入后）。</div></div>`, '<button data-action="close">关闭</button>', '小痣宝 · 帮助');
}
function openExport() {
  openModal('导出预览（两区）', `<pre class="export-pre">${esc(exportMarkdown(profile()))}</pre>`, '<button class="primary" data-action="close">关闭</button>', '小痣宝 · 导出');
}
function openForm(title, fields, saveAction, eyebrow = '小痣宝 · 记录') {
  const body = `<div class="form-grid">${fields.map((f) => `<div class="${f.wide ? 'wide' : ''}"><label class="form-label" for="f-${f.id}">${esc(f.label)}</label>${f.type === 'select' ? `<select id="f-${f.id}">${f.options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>` : f.type === 'textarea' ? `<textarea id="f-${f.id}" placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>` : `<input id="f-${f.id}" type="${f.type || 'text'}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}">`}</div>`).join('')}</div><p class="small-note" style="margin-top:9px">表单 ${fields.length} 字段（≤6）；保存 = 新增一条记录，旧记录保留。</p>`;
  openModal(title, body, `<button class="primary" data-action="${saveAction}">保存</button><button data-action="close">取消</button>`, eyebrow);
}
const FORMS = {
  'lesion-add': () => openForm('记录一颗痣 / 一块斑', [
    { id: 'site', label: '部位', placeholder: '如：足底 · 右足跟内侧' },
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'size', label: '最大径（mm）', type: 'number', placeholder: '如：8' },
    { id: 'color', label: '颜色 / 形状（自述）', placeholder: '如：黑褐、边界欠清' },
    { id: 'note', label: '自述（原话记下来）', type: 'textarea', wide: true, placeholder: '如：以为是鸡眼，贴过鸡眼贴' }
  ], 'save-lesion'),
  'photo-add': () => openForm('补一张照片（演示）', [
    { id: 'lesion', label: '皮损编号', value: 'L1' },
    { id: 'd', label: '拍摄日期', type: 'date', value: TODAY },
    { id: 'size', label: '最大径（mm）', type: 'number' },
    { id: 'note', label: '自述', type: 'textarea', wide: true }
  ], 'save-photo'),
  'cycle-add': () => openForm('登记一次治疗（演示）', [
    { id: 'date', label: '日期', type: 'date', value: TODAY },
    { id: 'status', label: '状态', type: 'select', options: ['已完成', '延迟', '停药', '已预约'] },
    { id: 'note', label: '医嘱 / 原因原话', type: 'textarea', wide: true, placeholder: '只记录，不评疗效' }
  ], 'save-cycle'),
  'irae-add': () => openForm('记一次 IO / 靶向反应', [
    { id: 'track', label: '轨道', type: 'select', options: ['A 皮肤', 'B 胃肠', 'C 肝', 'D 内分泌'] },
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'text', label: '当时记录（原话）', type: 'textarea', wide: true, placeholder: '如：面部红斑、瘙痒；无发热' },
    { id: 'severity', label: '分级（只抄院方原文）', placeholder: '如：1 级 / 未分级' }
  ], 'save-irae'),
  'rash-add': () => openForm('记一次皮疹（演示）', [
    { id: 'site', label: '部位', placeholder: '如：面颊 / 前胸' },
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'fever', label: '是否伴发热', type: 'select', options: ['无', '有（记体温）', '不确定'] },
    { id: 'note', label: '自述与伴随信号', type: 'textarea', wide: true }
  ], 'save-rash'),
  'skin-add': () => openForm('登记一次皮肤复查', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'kind', label: '检查', placeholder: '如：全身皮肤检查 + 皮肤镜' },
    { id: 'scope', label: '检查范围', placeholder: '如：全身皮肤（含足底/趾缝/甲下）' },
    { id: 'quote', label: '医生原话', type: 'textarea', wide: true }
  ], 'save-skin'),
  'imaging-add': () => openForm('登记一次影像复查', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'kind', label: '检查', placeholder: '如：区域淋巴结超声' },
    { id: 'measure', label: '测量原文', placeholder: '照抄报告' },
    { id: 'quote', label: '报告原文摘录', type: 'textarea', wide: true }
  ], 'save-imaging'),
  'intake-add': () => openForm('记一次进食', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'text', label: '吃了什么 / 份量（自述）', type: 'textarea', wide: true }
  ], 'save-intake'),
  'sun-add': () => openForm('记一次户外 / 防晒', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'text', label: '活动与防护（事实）', type: 'textarea', wide: true, placeholder: '如：户外步行 30 分钟，戴帽子' }
  ], 'save-sun'),
  'fatigue-add': () => openForm('记一次活动 / 疲劳', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'text', label: '活动与疲劳（自述）', type: 'textarea', wide: true }
  ], 'save-fatigue'),
  'fcr-add': () => openForm('记一条感受（默认 private）', [
    { id: 'who', label: '记录人', type: 'select', options: ['本人', '照护者'] },
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'v', label: 'FCR 自评（0–10）', type: 'number', value: '4' },
    { id: 'text', label: '感受（原话）', type: 'textarea', wide: true }
  ], 'save-fcr'),
  'body-add': () => openForm('记一条身体感受（默认 private）', [
    { id: 'd', label: '日期', type: 'date', value: TODAY },
    { id: 'text', label: '感受（原话）', type: 'textarea', wide: true }
  ], 'save-body'),
  'doc-add': () => openForm('导入一份资料（演示）', [
    { id: 'name', label: '文件名（模拟）', placeholder: '如：病理报告 2026-10.pdf' },
    { id: 'kind', label: '类型', type: 'select', options: ['pdf', '图片'] },
    { id: 'note', label: '备注', placeholder: '演示不读取真实文件' }
  ], 'save-doc'),
  'q-add': () => openForm('添加疑问（1 字段）', [
    { id: 'text', label: '想问什么（原话）', type: 'textarea', wide: true }
  ], 'save-q')
};
const SAVE = {
  'save-lesion'(v) {
    mem().selfCheck.lesions.push({ id: uid('L'), code: 'other', site: v.site || '未填写部位', first: v.d || TODAY, sizeMm: Number(v.size) || 0, color: v.color || '', shape: '未填写', author: 'PATIENT', visibility: 'patient', note: v.note || '', abcde: { A: '未填写', B: '未填写', C: '未填写', D: v.size ? `${v.size}mm` : '未填写', E: '未填写' } });
    toast('已新增 1 条自查记录（演示仅内存；不判断）', { back: true }); closeModal(); render();
  },
  'save-photo'(v) { mem().selfCheck.photos.push({ id: uid('P'), lesion: v.lesion || 'L1', d: v.d || TODAY, site: '新照片', sizeMm: Number(v.size) || 0, tone: '#6b4a3a', text: v.note || '', author: 'PATIENT' }); toast('已补 1 张照片（演示仅内存）'); closeModal(); render(); },
  'save-cycle'(v) { const s = mem().treatment.systemic; s.cycles.push({ n: s.cycles.length + 1, d: v.date || TODAY, status: v.status || '已完成' }); toast('已登记 1 次治疗（只记录）'); closeModal(); render(); },
  'save-irae'(v) { mem().irae.events.push({ d: v.d || TODAY, track: (v.track || 'A').charAt(0).toLowerCase(), text: `${v.text || ''}${v.severity ? ' · ' + v.severity : ''}` }); toast('已记 1 条反应（四轨分开，不归因）'); closeModal(); render(); },
  'save-rash'(v) { mem().irae.rashPhotos.push({ d: v.d || TODAY, site: v.site || '未填写', tone: '#e4b1a4', text: `${v.note || ''}${v.fever ? ' · 发热：' + v.fever : ''}` }); toast('已记 1 次皮疹（只记录，不归因）'); closeModal(); render(); },
  'save-skin'(v) { mem().followup.skinVisits.push({ d: v.d || TODAY, kind: v.kind || '皮肤复查', quote: v.quote || '', scope: v.scope || '', author: '本人记录' }); toast('已登记 1 次皮肤复查'); closeModal(); render(); },
  'save-imaging'(v) { mem().followup.imagingVisits.push({ d: v.d || TODAY, kind: v.kind || '影像复查', quote: v.quote || '', measure: v.measure || '', method: '按报告' }); toast('已登记 1 次影像复查（同一模态才并列）'); closeModal(); render(); },
  'save-intake'(v) { mem().care.intake.push({ d: v.d || TODAY, text: v.text || '' }); toast('已记 1 条进食（不给食谱）'); closeModal(); render(); },
  'save-sun'(v) { mem().care.sun.behaviors.push({ d: v.d || TODAY, text: v.text || '' }); toast('已记 1 条户外 / 防晒事实'); closeModal(); render(); },
  'save-fatigue'(v) { mem().care.fatigue.push({ d: v.d || TODAY, text: v.text || '' }); toast('已记 1 条活动 / 疲劳'); closeModal(); render(); },
  'save-fcr'(v) {
    const p = mem(); const rec = { d: v.d || TODAY, v: Number(v.v) || 0, text: v.text || '' };
    if (v.who === '照护者') p.mind.fcr.caregiver.push(rec); else p.mind.fcr.patient.push(rec);
    toast('已记 1 条感受（默认 private；双源不平均）'); closeModal(); render();
  },
  'save-body'(v) { mem().mind.bodyImage.push({ d: v.d || TODAY, text: v.text || '', visibility: 'private' }); toast('已记 1 条身体感受（private）'); closeModal(); render(); },
  'save-doc'(v) { mem().docs.documents.push({ id: uid('d'), name: v.name || '未命名文件', kind: v.kind || 'pdf', size: '演示', status: '待核对' }); toast('已加入解析队列（演示：失败不产候选）'); closeModal(); render(); },
  'save-q'(v) { mem().docs.questions.push({ id: uid('q'), text: v.text || '未填写', asked: false, src: '就诊准备 · 手工新增' }); toast('已加入疑问清单（只整理不回答）'); closeModal(); render(); }
};
function readForm(ids) { const o = {}; ids.forEach((id) => { const el = $(`#f-${id}`); if (el) o[id] = el.value; }); return o; }
const FORM_IDS = {
  'save-lesion': ['site', 'd', 'size', 'color', 'note'], 'save-photo': ['lesion', 'd', 'size', 'note'],
  'save-cycle': ['date', 'status', 'note'], 'save-irae': ['track', 'd', 'text', 'severity'], 'save-rash': ['site', 'd', 'fever', 'note'],
  'save-skin': ['d', 'kind', 'scope', 'quote'], 'save-imaging': ['d', 'kind', 'measure', 'quote'],
  'save-intake': ['d', 'text'], 'save-sun': ['d', 'text'], 'save-fatigue': ['d', 'text'],
  'save-fcr': ['who', 'd', 'v', 'text'], 'save-body': ['d', 'text'], 'save-doc': ['name', 'kind', 'note'], 'save-q': ['text']
};

/* ---------------- ACTIONS ---------------- */
const ACTIONS = {
  go(el) { navigate(el.dataset.page, el.dataset.sub || ''); },  sub(el) { navigate(state.page, el.dataset.sub); },
  scene(el) { const s = SCENES.find((x) => x[0] === el.dataset.scene); if (s) navigate(s[2], s[3]); },
  range(el) { state.range = el.dataset.range; render(); },
  toggle(el) { state.toggles[el.dataset.key] = !state.toggles[el.dataset.key]; render(); },
  zoom(el) { state.zoom = Number(el.value); render(); },
  sel(el) {
    const arr = state.sel[state.profileId]; const c = el.dataset.code;
    if (el.checked) { if (arr.length >= 4) { el.checked = false; toast('最多同时看 4 个指标；先取消一个再加。'); return; } arr.push(c); }
    else { if (arr.length === 1) { el.checked = true; toast('至少留一个指标。'); return; } state.sel[state.profileId] = arr.filter((x) => x !== c); }
    render();
  },
  pin(el) { state.pin = { code: el.dataset.code, date: el.dataset.date }; render(); },
  unpin() { state.pin = null; render(); },
  flip(el) { const c = el.dataset.code; if (state.flipped.has(c)) state.flipped.delete(c); else state.flipped.add(c); el.setAttribute('aria-pressed', state.flipped.has(c)); },
  'agent-toggle'() { setAgent(!state.agent.open); },
  'agent-hide'() { setAgent(false); toast('已收起面板（会话保留，草稿不丢）'); },
  'ai-draft'(el) {
    const key = el.dataset.ai || state.page;
    const prompt = aiPromptWithCtx(key);
    state.agent.draft = key;
    state.agent.cand = AI_DEMOS[key]?.cand || null;
    if (!state.agent.open) setAgent(true); else renderAgent();
    const input = $('.agent-foot input'); if (input && AI_DEMOS[key]) input.value = prompt;
    /* 真机（customFrame）：外壳监听 mel:agent-draft，自动填入 DSH 原生会话草稿；
       无会话时外壳 ensureSession 调起再填——都不自动发送（家族契约：不代替患者发言）。 */
    try { parent.postMessage({ type: 'mel:agent-draft', prompt }, location.protocol === 'file:' ? '*' : location.origin); } catch { /* file:// 老内核退化 */ }
    toast('已把提示词与本页病情信息填入 AI 会话输入框（待你发送，不会自动发出）');
  },
  'cand-ok'() { toast('演示：核对通过后进入事实层（原型仅示意）', { back: true }); },
  'cand-fix'() { toast('演示：进入逐项修改（每项都可以改）'); },
  'cand-reject'() { state.agent.cand = null; renderAgent(); toast('已拒收这条候选（无副作用）'); },
  'cand-accept'(el) { const c = mem().docs.candidates.find((x) => x.id === el.dataset.id); if (c) c.state = '已入库'; toast('已确认入库（演示仅内存）'); render(); },
  'cand-reject2'(el) { const c = mem().docs.candidates.find((x) => x.id === el.dataset.id); if (c) c.state = '已拒收'; toast('已拒收（无副作用）'); render(); },
  'q-asked'(el) { const q = mem().docs.questions.find((x) => x.id === el.dataset.id); if (q) { q.asked = el.checked; toast(q.asked ? '已标记「已问」' : '恢复为待问'); } },
  profiles() { openProfiles(); },
  'use-profile'(el) { state.profileId = el.dataset.id; state.pin = null; state.flipped = new Set(); closeModal(); render(); },
  settings(el) { openSettings(el && el.dataset.tab); },
  'open-store'() { openSettings('ws'); },
  about() { openAbout(); },
  help() { openHelp(); },
  export() { openExport(); },
  close() { closeModal(); },
  src(el) { openModal('来源', `<p style="font-size:12.5px">${esc(el.dataset.src)}</p><p class="small-note">原型不打开真实文件；接入后这里会跳到该页并高亮。</p>`, '<button data-action="close">关闭</button>', '原文出处'); },
  'font-toggle'() { document.body.classList.toggle('large'); $('#font-toggle').setAttribute('aria-pressed', String(document.body.classList.contains('large'))); },
  'pick-root'() { const bad = prompt('输入资料目录的绝对路径（演示：输入 /Users/demo 会被拒绝）', state.cfg.root); if (bad === null) return; if (['/', '/Users/demo', '/Users/demo/Desktop'].includes(bad.trim())) { toast('已拒绝：不能选主目录、根目录或桌面根'); return; } state.cfg.root = bad.trim(); toast('资料目录已更新（原型仅内存）'); openSettings('ws'); },
  'manual-edit'() { toast('演示：改这一条 = 登记新版本，旧记录保留。', { back: true }); },
  'lesion-add'() { FORMS['lesion-add'](); },
  'photo-add'() { FORMS['photo-add'](); },
  'photo-new'() { FORMS['photo-add'](); },
  'cycle-add'() { FORMS['cycle-add'](); },
  'irae-add'() { FORMS['irae-add'](); },
  'rash-add'() { FORMS['rash-add'](); },
  'skin-add'() { FORMS['skin-add'](); },
  'imaging-add'() { FORMS['imaging-add'](); },
  'intake-add'() { FORMS['intake-add'](); },
  'sun-add'() { FORMS['sun-add'](); },
  'fatigue-add'() { FORMS['fatigue-add'](); },
  'fcr-add'() { FORMS['fcr-add'](); },
  'body-add'() { FORMS['body-add'](); },
  'doc-add'() { FORMS['doc-add'](); },
  'q-add'() { FORMS['q-add'](); }
};
Object.keys(FORM_IDS).forEach((k) => { ACTIONS[k] = () => SAVE[k](readForm(FORM_IDS[k])); });

/* ---------------- events ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  fn(el);
});
/* 36 号 §2.6 出口：状态卡副按钮打开疾病概要（与顶栏「?」同一个整页面板） */
document.addEventListener('click', (e) => {
  const cta = e.target.closest('[data-primer-cta]');
  if (!cta) return;
  e.preventDefault();
  if (window.DiseasePrimer) window.DiseasePrimer.open(cta);
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (fn && ['sel', 'q-asked', 'zoom'].includes(el.dataset.action)) { e.preventDefault(); fn(el); }
});
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="zoom"]');
  if (!el) return;
  state.zoom = Number(el.value);
  const span = el.parentElement.querySelector('span'); if (span) span.textContent = `${state.zoom}%`;
  const [t0, t1] = domain();
  const wrap = $('.chart-wrap');
  if (wrap) wrap.innerHTML = chartSVG(t0, t1).replace(/^[\s\S]*?<div class="chart-wrap">/, '').replace(/<\/div>$/, '');
});
$('#profile-btn').addEventListener('click', () => openProfiles());
$('#font-toggle').addEventListener('click', () => ACTIONS['font-toggle']());
$('#agent-splitter').addEventListener('keydown', (e) => {
  if (e.key === 'Home') { e.preventDefault(); state.agent.w = 45; document.documentElement.style.setProperty('--agent-w', '45%'); $('#agent-splitter').setAttribute('aria-valuenow', '45'); }
  else if (e.key === 'End') { e.preventDefault(); state.agent.w = 25; document.documentElement.style.setProperty('--agent-w', '25%'); $('#agent-splitter').setAttribute('aria-valuenow', '25'); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); agentResize(2); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); agentResize(-2); }
});
let dragging = false;
$('#agent-splitter').addEventListener('pointerdown', () => { dragging = true; });
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const pct = clampAgentW(100 - (e.clientX / window.innerWidth) * 100);
  state.agent.w = pct;
  document.documentElement.style.setProperty('--agent-w', `${pct}%`);
  $('#agent-splitter').setAttribute('aria-valuenow', String(Math.round(pct)));
});
$('#dialog').addEventListener('click', (e) => { if (e.target === $('#dialog')) closeModal(); });

function applyHash() {
  const raw = (location.hash || '#dash').slice(1);
  const [page, sub] = raw.split('/');
  if (!PAGES.some((x) => x[0] === page)) { state.page = 'dash'; state.sub = {}; return; }
  state.page = page;
  state.sub[page] = sub || (SUBPAGES[page] ? SUBPAGES[page][0][0] : '');
}
/* 打印展开：@media print 的 CSS 无法让 <details> 收起内容进入 printToPDF（ENDO 评审 P0-2 实测）——
   beforeprint 时设 open，打印后恢复（32 号模版 2026-10-25 修正）。 */
(function printExpandFoldouts() {
  let prior = null;
  window.addEventListener('beforeprint', () => {
    const folds = [...document.querySelectorAll('details.phase-fold')];
    prior = folds.map((d) => d.open);
    folds.forEach((d) => { d.open = true; });
  });
  window.addEventListener('afterprint', () => {
    if (!prior) return;
    document.querySelectorAll('details.phase-fold').forEach((d, i) => { d.open = Boolean(prior[i]); });
    prior = null;
  });
})();
/* 36 号疾病概要用 pushState 打开、history.back() 收起，会顺带把 hash 改成 #disease-primer 再改回来。
   这类 hash 变化不改变本台路由，收起后不该因为重渲染再跳回页首（那会冲掉 primer 恢复的滚动位置）。 */
window.addEventListener('hashchange', () => {
  const pageBefore = state.page;
  const subBefore = state.sub[state.page];
  applyHash();
  render({ keepScroll: pageBefore === state.page && subBefore === state.sub[state.page] });
});

applyHash();
render();
