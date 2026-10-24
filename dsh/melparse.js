/* markdown → 候选（MEL 词表）。18 号 v2 六部件之三。
 *
 * 本层只抄写，不判读：Breslow 厚度、LDH、BRAF 状态都按报告原文搬运；
 * 「厚度多少算高危」「BRAF 阳性该用什么药」不在本层，也不在界面出现。
 *
 * 词边界坑（MEL 实测）：
 * - `BRAF-like` 里的 BRAF 不是 BRAF 基因检测结果，命中就会把一句描述抄成一条假候选；
 * - `LDH-`（如 LDH-C、LDH-A 同工酶或排版连字符）不是 LDH 化验值；
 * - NRAS 不能命中 KRAS/NRAS-like；TERT 不能命中 TERT-like。
 * 所以别名匹配用前后断言 `(?<![A-Za-z0-9-])…(?![A-Za-z0-9-])`，并给高发项另加 `not` 排除。
 *
 * 其余四条沿用家族契约（18 号 §7/§8）：
 * 1. 先 htmlTablesToPipes() 再按位置对齐（先剥标签会把整表压成一行，静默串位）；
 * 2. 单位先剥 LaTeX 外壳（`$10^9/L$`），认不出只剥壳不推断；
 * 3. 不等式 `<0.5` 原样保留、value_num 留空；
 * 4. 指标数与数值数不一致整行放弃，不做模糊匹配。
 */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function decodeEntities(text) {
  return String(text)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

/** HTML 表格 → 竖线表（colspan 补空、首行表头 + 分隔行，四个细节缺一不可）。 */
export function htmlTablesToPipes(md) {
  if (!/<table/i.test(md)) return md;
  return md.replace(/<table[\s\S]*?<\/table>/gi, (block) => {
    const out = [];
    for (const row of block.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
      const cells = [];
      for (const m of row.matchAll(/<t([dh])([^>]*)>([\s\S]*?)<\/t\1>/gi)) {
        const attrs = m[2] || '';
        const text = decodeEntities(m[3].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
        cells.push(text);
        const span = Number((attrs.match(/colspan\s*=\s*["']?(\d+)["']?/i) || [])[1] || 1);
        for (let k = 1; k < span; k += 1) cells.push('');
      }
      if (cells.length) out.push(`| ${cells.map((c) => c.replace(/\|/g, '/')).join(' | ')} |`);
    }
    if (out.length) out.splice(1, 0, `| ${out[0].split('|').filter((x) => x.trim()).map(() => '---').join(' | ')} |`);
    return out.join('\n');
  });
}

/** 剥 LaTeX 外壳（只剥壳，不推断内容）。 */
export function stripLatex(text) {
  return String(text ?? '')
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
    .replace(/\\\[([\s\S]*?)\\\]/g, '$1')
    .replace(/\\(?:text|mathrm|mbox)\{([^{}]*)\}/g, '$1')
    .replace(/\\mu\s*/g, 'μ')
    .replace(/[{}]/g, '');
}

function cells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}
const isTableLine = (line) => line.trim().startsWith('|') && line.trim().endsWith('|');
const isSeparator = (line) => /^\|[\s:|-]+\|$/.test(line.trim());

/**
 * MEL 指标字典。
 * kind='numeric'（默认）走数值搬运；kind='text' 保留状态原文（BRAF 检出/未检出/未检测）。
 * `not` 是排除正则：凡命中 not 的单元格不算这条（中文没有 \b，词边界挡不住复合词）。
 */
export const LAB_DICT = [
  {
    key: 'BRESLOW', name: 'Breslow 厚度', aliases: ['Breslow', 'Breslow厚度', '布雷斯洛厚度', '肿瘤厚度'],
    not: /Breslow\s*[-–—]|Breslow-like/i, unit: 'mm', kind: 'numeric',
  },
  {
    key: 'LDH', name: 'LDH（乳酸脱氢酶）', aliases: ['LDH', '乳酸脱氢酶'],
    not: /LDH\s*[-–—]|LDH-like|LDH[ABC]\b/i, unit: 'U/L', kind: 'numeric',
  },
  {
    key: 'BRAF', name: 'BRAF 状态', aliases: ['BRAF', 'BRAF V600', 'BRAF V600E', 'BRAF突变'],
    not: /BRAF\s*[-–—]|BRAF-like/i, unit: '', kind: 'text',
  },
  {
    key: 'NRAS', name: 'NRAS 状态', aliases: ['NRAS'],
    not: /NRAS\s*[-–—]|NRAS-like|KRAS/i, unit: '', kind: 'text',
  },
  {
    key: 'TERT', name: 'TERT 启动子', aliases: ['TERT', 'TERT启动子', 'TERT promoter'],
    not: /TERT\s*[-–—]|TERT-like/i, unit: '', kind: 'text',
  },
  {
    key: 'ALT', name: 'ALT（丙氨酸氨基转移酶）', aliases: ['ALT', '丙氨酸氨基转移酶', '谷丙转氨酶'],
    unit: 'U/L', kind: 'numeric',
  },
  {
    key: 'AST', name: 'AST（天门冬氨酸氨基转移酶）', aliases: ['AST', '天门冬氨酸氨基转移酶', '谷草转氨酶'],
    unit: 'U/L', kind: 'numeric',
  },
  {
    key: 'TSH', name: 'TSH（促甲状腺激素）', aliases: ['TSH', '促甲状腺激素'],
    unit: 'mIU/L', kind: 'numeric',
  },
];

/** 词边界匹配：ASCII 别名前后不得是字母/数字/连字符（MEL 的 BRAF-like、LDH- 全靠这个）。 */
function aliasHit(text, alias) {
  const re = new RegExp(`(?<![A-Za-z0-9-])${escapeRe(alias)}(?![A-Za-z0-9-])`, 'i');
  return re.test(text);
}

/** 在原文里找字典项；命中 not 的一律不算。 */
function lookup(text) {
  return LAB_DICT.find((d) => !(d.not && d.not.test(text)) && d.aliases.some((a) => aliasHit(text, a))) || null;
}

const NUM_RE = /^(?:[<>≤≥]\s*)?-?\d+(?:\.\d+)?$/;
function valueOf(cell) {
  const t = stripLatex(String(cell)).replace(/\s/g, '');
  if (!t) return null;
  if (/^[<>≤≥]/.test(t)) {
    const m = t.match(/^([<>≤≥])(-?\d+(?:\.\d+)?)$/);
    return m ? { raw: `${m[1]}${m[2]}`, num: null } : null;
  }
  if (!NUM_RE.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? { raw: t, num: n } : null;
}

const UNIT_RE = /^(10\^?9\/L|×10\^?9\/L|10⁹\/L|×10⁹\/L|g\/L|mg\/L|mmol\/L|μmol\/L|umol\/L|U\/mL|U\/L|mIU\/mL|mIU\/L|IU\/mL|IU\/L|ng\/mL|ng\/dL|ng\/L|pg\/mL|pmol\/L|kg|mm|cm|%|fL|pg)$/i;

export function normalizeUnit(cell) {
  return stripLatex(String(cell ?? '')).replace(/\s/g, '');
}

/** 状态原文归一（只归一到三种可抄写的状态，不推断）。 */
export function normalizeMarkerStatus(text) {
  const t = stripLatex(String(text ?? ''));
  if (!t) return null;
  if (/未检测|未做|未送检|not\s*tested/i.test(t)) return { status: 'not_tested', value: t };
  if (/未检出|阴性|野生型|not\s*detected|negative/i.test(t)) return { status: 'not_detected', value: t };
  if (/检出|阳性|突变|detected|positive/i.test(t)) return { status: 'detected', value: t };
  return null;
}

/**
 * 从 markdown 抽候选。
 * @returns {{candidates: Array, skipped: Array}} candidates 每项 {name,key,value,num,unit,line,kind,status?}
 */
export function extractCandidates(markdown) {
  const md = htmlTablesToPipes(String(markdown ?? ''));
  const candidates = [];
  const skipped = [];
  const seen = new Set();

  const push = (hit, val, unitCell, line, status) => {
    const dedupe = `${hit.key}:${val}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    candidates.push({
      key: hit.key,
      name: hit.name,
      kind: hit.kind ?? 'numeric',
      value: val,
      unit: unitCell || hit.unit || '',
      line,
      ...(status ? { status } : {}),
    });
  };

  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!isTableLine(lines[i])) { i += 1; continue; }
    const start = i;
    while (i < lines.length && isTableLine(lines[i])) i += 1;
    const blockLines = lines.slice(start, i).filter((l) => !isSeparator(l));
    if (blockLines.length < 2) continue;

    const header = cells(blockLines[0]);
    let idxName = header.findIndex((h) => /项目|指标|名称|检验|item|test/i.test(h));
    let idxVal = header.findIndex((h) => /结果|数值|value|result/i.test(h));
    let idxUnit = header.findIndex((h) => /单位|unit/i.test(h));
    if (idxName === -1 && idxVal === -1 && header.length >= 2) { idxName = 0; idxVal = 1; }
    if (idxName === -1 || idxVal === -1) continue;

    for (const line of blockLines.slice(1)) {
      const row = cells(line);
      const name = stripLatex(row[idxName] ?? '');
      const hit = lookup(name);
      if (!hit) continue;
      const unitCell = idxUnit >= 0 ? normalizeUnit(row[idxUnit]) : '';

      if (hit.kind === 'text') {
        const raw = stripLatex(row[idxVal] ?? '').trim();
        const status = normalizeMarkerStatus(raw);
        if (!status) { skipped.push({ name, cell: raw, reason: '状态原文不是检出/未检出/未检测' }); continue; }
        push(hit, status.value, '', start + 1, status.status);
        continue;
      }

      const val = valueOf(row[idxVal] ?? '');
      if (!val) { skipped.push({ name, cell: row[idxVal] ?? '', reason: '不是单一数值（参考范围/文字）' }); continue; }
      if (unitCell && !UNIT_RE.test(unitCell)) { skipped.push({ name, cell: unitCell, reason: '单位不认识' }); continue; }
      push(hit, val.num === null ? val.raw : val.num, unitCell, start + 1);
    }
  }

  /* 纯文本行（没有表格的病理小结）：只认 BRAF/NRAS/TERT 状态，且必须避开 BRAF-like / LDH-。 */
  for (const [n, line] of lines.entries()) {
    if (isTableLine(line)) continue;
    for (const hit of LAB_DICT) {
      if (hit.kind !== 'text') continue;
      if (!hit.aliases.some((a) => aliasHit(line, a))) continue;
      if (hit.not && hit.not.test(line)) continue;
      const status = normalizeMarkerStatus(line);
      if (!status) continue;
      push(hit, status.value, '', n + 1, status.status);
    }
  }

  return { candidates, skipped };
}

/** 报告日期：文件名或正文里的 YYYY-MM-DD / YYYY年M月D日。取不到就是 null（不猜今天）。 */
export function guessReportDate(text, fallback = null) {
  const m = String(text ?? '').match(/(20\d{2})[-/年.](\d{1,2})[-/月.](\d{1,2})/);
  if (!m) return fallback;
  const [_, y, mo, d] = m;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
