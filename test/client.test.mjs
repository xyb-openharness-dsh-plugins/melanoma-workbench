/* 客户端链路与 apiBase 定稿契约单测。
 * apiBase 的两种形态（独立空串 / 宿主 /api/<slug>）必须都回归；
 * 守卫只禁交界重复 /api/api，不许 includes('/api') 一刀切（GBM 踩 4）。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appJs = readFileSync(join(ROOT, 'public/app.js'), 'utf8');

/** 从真实源码里截出两个纯函数（不在测试里重写一份判据）。 */
function extract(name) {
  const start = appJs.indexOf(`function ${name}`);
  assert.ok(start >= 0, `public/app.js 缺少 ${name}`);
  let depth = 0;
  let i = appJs.indexOf('{', start);
  for (let j = i; j < appJs.length; j += 1) {
    if (appJs[j] === '{') depth += 1;
    else if (appJs[j] === '}') { depth -= 1; if (depth === 0) return appJs.slice(start, j + 1); }
  }
  throw new Error(`无法截取 ${name}`);
}

const ctx = vm.createContext({});
vm.runInContext(`${extract('deriveApiBase')}\n${extract('apiBaseProblems')}\n${extract('agentLabelFor')}\nthis.deriveApiBase = deriveApiBase; this.apiBaseProblems = apiBaseProblems; this.agentLabelFor = agentLabelFor;`, ctx);

test('apiBase 双形态：独立启动空串 / 宿主 /api/mel-workbench', () => {
  assert.equal(ctx.deriveApiBase('/api/mel/ui/index.html'), '');
  assert.equal(ctx.deriveApiBase('/api/mel/ui/'), '');
  assert.equal(ctx.deriveApiBase('/api/mel-workbench/ui/'), '/api/mel-workbench');
  assert.equal(ctx.deriveApiBase('/api/mel-workbench/ui/index.html'), '/api/mel-workbench');
  assert.equal(ctx.deriveApiBase('/'), '');
  assert.equal(ctx.apiBaseProblems('').length, 0);
  assert.equal(ctx.apiBaseProblems('/api/mel-workbench').length, 0);
});

test('apiBase 守卫：只禁交界重复 /api/api，不许 includes 一刀切', () => {
  assert.ok(ctx.apiBaseProblems('/api').length > 0);
  assert.ok(ctx.apiBaseProblems('/foo/api').length > 0);
  assert.ok(ctx.apiBaseProblems('/api/api/mel').length > 0);
  assert.ok(ctx.apiBaseProblems('relative/path').length > 0);
  /* 宿主前缀本身含 /api 是正常的 */
  assert.equal(ctx.apiBaseProblems('/api/melanoma-workbench').length, 0);
});

test('AI 五态：无会话 / 连接中 / 已展开 / 已收起 / 服务缺失', () => {
  const f = ctx.agentLabelFor;
  assert.equal(f({ unavailable: false, connecting: false, everOpened: false, open: false }), 'AI 对话');
  assert.equal(f({ unavailable: false, connecting: true, everOpened: false, open: false }), '正在连接…');
  assert.equal(f({ unavailable: false, connecting: false, everOpened: true, open: true }), '收起 AI 对话');
  assert.equal(f({ unavailable: false, connecting: false, everOpened: true, open: false }), '打开 AI 对话');
  assert.equal(f({ unavailable: true, connecting: false, everOpened: true, open: true }), 'AI 对话暂不可用');
});

test('public/app.js：保留 aiPromptWithCtx 与 mel:agent-draft；五处替换都在', () => {
  assert.ok(appJs.includes('function aiPromptWithCtx'));
  assert.ok(appJs.includes("type: 'mel:agent-draft'"));
  assert.ok(appJs.includes('async function loadBootstrap'));
  assert.ok(appJs.includes('/api/mel/bootstrap'));
  assert.ok(appJs.includes('function agentLabelFor'));
  assert.ok(appJs.includes("'AI 对话暂不可用'"));
  assert.ok(appJs.includes('AGENT_W_KEY'));
  assert.ok(appJs.includes('async function boot'));
  /* 禁裸 throw 白屏：apiBase 校验失败走横幅 */
  assert.ok(appJs.includes('function showBootBanner'));
  assert.ok(!/throw new Error\('API_BASE/.test(appJs));
});

test('src/client.js → lib/client.js：占位清零、前缀与面板参数注入、mel:agent-draft 监听保留', () => {
  const src = readFileSync(join(ROOT, 'src/client.js'), 'utf8');
  const lib = readFileSync(join(ROOT, 'lib/client.js'), 'utf8');
  assert.ok(src.includes('__PKG_NAME__'));
  assert.equal([...lib.matchAll(/__[A-Z_]+__/g)].length, 0, 'lib/client.js 不得残留占位');
  assert.ok(!lib.includes('接入骨架'));
  assert.ok(lib.includes("data.type !== 'mel:agent-draft'"));
  assert.ok(lib.includes("const API_PREFIX = '/api/mel'"));
  assert.ok(lib.includes("const VERSION = '"));
  assert.ok(lib.includes('customFrame: CUSTOM_FRAME'));
  assert.ok(lib.includes("const BUSINESS_WIDTH = Number('0.65')"));
  assert.ok(lib.includes('melpal.pal.melanoma.agent-pane.v1'));
});

test('面板参数唯一来源：0.65 与 0.35 互补', async () => {
  const { PANEL, AGENT_PANE, assertPanelConfig } = await import('../lib/layout.js');
  assert.equal(PANEL.customFrame, true);
  assert.equal(PANEL.businessSide, 'left');
  assert.ok(Math.abs(PANEL.businessWidth + AGENT_PANE.default - 1) < 1e-9);
  assert.deepEqual(assertPanelConfig(), []);
});
