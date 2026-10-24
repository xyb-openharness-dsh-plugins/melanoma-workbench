/* melparse 单测：HTML 表格先转竖线表、LaTeX 单位剥离、BRAF/LDH 词边界与 not 排除。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractCandidates, htmlTablesToPipes, stripLatex, normalizeMarkerStatus } from '../dsh/melparse.js';

const keys = (r) => r.candidates.map((c) => c.key);

test('HTML 表格：先转竖线表再按位置对齐（不把整表压成一行）', () => {
  const md = `<table><tr><th>项目</th><th>结果</th><th>单位</th></tr>
<tr><td>Breslow 厚度</td><td>3.8</td><td>mm</td></tr>
<tr><td>LDH</td><td>210</td><td>U/L</td></tr></table>`;
  const pipes = htmlTablesToPipes(md);
  assert.ok(pipes.includes('| Breslow 厚度 | 3.8 | mm |'));
  const r = extractCandidates(md);
  assert.deepEqual(keys(r), ['BRESLOW', 'LDH']);
  assert.equal(r.candidates[0].value, 3.8);
  assert.equal(r.candidates[1].value, 210);
});

test('词边界：BRAF-like 不算 BRAF；LDH- 不算 LDH', () => {
  const md = `BRAF-like 形态学描述，不作为分子结果。
LDH-C 同工酶，未提供 LDH 数值。
| 项目 | 结果 | 单位 |
| --- | --- | --- |
| BRAF-like | 阳性 | |
| LDH- | 210 | U/L |
| BRAF | 阳性 | |`;
  const r = extractCandidates(md);
  const braf = r.candidates.filter((c) => c.key === 'BRAF');
  const ldh = r.candidates.filter((c) => c.key === 'LDH');
  assert.equal(braf.length, 1, 'BRAF-like 不得被抄成 BRAF 候选');
  assert.equal(ldh.length, 0, 'LDH- 不得被抄成 LDH 候选');
});

test('BRAF / NRAS / TERT 状态原文归一（检出 / 未检出 / 未检测）', () => {
  assert.equal(normalizeMarkerStatus('BRAF V600E 突变阳性（报告原文）').status, 'detected');
  assert.equal(normalizeMarkerStatus('NRAS 基因未检出突变').status, 'not_detected');
  assert.equal(normalizeMarkerStatus('未检测（报告未列此项）').status, 'not_tested');
  assert.equal(normalizeMarkerStatus('形态描述'), null);

  const md = `| 项目 | 结果 |
| --- | --- |
| BRAF V600E | 突变阳性 |
| NRAS | 未检出突变 |
| TERT 启动子 | 未检测 |`;
  const r = extractCandidates(md);
  assert.deepEqual(keys(r), ['BRAF', 'NRAS', 'TERT']);
  assert.deepEqual(r.candidates.map((c) => c.status), ['detected', 'not_detected', 'not_tested']);
});

test('单位：先剥 LaTeX 外壳（$10^9/L$ / \\mu）', () => {
  assert.equal(stripLatex('$10^9/L$'), '10^9/L');
  assert.equal(stripLatex('\\mu mol/L'), 'μmol/L');
});

test('不等式保留原文、数值留空（不替用户折成 0.5）', () => {
  const md = `| 项目 | 结果 | 单位 |
| --- | --- | --- |
| LDH | <120 | U/L |`;
  const r = extractCandidates(md);
  assert.equal(r.candidates[0].value, '<120');
  assert.equal(r.candidates[0].unit, 'U/L');
});

test('参考范围两数一格整格放弃（不猜哪个是结果）', () => {
  const md = `| 项目 | 结果 | 单位 |
| --- | --- | --- |
| LDH | 120-250 | U/L |`;
  const r = extractCandidates(md);
  assert.equal(r.candidates.length, 0);
  assert.ok(r.skipped.length >= 1);
});
