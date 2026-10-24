/* 读模型（MEL · 皮肤黑色素瘤）：把库里的行还原成 **demo-data.js 同一形状**。
 *
 * 契约：`GET /api/mel/bootstrap` 的 profiles 数组必须与 prototypes/v0.2/demo-data.js 的
 * 同名档案逐字段一致（test/store.test.mjs 是 deepStrictEqual）。parity 是这一层唯一验收标准。
 *
 * 冻结 30 表里没有 profile_meta / demo_meta 这类通用键值表，也**不允许为演示数据改 schema**。
 * 所以本层分两段读：
 *   1. `workspace.dataset_state` 里的**非事实展示文案**（说明卡、固定选项、照片色块、hero 等）；
 *   2. 30 张表的**事实**（指标、分期、SLNB、分子、手术、IO 事件、双轨、营养、疲劳、FCR、
 *      观点、材料三态、疑问、候选）——事实覆盖文案里的同名数组/字段。
 * 展示文案不是第二份数值来源：所有可核对数值都来自表；改一行表，bootstrap 立刻变。
 *
 * 五条容易踩的：
 * 1. 排序：metric_point/self_check/lesion 按 rowid；其余按各自 ord；
 * 2. FCR 与身体意象按记录人/主题分组，**不能**按 ord 混排（患者与照护者的 ord 各自从 0 起）；
 * 3. SLNB 三态与材料三态是枚举 ↔ 中文原文的双向映射，必须可逆；
 * 4. 候选挂在合成导入文档（file_name='demo-import'）的 parse_job 下；资料库列表排除它；
 * 5. node:sqlite 返回 null-prototype 行对象，统一 `{...r}` 摊平，否则 deepStrictEqual 会因原型不同失败。
 */

import { AGENT_PANE } from '../lib/layout.js';
import { readDemoState } from './demo.js';

const rows = (db, sql, ...args) => db.prepare(sql).all(...args).map((r) => ({ ...r }));
const first = (db, sql, ...args) => {
  const r = db.prepare(sql).get(...args);
  return r ? { ...r } : null;
};
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

const SLNB_STATE = { REPORTED: 'result', NOT_DONE: 'not_done', NOT_RECORDED: 'not_recorded' };
const SLNB_LABEL = { REPORTED: '结果原文', NOT_DONE: '未做', NOT_RECORDED: '未记录' };
const MARKER_TITLE = { BRAF_V600: 'BRAF V600E', NRAS: 'NRAS', TERT: 'TERT 启动子', CKIT: 'CKIT', OTHER: '其他' };
const IRAE_KEY = { RASH: 'skin', DIARRHEA: 'gi', HEPATITIS: 'liver', THYROID: 'endocrine', OTHER: 'other' };
const MATERIAL_STATE = { filed: 'ready', discussed: 'partial', open: 'todo' };

/** 没有演示文案时（真实用户库）给一个空壳，保证页面能渲染。 */
function emptyProfile(id, row) {
  return {
    id, name: row?.name ?? '（未命名）', age: null, gender: row?.gender ?? null,
    diagnosis: '', diagnosisShort: '', stageLine: '', primaryRole: row?.primary_role ?? 'PATIENT',
    caregiverLabel: '', hero: {}, selfCheck: { headline: '', firstFound: null, rhythm: '', siteOrder: [], sites: [], lesions: [], photos: [], photoNote: '', timeline: [], timelineNote: '', acral: {}, abcde: {} },
    stage: { subtype: '', breslow: null, ulcer: '', mitoses: '', margins: '', pathologyQuote: '', pathologyNote: '', stageHistory: [], stageNote: '', slnb: null, molecular: [], molecularNote: '' },
    treatment: { pathway: [], pathwayNote: '', planVsActual: [], surgeries: [], systemic: null },
    irae: { intro: '', tracks: [], events: [], note: '', rashPhotos: [], photoNote: '', questions: [], attribution: { options: [], self: '', note: '' }, delayed: '', redlines: [], redlineNote: '', contacts: [] },
    followup: { intro: '', tracks: [], skinVisits: [], imagingVisits: [], imagingNote: '', privacy: { default: '', options: [], note: '' }, flow: [], nextNote: '' },
    metrics: { numeric: {}, qual: {} },
    care: { intake: [], weightNote: '', sun: { behaviors: [], exposure: '', facts: [], blame: '' }, fatigue: [], fatigueNote: '' },
    mind: { fcr: { title: '', patient: [], caregiver: [], note: '' }, bodyImage: [], bodyNote: '', intimacy: [], intimacyNote: '', genetic: { note: '', qa: [] } },
    docs: { materials: [], documents: [], candidates: [], questions: [], trials: [], exportNote: '' },
  };
}

/** 读一个档案，还原成 demo-data.js 的档案对象形状。 */
function readProfile(db, key, demo) {
  const found = first(db, 'SELECT * FROM profile WHERE id = ?', key);
  if (!found) return null;
  const base = clone(demo?.copy?.[key]) || emptyProfile(key, found);

  /* ── 档案标量（表为准） ── */
  base.id = found.id;
  base.name = found.name ?? base.name;
  base.gender = found.gender ?? base.gender;
  base.primaryRole = found.primary_role ?? base.primaryRole;

  /* ── 指标：表为准 ── */
  const numeric = {};
  const qual = {};
  for (const d of rows(db, 'SELECT code, is_numeric FROM metric_def ORDER BY ord')) {
    if (Number(d.is_numeric) === 0) qual[d.code] = [];
    else numeric[d.code] = [];
  }
  for (const m of rows(db, `SELECT p.code, p.measured_at, p.value_num, p.value_text, p.source_note
      FROM metric_point p WHERE p.profile_id = ? ORDER BY p.rowid`, key)) {
    const def = first(db, 'SELECT is_numeric FROM metric_def WHERE code = ?', m.code);
    if (Number(def?.is_numeric ?? 1) === 0) {
      qual[m.code]?.push({ d: m.measured_at, code: m.value_num, label: m.value_text, src: m.source_note ?? null });
    } else {
      numeric[m.code]?.push({ d: m.measured_at, v: m.value_num, src: m.source_note ?? null });
    }
  }
  base.metrics = { numeric, qual };

  /* ── 分期历史与 SLNB（K3：只引用原文） ── */
  const history = rows(db, 'SELECT stage_text, source_note, as_of FROM stage_record WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r) => ({ d: r.as_of ?? null, label: r.stage_text, quote: r.source_note ?? null }));
  if (history.length || Array.isArray(base.stage?.stageHistory)) base.stage.stageHistory = history;

  const slnb = first(db, 'SELECT slnb_date, status, result_text FROM slnb_record WHERE profile_id = ? ORDER BY ord, rowid', key);
  if (slnb && base.stage) {
    base.stage.slnb = {
      ...(base.stage.slnb || {}),
      state: SLNB_STATE[slnb.status] ?? 'not_recorded',
      label: SLNB_LABEL[slnb.status] ?? '未记录',
      d: slnb.slnb_date ?? null,
      quote: slnb.result_text ?? null,
    };
  }

  /* ── 分子三态（K4） ── */
  const titles = new Map(rows(db, 'SELECT marker, title FROM molecular_marker_title').map((r) => [r.marker, r.title]));
  const molecular = rows(db, 'SELECT marker, status, method, specimen_date, value_text, note FROM molecular_marker WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r) => ({
      marker: titles.get(r.marker) ?? MARKER_TITLE[r.marker] ?? r.marker,
      status: r.status,
      value: r.value_text,
      date: r.specimen_date,
      method: r.method,
      explain: r.note,
    }));
  if (molecular.length || Array.isArray(base.stage?.molecular)) base.stage.molecular = molecular;

  /* ── 手术（只覆盖表里有的字段；stay/impact 属展示文案，保留原值） ── */
  const surgeries = rows(db, 'SELECT surgery_date, procedure_text, margins_text, hospital, pathology_summary FROM surgery_record WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r, i) => ({
      ...(base.treatment?.surgeries?.[i] || {}),
      d: r.surgery_date,
      title: r.procedure_text,
      hospital: r.hospital,
      quote: r.pathology_summary,
      margins: r.margins_text,
    }));
  if (surgeries.length) base.treatment.surgeries = surgeries;

  /* ── IO / 靶向四轨（K5：只覆盖事件，不归因） ── */
  const iraeEvents = rows(db, 'SELECT onset_date, track, description FROM irae_event WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r) => ({ d: r.onset_date, track: IRAE_KEY[r.track] ?? 'other', text: r.description ?? '' }));
  if (iraeEvents.length || Array.isArray(base.irae?.events)) base.irae.events = iraeEvents;

  /* ── 双轨随访（K6） ── */
  const tracks = rows(db, 'SELECT track, last_date, next_date, interval_note FROM followup_track WHERE profile_id = ? ORDER BY ord, rowid', key);
  if (tracks.length) {
    base.followup.tracks = tracks.map((r, i) => ({
      ...(base.followup?.tracks?.[i] || {}),
      key: r.track === 'IMAGING' ? 'imaging' : 'skin',
      start: r.last_date,
      interval: r.interval_note,
      next: r.next_date,
    }));
  }
  const imagingVisits = rows(db, 'SELECT exam_date, modality, site_text, measure_text, excerpt FROM imaging_followup WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r) => ({ d: r.exam_date, kind: r.site_text, quote: r.excerpt ?? null, measure: r.measure_text, method: r.modality }));
  if (imagingVisits.length || Array.isArray(base.followup?.imagingVisits)) base.followup.imagingVisits = imagingVisits;

  /* ── 营养与疲劳 ── */
  const intake = rows(db, 'SELECT logged_at, note FROM nutrition_log WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r) => ({ d: r.logged_at, text: r.note ?? '' }));
  if (intake.length || Array.isArray(base.care?.intake)) base.care.intake = intake;
  const fatigue = rows(db, "SELECT logged_at, severity_text FROM symptom_log WHERE profile_id = ? AND symptom = '疲劳' ORDER BY ord, rowid", key)
    .map((r) => ({ d: r.logged_at, text: r.severity_text ?? '' }));
  if (fatigue.length || Array.isArray(base.care?.fatigue)) base.care.fatigue = fatigue;

  /* ── FCR 双人记录（按记录人分组，不混排） ── */
  const fcrRows = rows(db, 'SELECT record_date, author_role, score, note FROM fcr_record WHERE profile_id = ? ORDER BY ord, rowid', key);
  const fcrOf = (role) => fcrRows.filter((r) => r.author_role === role).map((r) => ({ d: r.record_date, v: r.score, text: r.note ?? '' }));
  if (fcrRows.length && base.mind?.fcr) {
    base.mind.fcr.patient = fcrOf('PATIENT');
    base.mind.fcr.caregiver = fcrOf('CAREGIVER');
  }

  /* ── 私密观点（默认 private；三出口过滤在前端） ── */
  const views = rows(db, 'SELECT topic, content, record_date, visibility FROM viewpoint WHERE profile_id = ? ORDER BY ord, rowid', key);
  const viewOf = (topic) => views.filter((v) => v.topic === topic)
    .map((v) => ({ d: v.record_date, text: v.content, visibility: v.visibility }));
  if (views.length && base.mind) {
    base.mind.bodyImage = viewOf('BODY_IMAGE');
    base.mind.intimacy = viewOf('INTIMACY');
  }

  /* ── 材料三态 / 疑问清单 ── */
  const materials = rows(db, 'SELECT topic, status, note, ord FROM decision_checklist WHERE profile_id = ? ORDER BY ord, rowid', key)
    .map((r, i) => ({ id: `m${i + 1}`, name: r.topic, why: r.note ?? '', state: MATERIAL_STATE[r.status] ?? 'todo' }));
  if (materials.length || Array.isArray(base.docs?.materials)) base.docs.materials = materials;
  const questions = rows(db, "SELECT id, content, asked_on, from_scenario FROM question WHERE profile_id = ? AND kind = 'view' ORDER BY ord, rowid", key)
    .map((r, i) => ({ id: `q${i + 1}`, text: r.content, asked: Boolean(r.asked_on), src: r.from_scenario ?? '' }));
  if (questions.length || Array.isArray(base.docs?.questions)) base.docs.questions = questions;

  /* ── 候选：确认后把状态回写（其余仍是演示文案；候选不是事实） ── */
  const candidates = rows(db, `SELECT c.field_name, c.value_text, c.confirmed
      FROM candidate c JOIN parse_job pj ON pj.id = c.parse_job_id
      JOIN document d ON d.id = pj.document_id
      WHERE d.profile_id = ? AND d.file_name = 'demo-import' ORDER BY c.rowid`, key);
  if (candidates.length) {
    base.docs.candidates = candidates.map((c, i) => ({
      ...(base.docs?.candidates?.[i] || {}),
      field: c.field_name,
      value: c.value_text,
      state: Number(c.confirmed) === 1 ? '已入库' : (base.docs?.candidates?.[i]?.state ?? '待核对'),
    }));
  }

  /* ── 资料库：演示行保持文案；真实导入（同名不存在）追加 ── */
  const dbDocs = rows(db, "SELECT id, file_name, status FROM document WHERE profile_id = ? AND file_name <> 'demo-import' ORDER BY ord, rowid", key);
  if (Array.isArray(base.docs?.documents)) {
    const known = new Set(base.docs.documents.map((d) => d.name));
    for (const d of dbDocs) {
      if (known.has(d.file_name)) continue;
      base.docs.documents.push({
        id: `d${d.id}`,
        name: d.file_name,
        kind: /\.(jpe?g|png)$/i.test(d.file_name) ? '图片' : 'pdf',
        size: '',
        status: d.status === 'parsed' ? '已核对' : d.status === 'parse_failed' ? '解析失败' : '待核对',
      });
    }
  }

  return base;
}

export function listSubjects(db) {
  return rows(db, 'SELECT id, name FROM profile ORDER BY rowid');
}

export function getProfile(db, key) {
  return readProfile(db, key, readDemoState(db));
}

/** `/api/mel/bootstrap` payload：与 demo-data.js 同形（meta + profiles），version/build 注入。 */
export function bootstrap(db, { version, build } = {}) {
  const demo = readDemoState(db);
  const meta = { ...(demo?.demoMeta || {}) };
  const profiles = listSubjects(db).map((s) => readProfile(db, s.id, demo));
  return {
    version: version ?? null,
    build: build ?? null,
    meta,
    profiles,
    /* 宿主未提供原生会话时这里会是 available:false；开发版自带挂载位演示，所以默认 true。 */
    agent: { available: true, mode: 'dev-mount' },
    layout: { agentPane: AGENT_PANE },
  };
}
