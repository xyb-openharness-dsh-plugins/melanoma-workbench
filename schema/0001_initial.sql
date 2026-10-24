-- 0001_initial.sql · MEL 工作台初始迁移（G3 冻结版 · 2026-10-25）
-- 顺序：档案级 → 指标 → 通用 → MEL 专属 → 导入件。共 30 表。
-- 四契约 + MEL 红线：K1 自查档案零诊断性字段（无 diagnosis/benign/malignant/risk 判定列）；
--   K2 皮损部位+时间双视图（变化只并列）；K3 分期/SLNB 只引用原文；K4 分子三态；
--   K5 IO 轨道独立；K6 双轨随访并列。FCR 默认 visibility=private（评审 P0-4 定稿）。

-- ═══ 档案级（2）═══
CREATE TABLE workspace (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data_root TEXT,
  schema_version TEXT NOT NULL,
  dataset_state TEXT
);
CREATE TABLE profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date TEXT,
  gender TEXT,
  primary_role TEXT CHECK (primary_role IN ('PATIENT','CAREGIVER')),
  cognitive_flag TEXT CHECK (cognitive_flag IN ('stable','changed')),
  created_at TEXT NOT NULL
);

-- ═══ 指标（3）═══
CREATE TABLE metric_def (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  unit TEXT,
  category TEXT NOT NULL,
  color TEXT,
  is_numeric INTEGER NOT NULL DEFAULT 1,
  ctcae_rule TEXT,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE metric_point (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  code TEXT NOT NULL REFERENCES metric_def(code),
  measured_at TEXT NOT NULL,
  value_num REAL,
  value_text TEXT,
  source_note TEXT,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE lab_result (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  collected_at TEXT NOT NULL,
  panel TEXT,
  ref_range TEXT,
  document_id INTEGER
);

-- ═══ 通用（7）═══
CREATE TABLE adverse_event (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  term TEXT NOT NULL,
  ctcae_grade INTEGER,
  attribution_note TEXT,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE symptom_log (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  symptom TEXT NOT NULL,
  severity_text TEXT,
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE nutrition_log (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  intake_level TEXT CHECK (intake_level IN ('OK','REDUCED','MINIMAL')),
  weight_kg REAL,
  note TEXT,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE question (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('fact','view')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  asked_on TEXT,
  from_scenario TEXT,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE task (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  title TEXT NOT NULL,
  due_on TEXT,
  done INTEGER NOT NULL DEFAULT 0,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE document (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','parsed','parse_failed')),
  imported_at TEXT NOT NULL,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE saved_trial (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  trial_key TEXT NOT NULL,
  saved_at TEXT NOT NULL
);

-- ═══ MEL 专属（15）═══
-- K1/K2：自查档案（部位+时间；无任何诊断性列；照片仅存本机哈希与路径引用）
CREATE TABLE self_check (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profile(id),
  check_date TEXT NOT NULL,
  site_code TEXT NOT NULL,                  -- 部位编码（sole/back/scalp/nail/hand/other）
  site_note TEXT,
  self_description TEXT,                    -- 患者/照护者自述原文（"颜色变深、边缘不整齐"）
  size_note TEXT,                           -- 尺寸自述（"约 10mm"）
  photo_path TEXT,                          -- 本机路径（不入包、不进导出）
  photo_sha256 TEXT,
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
-- K2：皮损条目（部位聚合；与 self_check 一对多，变化只并列）
CREATE TABLE lesion (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  site_code TEXT NOT NULL,
  site_note TEXT,
  label TEXT,                               -- 患者起的名字（"左边那颗"）
  first_seen TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
-- K3：分期与前哨淋巴结（只引用原文；状态三态）
CREATE TABLE stage_record (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  stage_text TEXT NOT NULL,                 -- AJCC 原文（"IIIB（pT2aN1bM0）"）
  source_note TEXT,                         -- 医生/报告出处
  as_of TEXT,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE slnb_record (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  slnb_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('NOT_DONE','REPORTED','NOT_RECORDED')),
  result_text TEXT,                         -- 原文（"0/2 阴性" / "2/8 宏转移"）
  report_doc_id INTEGER,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
-- K4：分子三态（未检测≠阴性）
CREATE TABLE molecular_marker (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  marker TEXT NOT NULL CHECK (marker IN ('BRAF_V600','NRAS','TERT','CKIT','OTHER')),
  status TEXT NOT NULL CHECK (status IN ('detected','not_detected','not_tested')),
  method TEXT, specimen_date TEXT,
  value_text TEXT,
  report_doc_id INTEGER,
  note TEXT,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE molecular_marker_title ( marker TEXT PRIMARY KEY, title TEXT NOT NULL, ord INTEGER NOT NULL DEFAULT 0 );
-- 手术（扩大切除/切缘原文）
CREATE TABLE surgery_record (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  surgery_date TEXT NOT NULL,
  procedure_text TEXT,                      -- 原文（"扩大切除 + 前哨淋巴结活检"）
  margins_text TEXT,                        -- 切缘原文
  hospital TEXT,
  pathology_summary TEXT,
  report_doc_id INTEGER,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
-- 治疗（靶向/免疫周期；反应模式只抄原文）
CREATE TABLE systemic_tx (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('TARGET_BRAF_MEK','IMMUNO_PD1','IMMUNO_IPI_NIVO','IMMUNO_ADJUVANT','OTHER')),
  cycle_number INTEGER,
  start_date TEXT, end_date TEXT,
  regimen_text TEXT,
  response_text TEXT,                       -- 报告原文（不判读）
  status TEXT CHECK (status IN ('planned','ongoing','completed','stopped','changed')),
  stop_reason TEXT,
  ord INTEGER NOT NULL DEFAULT 0,
  revision INTEGER NOT NULL DEFAULT 1
);
-- K5：IO 不良反应轨道（皮疹/腹泻/肝/甲/其他；不归因）
CREATE TABLE irae_event (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  onset_date TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('RASH','DIARRHEA','HEPATITIS','THYROID','OTHER')),
  grade_text TEXT,                          -- CTCAE 等级原文（"1 级"）
  description TEXT,                         -- 患者语言
  action_text TEXT,                         -- 医嘱/处理原文
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  ord INTEGER NOT NULL DEFAULT 0
);
-- K6：双轨随访
CREATE TABLE followup_track (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('SKIN','IMAGING')),
  last_date TEXT, next_date TEXT,
  interval_note TEXT,                       -- 医生给的时间间隔原文
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE imaging_followup (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  exam_date TEXT NOT NULL,
  modality TEXT,                            -- CT/PET/MRI/超声
  site_text TEXT,                           -- 部位原文
  measure_text TEXT,                        -- 测量原文
  excerpt TEXT,                             -- 结论原文
  ldh_at_time REAL,
  report_doc_id INTEGER,
  ord INTEGER NOT NULL DEFAULT 0
);
-- 暴露与防护（只做事实记录与提示，不做命令式）
CREATE TABLE sun_exposure (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  record_date TEXT NOT NULL,
  exposure_note TEXT,                       -- 晒伤史/日光浴/职业暴露原文
  protection_note TEXT,                     -- 当前防护自述（防晒/衣物）
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  ord INTEGER NOT NULL DEFAULT 0
);
-- FCR 双人记录（评审 P0-4：默认 private，三出口过滤）
CREATE TABLE fcr_record (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  record_date TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  score INTEGER CHECK (score BETWEEN 0 AND 10),
  note TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('shared','private')),
  ord INTEGER NOT NULL DEFAULT 0
);
-- 双主体（身体意象/亲密等私密记录）
CREATE TABLE viewpoint (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('PATIENT','CAREGIVER')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('shared','private')),
  topic TEXT CHECK (topic IN ('BODY_IMAGE','INTIMACY','MOOD','FAMILY','DECISION_ACP','OTHER')),
  content TEXT NOT NULL,
  record_date TEXT NOT NULL,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE decision_checklist (
  id INTEGER PRIMARY KEY,
  profile_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','discussed','filed')),
  note TEXT,
  ord INTEGER NOT NULL DEFAULT 0
);

-- ═══ 导入件（3，18 号 v2 语义）═══
CREATE TABLE import_file (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES document(id),
  byte_size INTEGER NOT NULL,
  mime TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE parse_job (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES document(id),
  requested_at TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('running','succeeded','failed')),
  error_code TEXT,
  error_message TEXT
);
CREATE TABLE candidate (
  id INTEGER PRIMARY KEY,
  parse_job_id INTEGER NOT NULL REFERENCES parse_job(id),
  field_name TEXT NOT NULL,
  value_text TEXT,
  value_num REAL,
  unit TEXT,
  confirmed INTEGER NOT NULL DEFAULT 0,
  confirmed_at TEXT,
  target_table TEXT,
  target_id INTEGER
);
