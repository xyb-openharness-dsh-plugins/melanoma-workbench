/* 演示数据播种（MEL · 皮肤黑色素瘤）。
 *
 * 唯一数据源是 `demo/build-demo-data.mjs` 的 `buildDemoProfiles()`（同一份数据生成
 * prototypes/v0.2/demo-data.js、public/demo-data.js、demo/demo-data.sqlite）。
 * 本文件只把这份纯数据写进库，不改写任何数值——演示数据一旦在这里多出一条，
 * 原型与开发版就会各说一套（test/store.test.mjs 的 deepStrictEqual parity 就是钉这个）。
 *
 * schema 冻结为 30 表（0001_initial.sql），且**不得为演示数据改结构**。演示档案里有
 * 一部分"展示文案"（hero、说明卡、固定选项、照片色块等）在 30 表里没有对应列；
 * 这些非事实字段按档案整份存进 `workspace.dataset_state`（JSON），读模型从那里取文案，
 * 其余事实（指标、分期、SLNB、分子、手术、IO 事件、双轨、FCR、观点、材料、疑问、候选）
 * 仍然逐表读取。这样既不改 schema，也不会出现第二份数值来源。
 *
 * 两条纪律：
 * 1. 所有 INSERT 写显式列名 + 显式问号数；
 * 2. 幂等（已有 profile 整批跳过）+ 单事务（失败整体回滚）。
 */

import { createHash } from 'node:crypto';
import { buildDemoProfiles } from '../demo/build-demo-data.mjs';

const sha = (text) => createHash('sha256').update(String(text), 'utf8').digest('hex');
const j = (v) => (v === undefined ? null : JSON.stringify(v));

/* MEL 指标目录（显示字典在原型 app.js 的 CATALOG；这里只落库 code 侧元数据）。 */
const METRIC_DEFS = [
  ['WEIGHT', '体重', 'kg', '体格与营养', '#C46A2B', 1, null, 0],
  ['ALT', 'ALT（丙氨酸氨基转移酶）', 'U/L', 'IO 实验室', '#2E6B4F', 1, null, 1],
  ['TSH', 'TSH（促甲状腺激素）', 'mIU/L', 'IO 实验室', '#55707E', 1, null, 2],
  ['LESION_MM', '皮损最大径（标尺照片）', 'mm', '皮损与反应节点', '#8A7F71', 1, null, 3],
  ['LESION_EVENT', '皮损记录节点', null, '皮损与反应节点', '#8A7F71', 0, null, 4],
  ['IRAE_SKIN', 'IO 皮肤反应节点', null, '皮损与反应节点', '#A98A5B', 0, null, 5],
];

/* demo 文本 ↔ 0001 枚举的可逆映射。 */
const SLNB_STATE = { result: 'REPORTED', not_done: 'NOT_DONE', not_recorded: 'NOT_RECORDED' };
const SLNB_LABEL = { REPORTED: '结果原文', NOT_DONE: '未做', NOT_RECORDED: '未记录' };
const MARKER_KEY = { 'BRAF V600E': 'BRAF_V600', BRAF: 'BRAF_V600', NRAS: 'NRAS', 'TERT 启动子': 'TERT', TERT: 'TERT', 'CKIT': 'CKIT' };
const IRAE_TRACK = { skin: 'RASH', gi: 'DIARRHEA', liver: 'HEPATITIS', endocrine: 'THYROID', other: 'OTHER' };
const MATERIAL_STATUS = { ready: 'filed', partial: 'discussed', todo: 'open' };

function roleOf(author) {
  return author === 'CAREGIVER' ? 'CAREGIVER' : 'PATIENT';
}

/**
 * 把 buildDemoProfiles() 的数据写进库。返回写入计数（启动日志与测试用）。
 * @param {object} db 已 migrate 的数据库
 * @param {object} [input] 注入用（默认 buildDemoProfiles()）
 */
export function seedDemo(db, input) {
  if (!db || typeof db.prepare !== 'function') throw new TypeError('seedDemo 需要一个已打开的数据库');
  const data = input || buildDemoProfiles();
  const already = db.prepare('SELECT COUNT(*) AS n FROM profile').get().n;
  if (already > 0) return { skipped: true, subjects: 0, metrics: 0, points: 0, trials: 0, candidates: 0 };

  const counts = { skipped: false, subjects: 0, metrics: 0, points: 0, trials: 0, candidates: 0 };
  const today = data.meta?.today ?? new Date().toISOString().slice(0, 10);

  db.exec('BEGIN');
  try {
    const insWorkspace = db.prepare('INSERT OR REPLACE INTO workspace (id, data_root, schema_version, dataset_state) VALUES (?,?,?,?)');
    insWorkspace.run(1, null, '0001', j({
      demoMeta: data.meta,
      /* 非事实展示文案（30 表无对应列）；事实在下面逐表写入。 */
      copy: Object.fromEntries(data.profiles.map((p) => [p.id, p])),
    }));

    const insProfile = db.prepare(`INSERT INTO profile
      (id, name, birth_date, gender, primary_role, cognitive_flag, created_at) VALUES (?,?,?,?,?,?,?)`);
    const insMetricDef = db.prepare(`INSERT INTO metric_def
      (code, label, unit, category, color, is_numeric, ctcae_rule, ord) VALUES (?,?,?,?,?,?,?,?)`);
    const insPoint = db.prepare(`INSERT INTO metric_point
      (profile_id, code, measured_at, value_num, value_text, source_note, revision) VALUES (?,?,?,?,?,?,?)`);
    const insLab = db.prepare(`INSERT INTO lab_result
      (profile_id, collected_at, panel, ref_range, document_id) VALUES (?,?,?,?,?)`);
    const insSymptom = db.prepare(`INSERT INTO symptom_log
      (profile_id, logged_at, symptom, severity_text, author_role, ord) VALUES (?,?,?,?,?,?)`);
    const insNutrition = db.prepare(`INSERT INTO nutrition_log
      (profile_id, logged_at, intake_level, weight_kg, note, ord) VALUES (?,?,?,?,?,?)`);
    const insQuestion = db.prepare(`INSERT INTO question
      (profile_id, kind, content, created_at, asked_on, from_scenario, ord) VALUES (?,?,?,?,?,?,?)`);
    const insDocument = db.prepare(`INSERT INTO document
      (profile_id, file_name, sha256, status, imported_at, ord) VALUES (?,?,?,?,?,?)`);
    const insTrial = db.prepare(`INSERT INTO saved_trial
      (profile_id, trial_key, saved_at) VALUES (?,?,?)`);
    const insSelfCheck = db.prepare(`INSERT INTO self_check
      (profile_id, check_date, site_code, site_note, self_description, size_note, photo_path, photo_sha256, author_role, ord, revision)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    const insLesion = db.prepare(`INSERT INTO lesion
      (profile_id, site_code, site_note, label, first_seen, active, ord, revision) VALUES (?,?,?,?,?,?,?,?)`);
    const insStage = db.prepare(`INSERT INTO stage_record
      (profile_id, stage_text, source_note, as_of, ord, revision) VALUES (?,?,?,?,?,?)`);
    const insSlnb = db.prepare(`INSERT INTO slnb_record
      (profile_id, slnb_date, status, result_text, report_doc_id, ord, revision) VALUES (?,?,?,?,?,?,?)`);
    const insMarker = db.prepare(`INSERT INTO molecular_marker
      (profile_id, marker, status, method, specimen_date, value_text, report_doc_id, note, ord, revision) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const insMarkerTitle = db.prepare('INSERT OR REPLACE INTO molecular_marker_title (marker, title, ord) VALUES (?,?,?)');
    const insSurgery = db.prepare(`INSERT INTO surgery_record
      (profile_id, surgery_date, procedure_text, margins_text, hospital, pathology_summary, report_doc_id, ord, revision)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    const insSystemic = db.prepare(`INSERT INTO systemic_tx
      (profile_id, kind, cycle_number, start_date, end_date, regimen_text, response_text, status, stop_reason, ord, revision)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    const insIrae = db.prepare(`INSERT INTO irae_event
      (profile_id, onset_date, track, grade_text, description, action_text, author_role, ord) VALUES (?,?,?,?,?,?,?,?)`);
    const insTrack = db.prepare(`INSERT INTO followup_track
      (profile_id, track, last_date, next_date, interval_note, ord) VALUES (?,?,?,?,?,?)`);
    const insImaging = db.prepare(`INSERT INTO imaging_followup
      (profile_id, exam_date, modality, site_text, measure_text, excerpt, ldh_at_time, report_doc_id, ord)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    const insSun = db.prepare(`INSERT INTO sun_exposure
      (profile_id, record_date, exposure_note, protection_note, author_role, ord) VALUES (?,?,?,?,?,?)`);
    const insFcr = db.prepare(`INSERT INTO fcr_record
      (profile_id, record_date, author_role, score, note, visibility, ord) VALUES (?,?,?,?,?,?,?)`);
    const insViewpoint = db.prepare(`INSERT INTO viewpoint
      (profile_id, author_role, visibility, topic, content, record_date, ord) VALUES (?,?,?,?,?,?,?)`);
    const insChecklist = db.prepare(`INSERT INTO decision_checklist
      (profile_id, topic, status, note, ord) VALUES (?,?,?,?,?)`);
    const insImportFile = db.prepare('INSERT INTO import_file (document_id, byte_size, mime, in_use) VALUES (?,?,?,1)');
    const insParseJob = db.prepare(`INSERT INTO parse_job
      (document_id, requested_at, state, error_code, error_message) VALUES (?,?,?,?,?)`);
    const insCandidate = db.prepare(`INSERT INTO candidate
      (parse_job_id, field_name, value_text, value_num, unit, confirmed, confirmed_at, target_table, target_id)
      VALUES (?,?,?,?,?,?,?,?,?)`);

    for (const def of METRIC_DEFS) insMetricDef.run(...def);
    counts.metrics = METRIC_DEFS.length;

    for (const p of data.profiles) {
      const key = p.id;
      insProfile.run(key, p.name ?? null, null, p.gender ?? null, p.primaryRole ?? 'PATIENT', 'stable', `${today}T00:00:00.000Z`);
      counts.subjects += 1;

      /* ── 指标：数值 + 分类（value_num=code、value_text=label） ── */
      for (const [code, arr] of Object.entries(p.metrics?.numeric || {})) {
        (arr || []).forEach((x) => {
          insPoint.run(key, code, x.d, x.v, null, x.src ?? null, 1);
          counts.points += 1;
        });
      }
      for (const [code, arr] of Object.entries(p.metrics?.qual || {})) {
        (arr || []).forEach((x) => {
          insPoint.run(key, code, x.d, x.code, x.label ?? null, x.src ?? null, 1);
          counts.points += 1;
        });
      }

      /* ── 自查：照片记录 + 皮损条目 ── */
      (p.selfCheck?.photos || []).forEach((photo, i) => {
        const lesion = (p.selfCheck?.lesions || []).find((l) => l.id === photo.lesion);
        insSelfCheck.run(key, photo.d, lesion?.code ?? 'other', photo.site ?? lesion?.site ?? null,
          photo.text ?? null, photo.sizeMm == null ? null : `${photo.sizeMm}mm`,
          photo.id ?? null, photo.id ? sha(photo.id) : null, roleOf(photo.author), i, 1);
      });
      (p.selfCheck?.lesions || []).forEach((l, i) => {
        insLesion.run(key, l.code, l.site ?? null, l.note ?? null, l.first ?? null, 1, i, 1);
      });

      /* ── 分期（K3 只引用原文）与 SLNB 三态 ── */
      (p.stage?.stageHistory || []).forEach((s, i) => {
        insStage.run(key, s.label ?? '', s.quote ?? null, s.d ?? null, i, 1);
      });
      if (p.stage?.slnb) {
        const s = p.stage.slnb;
        insSlnb.run(key, s.d ?? null, SLNB_STATE[s.state] ?? 'NOT_RECORDED', s.quote ?? null, null, 0, 1);
      }

      /* ── 分子三态（K4） ── */
      (p.stage?.molecular || []).forEach((m, i) => {
        const marker = MARKER_KEY[m.marker] ?? 'OTHER';
        insMarkerTitle.run(marker, m.marker, i);
        insMarker.run(key, marker, m.status ?? 'not_tested', m.method ?? null, m.date ?? null,
          m.value ?? null, null, m.explain ?? null, i, 1);
      });

      /* ── 手术 / 系统治疗（只记录原文） ── */
      (p.treatment?.surgeries || []).forEach((s, i) => {
        insSurgery.run(key, s.d ?? null, s.title ?? null, s.margins ?? null, s.hospital ?? null,
          s.quote ?? null, null, i, 1);
      });
      const sys = p.treatment?.systemic;
      if (sys) {
        (sys.cycles || []).forEach((c, i) => {
          const status = ({ 已完成: 'completed', 已预约: 'planned', 进行中: 'ongoing', 已停: 'stopped' })[c.status] ?? 'ongoing';
          insSystemic.run(key, 'IMMUNO_ADJUVANT', c.n ?? null, c.d ?? null, null, sys.regimen ?? null,
            null, status, null, i, 1);
        });
      }

      /* ── IO / 靶向四轨（K5：不归因） ── */
      (p.irae?.events || []).forEach((e, i) => {
        insIrae.run(key, e.d ?? null, IRAE_TRACK[e.track] ?? 'OTHER', null, e.text ?? null, null, 'PATIENT', i);
      });

      /* ── 双轨随访（K6） ── */
      (p.followup?.tracks || []).forEach((t, i) => {
        const track = t.key === 'imaging' ? 'IMAGING' : 'SKIN';
        insTrack.run(key, track, t.start ?? null, t.next ?? null, t.interval ?? null, i);
      });
      (p.followup?.imagingVisits || []).forEach((v, i) => {
        insImaging.run(key, v.d ?? null, v.method ?? null, v.kind ?? null, v.measure ?? null,
          v.quote ?? null, null, null, i);
      });

      /* ── 暴露与防护（事实记录，不做命令式） ── */
      const sun = p.care?.sun;
      if (sun) {
        (sun.behaviors || []).forEach((b, i) => {
          insSun.run(key, b.d ?? null, b.text ?? null, null, roleOf(b.text), i);
        });
        if (sun.exposure) insSun.run(key, today, sun.exposure, null, 'PATIENT', (sun.behaviors || []).length);
      }

      /* ── 营养与疲劳 ── */
      (p.care?.intake || []).forEach((x, i) => insNutrition.run(key, x.d ?? null, 'OK', null, x.text ?? null, i));
      (p.care?.fatigue || []).forEach((x, i) => insSymptom.run(key, x.d ?? null, '疲劳', x.text ?? null, 'PATIENT', i));

      /* ── FCR 双人记录 + 私密观点（默认 private） ── */
      (p.mind?.fcr?.patient || []).forEach((x, i) => {
        insFcr.run(key, x.d ?? null, 'PATIENT', x.v ?? null, x.text ?? null, 'private', i);
      });
      (p.mind?.fcr?.caregiver || []).forEach((x, i) => {
        insFcr.run(key, x.d ?? null, 'CAREGIVER', x.v ?? null, x.text ?? null, 'private', i);
      });
      (p.mind?.bodyImage || []).forEach((x, i) => {
        insViewpoint.run(key, 'PATIENT', x.visibility ?? 'private', 'BODY_IMAGE', x.text ?? '', x.d ?? null, i);
      });
      (p.mind?.intimacy || []).forEach((x, i) => {
        insViewpoint.run(key, 'PATIENT', x.visibility ?? 'private', 'INTIMACY', x.text ?? '', x.d ?? null, i);
      });

      /* ── 就诊准备：材料三态 + 疑问清单 + 试验收藏 ── */
      (p.docs?.materials || []).forEach((m, i) => {
        insChecklist.run(key, m.name ?? null, MATERIAL_STATUS[m.state] ?? 'open', m.why ?? null, i);
      });
      (p.docs?.questions || []).forEach((q, i) => {
        insQuestion.run(key, 'view', q.text ?? '', `${today}T00:00:00.000Z`, q.asked ? today : null, q.src ?? null, i);
      });
      /* 资料库：只落文件名与哈希；kind/size/status 属展示文案，读模型从 copy 取。 */
      (p.docs?.documents || []).forEach((d, i) => {
        insDocument.run(key, d.name ?? '未命名资料', sha(`${key}:${d.id}:${d.name}`), 'parsed', today, i);
      });
      (p.docs?.trials || []).forEach((t, i) => {
        insTrial.run(key, t.key ?? null, today);
        counts.trials += 1;
      });

      /* ── 候选：挂在合成导入文档（demo-import 不进资料库列表） ── */
      const candidates = p.docs?.candidates || [];
      if (candidates.length) {
        const r = insDocument.run(key, 'demo-import', sha(`${key}:demo-import`), 'parsed', today, 9999);
        const documentId = Number(r.lastInsertRowid);
        insImportFile.run(documentId, 0, null);
        const job = insParseJob.run(documentId, `${today}T00:00:00.000Z`, 'succeeded', null, null);
        candidates.forEach((c) => {
          insCandidate.run(Number(job.lastInsertRowid), c.field ?? '', c.value ?? null, null, null, 0, null, null, null);
          counts.candidates += 1;
        });
      }

      /* ── 化验单对照（IO 轨道用；只存原文数值） ── */
      const alt = (p.metrics?.numeric?.ALT || []).slice(-1)[0];
      const tsh = (p.metrics?.numeric?.TSH || []).slice(-1)[0];
      if (alt || tsh) {
        insLab.run(key, alt?.d ?? tsh?.d ?? today,
          j({ alt: alt?.v ?? null, tsh: tsh?.v ?? null, src: alt?.src ?? tsh?.src ?? null }), null, null);
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    try { db.exec('ROLLBACK'); } catch { /* 回滚失败也要把原始错误抛出去 */ }
    throw new Error(`播种演示数据失败（已回滚）：${error.message}`);
  }
  return counts;
}

/** 库的演示档案是否已播种过。 */
export function hasDemoData(db) {
  try {
    return db.prepare('SELECT COUNT(*) AS n FROM profile').get().n > 0;
  } catch {
    return false;
  }
}

/** 读模型用：取出演示副本（meta + 每档案展示文案）。 */
export function readDemoState(db) {
  try {
    const row = db.prepare('SELECT dataset_state FROM workspace WHERE id = 1').get();
    if (!row?.dataset_state) return null;
    return JSON.parse(row.dataset_state);
  } catch {
    return null;
  }
}
