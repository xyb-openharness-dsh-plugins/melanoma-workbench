/* UI parity：开发版与原型共用同一份渲染代码。
 * 逐字符比对会渲染区（chartSVG → AI 面板前）与样式表；只允许五处定点替换（数据/AI 五态/宽度/版本/启动）。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const proto = readFileSync(join(ROOT, 'prototypes/v0.2/app.js'), 'utf8');
const dev = readFileSync(join(ROOT, 'public/app.js'), 'utf8');

const slice = (text, start, end) => {
  const a = text.indexOf(start); const b = text.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `截取失败：${start} → ${end}`);
  return text.slice(a, b);
};

test('样式表：public/style.css 与原型逐字节一致（新增样式只进 shell.css）', () => {
  assert.equal(readFileSync(join(ROOT, 'public/style.css'), 'utf8'), readFileSync(join(ROOT, 'prototypes/v0.2/style.css'), 'utf8'));
});

test('渲染代码逐字符一致：chartSVG / 全部页面函数 / RENDERERS / subnav', () => {
  const a = slice(proto, 'function chartSVG', '/* ---------------- AI 面板');
  const b = slice(dev, 'function chartSVG', '/* ---------------- AI 面板');
  assert.equal(b, a);
});

test('页面树与场景表同源：10 一级 / 30 二级 / 13 场景', () => {
  const block = (text) => slice(text, 'const SUBPAGES = {', 'const SUBTITLES');
  assert.equal(block(dev), block(proto));
  const scenes = (text) => slice(text, 'const SCENES = [', '/* ---------------- 指标目录');
  assert.equal(scenes(dev), scenes(proto));
  const subs = [...proto.matchAll(/'([a-z]+)', '([^']+)'\]/g)].length;
  assert.ok(subs >= 30);
  const pages = proto.match(/const PAGES = \[[\s\S]*?\];/)[0];
  assert.equal((pages.match(/\['/g) || []).length, 10);
});

test('索引页：四件齐全、noindex、内联 favicon、版本首屏可见、AI 五态按钮存在', () => {
  const html = readFileSync(join(ROOT, 'public/index.html'), 'utf8');
  for (const f of ['style.css', 'shell.css', 'demo-data.js', 'app.js']) assert.ok(html.includes(f), `index.html 应引用 ${f}`);
  assert.ok(html.includes('name="robots" content="noindex"'));
  assert.ok(/rel="icon" href="data:image\/svg\+xml/.test(html));
  assert.ok(html.includes('id="agent-toggle"'));
  assert.ok(html.includes('id="agent-splitter"'));
  assert.ok(html.includes('id="agent-pane"'));
  assert.ok(/id="app-version">v\d+\.\d+\.\d+/.test(html));
  assert.ok(/id="ver-chip"[^>]*>v\d+\.\d+\.\d+/.test(html));
});

test('动作集合：开发版覆盖原型全部 data-action（没有漏迁移的交互）', () => {
  const actions = (text) => new Set([...text.matchAll(/data-action="([a-z0-9-]+)"/g)].map((m) => m[1]));
  const p = actions(proto); const d = actions(dev);
  const missing = [...p].filter((x) => !d.has(x));
  assert.deepEqual(missing, []);
});
