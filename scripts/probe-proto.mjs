#!/usr/bin/env node
/**
 * 原型无头实测（M2 自验：必须出数字，不口头说「没问题」）。
 *
 * 数字：
 *  - 10 一级 ×（2 无二级 + 30 页签）× 2 档案 = 64 视图逐页签走查（aria-selected 与内容指纹匹配；
 *    逐个「查询→点击→再查询」，不预抓全部按钮——render 会重建 DOM）；截图存 docs/shots/{view}-{sub}-{profile}.png；
 *  - 每页 body.scrollWidth vs innerWidth、控制台 error、网络失败；
 *  - HVT X1：页签覆盖 = 64 视图；X2：13 场景 chip 路径 + 页内 data-step 跳转 + 回首页一步；
 *    X3：每页显式编辑入口 ≤1；X4：解析候选 accept/reject + AI 候选三步；
 *  - AI 面板：默认 35% / Home 45% / End 25%（aria-valuenow 同步）；postMessage 前缀 mel:agent-draft；
 *  - 一图秀：数值线连线、分类节点只节点不连线；.chart .line 的 computed fill 必须 = none（THY 黑块教训）；
 *  - 指标卡 3D 翻转：aria-pressed 独立；
 *  - 红线词扫描：K1 诊断性措辞 / K6 命令式防晒 / 「消除复发恐惧」等禁词 0；
 *    未检测≠阴性、ABCDE 解释不是判断、皮疹不归因、照片仅本机 等必现句逐页断言。
 *
 * 用法：node scripts/probe-proto.mjs；退出码 0/1。依赖本机 Chrome（file:// 直开）。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome, stopChrome, sleep } from './cdp.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = join(ROOT, 'docs', 'shots');
mkdirSync(SHOTS, { recursive: true });
const CDP_PORT = Number(process.env.MEL_PROBE_CDP_PORT || 9364);
const URL_APP = `file://${join(ROOT, 'prototypes', 'v0.2', 'index.html')}`;

const VIEW_SUBS = [
  ['dash', ''], ['chart', ''],
  ['self', 'map'], ['self', 'lesion'], ['self', 'timeline'], ['self', 'acral'], ['self', 'abcde'],
  ['stage', 'pathology'], ['stage', 'slnb'], ['stage', 'record'], ['stage', 'molecular'],
  ['treatment', 'pathway'], ['treatment', 'surgery'], ['treatment', 'systemic'],
  ['irae', 'tracks'], ['irae', 'rash'], ['irae', 'redline'],
  ['followup', 'calendar'], ['followup', 'skin'], ['followup', 'imaging'], ['followup', 'privacy'],
  ['care', 'intake'], ['care', 'sun'], ['care', 'fatigue'],
  ['mind', 'feelings'], ['mind', 'body'], ['mind', 'intimacy'], ['mind', 'genetic'],
  ['docs', 'library'], ['docs', 'candidates'], ['docs', 'prepare'], ['docs', 'trials']
];
/* 红线禁词（K1/K4/K6 + 家族交互契约；引用原文的疾病名不在列） */
const FORBIDDEN = [
  '良性', '恶性', '不像', '观察即可',
  '必须防晒', '一定要防晒', '不能晒太阳', '涂 SPF50 就不会', '为了补维生素 D 多晒太阳',
  '消除复发恐惧',
  '可以少查', '不用查', '不必复查', '无需复查', '不需要复查', '可以少做影像',
  '建议调整剂量', '建议加量', '建议减量', '自动分级', '风险评分', 'risk_level', 'causality',
  '必须做', '一定要做', '不可恢复', '彻底删除'
];
/* 必现句（逐页断言：红线在页面上必须「看得见」） */
const REQUIRED = [
  ['self/abcde', 'ABCDE 解释不是判断'],
  ['stage/molecular', '未检测不等于阴性'],
  ['irae/rash', '「皮疹是药还是病」不归因'],
  ['self/map', '照片仅本机保存'],
  ['followup/calendar', '两轨不同频是正常的'],
  ['care/sun', '只做事实提醒'],
  ['stage/slnb', '未做'],
  ['chart/', '分类节点只画点不连线']
];
/* 13 场景直达（与 app.js SCENES 同源：id→落点） */
const SCENES = [
  ['S01', 'self', 'map'], ['S02', 'stage', 'slnb'], ['S03', 'stage', 'molecular'],
  ['S04', 'irae', 'tracks'], ['S05', 'followup', 'calendar'], ['S06', 'docs', 'prepare'],
  ['S07', 'care', 'sun'], ['S08', 'self', 'map'], ['S09', 'followup', 'imaging'],
  ['S10', 'care', 'intake'], ['S11', 'mind', 'body'], ['S12', 'docs', 'trials'],
  ['S13', 'docs', 'library']
];

const ch = await launchChrome({ port: CDP_PORT });
const { cdp } = ch;
const errors = cdp.errors;
const badResponses = cdp.badResponses;
const out = {
  tabs: 0, screenshots: 0, overflow: [], ariaMismatch: [], forbidden: [], required: [], orphanPages: null, maxFormFields: 0,
  scenePaths: [], stepJumps: 0, editEntries: [], flip: {}, chart: {}, agent: {}, aiLoop: {},
  navButtons: 0, profileSwitch: {}, postMessagePrefix: null
};

try {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: URL_APP });
  await sleep(500);
  const bootedExpr = "document.body && document.body.getAttribute('data-booted') === '1'";
  for (let i = 0; i < 60 && !(await cdp.eval(bootedExpr)); i += 1) await sleep(150);

  out.navButtons = await cdp.eval("document.querySelectorAll('#nav .nav-button').length");
  out.maxFormFields = await cdp.eval("Math.max(...Object.values(FORM_IDS).map((a) => a.length))");
  out.orphanPages = await cdp.eval(`(() => {
    const keys = Object.entries(SUBPAGES).flatMap(([p, arr]) => arr.map(([s]) => p + '/' + s));
    const missing = keys.filter((k) => !(k in RENDERERS));
    return JSON.stringify({ subs: keys.length, missing });
  })()`);

  /* 捕获 postMessage 前缀（AI 协助按钮 → 外壳草稿） */
  await cdp.eval(`window.__melMsgs = []; window.addEventListener('message', (e) => { if (e.data && typeof e.data.type === 'string') window.__melMsgs.push(e.data.type); });`);

  async function shot(name) {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(SHOTS, `${name}.png`), Buffer.from(r.data, 'base64'));
    out.screenshots += 1;
  }
  async function goto(page, sub) {
    await cdp.eval(`location.hash = ${JSON.stringify('#' + page + (sub ? '/' + sub : ''))}`);
    await sleep(70);
    await cdp.eval('window.scrollTo(0,0)');
    await sleep(60);
  }
  async function textScan() {
    const raw = await cdp.eval(`(() => {
      const t = (document.getElementById('main').innerText || '') + ' ' + (document.querySelector('.agent-body')?.innerText || '');
      return t.replace(/\\s+/g, ' ');
    })()`);
    return raw || '';
  }

  /* ── 逐 (view,sub) × 2 档案：逐 tab 查询→点击→再查询 ── */
  for (const pid of ['demo1', 'demo2']) {
    for (const [page, sub0] of VIEW_SUBS) {
      await cdp.eval(`(() => { state.profileId = ${JSON.stringify(pid)}; state.pin = null; state.flipped = new Set(); })()`);
      await goto(page, sub0 || '');
      const subs = sub0 ? [sub0] : [''];
      if (!sub0) subs.push(...(await cdp.eval(`(SUBPAGES[${JSON.stringify(page)}] || []).map((x) => x[0])`)));
      const fingerprints = [];
      for (const sub of subs) {
        if (sub === '') {
          const chk0 = await cdp.eval(`(() => { const html = document.getElementById('main').innerHTML; return JSON.stringify({ len: html.length, fp: html.replace(/\\s+/g, '').slice(120, 320) }); })()`);
          fingerprints.push(JSON.parse(chk0));
        } else {
          const tabInfo = await cdp.eval(`(() => {
            const t = document.querySelector('#main .subnav [role=tab][data-sub="${sub}"]');
            if (!t) return null;
            const label = t.textContent.trim();
            t.click();
            return label;
          })()`);
          if (!tabInfo) { out.ariaMismatch.push(`${pid}/${page}/${sub}: tab 不存在`); continue; }
          await sleep(55);
          const chk = await cdp.eval(`(() => {
            const t = document.querySelector('#main .subnav [role=tab][data-sub="${sub}"]');
            const html = document.getElementById('main').innerHTML;
            return JSON.stringify({ sel: t ? t.getAttribute('aria-selected') : null, len: html.length, fp: html.replace(/\\s+/g, '').slice(120, 320), crumb: document.getElementById('breadcrumb').textContent });
          })()`);
          const d = JSON.parse(chk);
          if (d.sel !== 'true') out.ariaMismatch.push(`${pid}/${page}/${sub}: aria-selected=${d.sel}`);
          fingerprints.push(d);
          await goto(page, sub);
        }
        const text = await textScan();
        for (const w of FORBIDDEN) if (text.includes(w)) out.forbidden.push(`${pid}/${page}/${sub}: 禁词「${w}」`);
        const ov = JSON.parse(await cdp.eval('JSON.stringify({ s: document.documentElement.scrollWidth, i: window.innerWidth })'));
        if (ov.s > ov.i + 1) out.overflow.push(`${pid}/${page}/${sub}: scrollWidth=${ov.s} > innerWidth=${ov.i}`);
      }
      const uniq = new Set(fingerprints.map((f) => f.fp || f));
      if (uniq.size < fingerprints.length) out.ariaMismatch.push(`${pid}/${page}: ${fingerprints.length - uniq.size} 个页签内容指纹重复`);
      out.tabs += subs.length;
      await shot(`${page}-${sub0 || 'main'}-${pid}`);
    }
  }
  await cdp.eval(`(() => { state.profileId = 'demo1'; })()`);
  await goto('dash', '');

  /* ── HVT X2：13 场景 chip 路径 ── */
  await goto('dash', '');
  for (const [sid] of SCENES) {
    const r = await cdp.eval(`(() => {
      const chip = document.querySelector('.scene-chip[data-scene="${sid}"]');
      if (!chip) return JSON.stringify({ ok: false, why: 'chip 不存在' });
      chip.click();
      return JSON.stringify({ ok: true, page: state.page, sub: state.sub[state.page] || '', crumb: document.getElementById('breadcrumb').textContent });
    })()`);
    const d = JSON.parse(r);
    if (!d.ok) { out.scenePaths.push(`X2 ${sid}: ${d.why}`); continue; }
    const s = SCENES.find((x) => x[0] === sid);
    if (d.page !== s[1] || (s[2] && d.sub !== s[2])) out.scenePaths.push(`X2 ${sid}: 落点 ${d.page}/${d.sub} ≠ ${s[1]}/${s[2]}`);
    for (;;) {
      const step = await cdp.eval(`(() => {
        const b = document.querySelector('#main [data-step]');
        if (!b) return null;
        const k = b.getAttribute('data-step');
        b.click();
        return k;
      })()`);
      if (!step) break;
      out.stepJumps += 1;
      await sleep(45);
    }
    const back = await cdp.eval(`(() => {
      const b = document.querySelector('.back-row [data-action="go"][data-page="dash"]');
      if (b) { b.click(); return state.page === 'dash'; }
      return state.page === 'dash';
    })()`);
    if (!back) out.scenePaths.push(`X2 ${sid}: 回看板失败`);
    await goto('dash', '');
  }

  /* ── X3：每页显式编辑入口 ≤1 ── */
  for (const [page, sub] of VIEW_SUBS) {
    await goto(page, sub || '');
    const n = await cdp.eval(`(() => {
      const head = document.querySelector('#main .page-head .actions');
      if (!head) return 0;
      const set = new Set();
      head.querySelectorAll('button.primary').forEach((b) => set.add(b));
      head.querySelectorAll('details.more-menu').forEach((b) => set.add(b));
      head.querySelectorAll('button[data-action$="-add"]').forEach((b) => set.add(b));
      return set.size;
    })()`);
    if (n > 1) out.editEntries.push(`X3 ${page}/${sub || 'main'}: 显式编辑入口 ${n} 个`);
  }

  /* ── X4：解析候选闭环 ── */
  await goto('docs', 'candidates');
  const cand0 = await cdp.eval(`(() => {
    const b = document.querySelector('#main [data-action="cand-accept"]');
    if (!b) return null;
    b.click();
    return b.getAttribute('data-id');
  })()`);
  await sleep(45);
  const cand1 = await cdp.eval(`(() => {
    const rows = [...document.querySelectorAll('#main [data-action="cand-reject2"]')];
    if (!rows.length) return null;
    rows[0].click();
    return rows[0].getAttribute('data-id');
  })()`);
  await sleep(45);
  const candState = await cdp.eval(`JSON.stringify((DEMO_DATA.profiles.find(p=>p.id==='demo1').docs.candidates).map(c=>c.state))`);
  if (!cand0 || !cand1) out.aiLoop.parseCand = 'X4 解析候选按钮缺失';
  else {
    const states = JSON.parse(candState);
    if (!states.includes('已入库') || !states.includes('已拒收')) out.aiLoop.parseCand = `X4 闭环失败：${candState}`;
  }
  /* X4b：AI 候选三步（填草稿 → 候选卡 → 拒收） */
  await goto('dash', '');
  const aiSteps = [];
  const btnAi = await cdp.eval(`(() => { const b = document.querySelector('#main [data-action="ai-draft"]'); if (!b) return false; b.click(); return true; })()`);
  aiSteps.push(btnAi ? 1 : 0);
  await sleep(70);
  out.postMessagePrefix = await cdp.eval(`(window.__melMsgs || []).find((x) => x.includes('agent-draft')) || null`);
  const hasCand = await cdp.eval("!!document.querySelector('.agent-cand') && !!document.querySelector('.agent-cand [data-action=\"cand-ok\"]')");
  aiSteps.push(hasCand ? 1 : 0);
  const rejected = await cdp.eval(`(() => { const b = document.querySelector('.agent-cand [data-action="cand-reject"]'); if (!b) return false; b.click(); return true; })()`);
  aiSteps.push(rejected ? 1 : 0);
  await sleep(60);
  const candGone = await cdp.eval("!document.querySelector('.agent-cand')");
  aiSteps.push(candGone ? 1 : 0);
  out.aiLoop.aiCandidate = aiSteps.join('');
  if (aiSteps.join('') !== '1111') out.aiLoop.aiCandidateErr = `X4 AI 候选闭环步序 ${aiSteps.join('')} ≠ 1111`;
  if (out.postMessagePrefix !== 'mel:agent-draft') out.aiLoop.postMessageErr = `postMessage 前缀 ${out.postMessagePrefix} ≠ mel:agent-draft`;

  /* ── AI 面板宽度态 + 展开态截图 ── */
  const w0 = await cdp.eval("getComputedStyle(document.documentElement).getPropertyValue('--agent-w').trim()");
  await cdp.eval(`(() => { const b = document.querySelector('#main [data-action="ai-draft"]'); if (b) b.click(); })()`);
  await sleep(60);
  await cdp.eval("(function(){const sp=document.getElementById('agent-splitter'); sp.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));})()");
  await sleep(50);
  const wHome = await cdp.eval("getComputedStyle(document.documentElement).getPropertyValue('--agent-w').trim()");
  await cdp.eval("(function(){const sp=document.getElementById('agent-splitter'); sp.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));})()");
  await sleep(50);
  const wEnd = await cdp.eval("getComputedStyle(document.documentElement).getPropertyValue('--agent-w').trim()");
  const valNow = await cdp.eval("document.getElementById('agent-splitter').getAttribute('aria-valuenow')");
  out.agent = { default: w0, home: wHome, end: wEnd, ariaValuenow: valNow };
  if (wHome !== '45%' || wEnd !== '25%') out.agent.err = `X-面板 宽度态异常 ${wHome}/${wEnd}`;
  await shot('dash-agent-demo1');
  await cdp.eval(`(() => { document.getElementById('agent-hide').click(); })()`);
  await sleep(45);

  /* ── 指标卡翻转 ── */
  await goto('dash', '');
  const flip = await cdp.eval(`(() => {
    const card = document.querySelector('#main .mcard');
    if (!card) return null;
    const code = card.dataset.code;
    const before = card.getAttribute('aria-pressed');
    card.click();
    return JSON.stringify({ code, before, after: card.getAttribute('aria-pressed') });
  })()`);
  if (flip) out.flip = JSON.parse(flip); else out.flip.err = '看板无可翻转指标卡';

  /* ── 一图秀：数值线连线 / 分类节点不连线 / computed fill = none ── */
  await goto('chart', '');
  const chart1 = await cdp.eval(`(() => {
    const svg = document.querySelector('#main .chart-wrap svg');
    if (!svg) return null;
    const line = svg.querySelector('path.line');
    const cs = line ? getComputedStyle(line) : null;
    return JSON.stringify({ paths: svg.querySelectorAll('path.line').length, dots: svg.querySelectorAll('circle.pt').length, nodes: svg.querySelectorAll('rect').length, computedFill: cs ? cs.fill : null, hasWatermark: svg.textContent.includes('不代表不同指标数值可比') });
  })()`);
  const catCheck = await cdp.eval(`(() => {
    const sel = state.sel[state.profileId];
    const hasCat = sel.includes('LESION_EVENT') || sel.includes('IRAE_SKIN');
    const svg = document.querySelector('#main .chart-wrap svg');
    return JSON.stringify({ catSelected: hasCat, paths: svg ? svg.querySelectorAll('path.line').length : -1, nodeCount: svg ? svg.querySelectorAll('rect').length : -1 });
  })()`);
  out.chart = { overview: JSON.parse(chart1 || 'null'), catCheck: JSON.parse(catCheck || 'null') };
  if (!out.chart.overview) out.chart.err = '一图秀 SVG 缺失';
  else {
    if (out.chart.overview.computedFill !== 'none') out.chart.err = `.chart .line computed fill=${out.chart.overview.computedFill}（应为 none）`;
    if (out.chart.overview.paths === 0) out.chart.err = '一图秀数值线缺失';
    if (out.chart.overview.nodes < 1) out.chart.err = '一图秀分类节点缺失';
  }

  /* ── 档案切换换源 ── */
  await goto('dash', '');
  const name1 = await cdp.eval("document.getElementById('profile-name').textContent");
  await cdp.eval(`(() => { document.getElementById('profile-btn').click(); })()`);
  await sleep(55);
  const pick2 = await cdp.eval(`(() => { const b = document.querySelector('.profile-row[data-id="demo2"]'); if (!b) return false; b.click(); return true; })()`);
  await sleep(70);
  const name2 = await cdp.eval("document.getElementById('profile-name').textContent");
  out.profileSwitch = { before: name1, after: name2, ok: pick2 && name1 !== name2 };
  if (!out.profileSwitch.ok) out.profileSwitch.err = '档案切换失败';
  await goto('dash', '');

  /* ── 必现句断言（逐页） ── */
  for (const [loc, phrase] of REQUIRED) {
    const [pg, sb] = loc.split('/');
    await goto(pg, sb);
    const t = await textScan();
    if (!t.includes(phrase)) out.required.push(`必现句缺失 ${loc}: 「${phrase}」`);
  }
  await goto('dash', '');
} catch (error) {
  out.fatal = String(error?.stack ?? error);
} finally {
  await stopChrome(ch);
}

out.consoleErrors = errors.length;
out.networkFailures = badResponses.length;
const ok = !out.fatal && out.consoleErrors === 0 && out.networkFailures === 0
  && out.overflow.length === 0 && out.ariaMismatch.length === 0 && out.forbidden.length === 0
  && out.required.length === 0 && out.scenePaths.length === 0 && out.editEntries.length === 0
  && out.tabs === 64 && out.navButtons === 10 && out.orphanPages && JSON.parse(out.orphanPages).subs === 30 && JSON.parse(out.orphanPages).missing.length === 0
  && !out.chart.err && !out.agent.err && !out.aiLoop.aiCandidateErr && !out.aiLoop.postMessageErr
  && out.profileSwitch.ok;
console.log(JSON.stringify({
  ok,
  summary: { tabs: out.tabs, screenshots: out.screenshots, stepJumps: out.stepJumps, navButtons: out.navButtons, subpages: out.orphanPages ? JSON.parse(out.orphanPages).subs : 0, orphanPages: out.orphanPages ? JSON.parse(out.orphanPages).missing : [], maxFormFields: out.maxFormFields, consoleErrors: out.consoleErrors, networkFailures: out.networkFailures, computedFill: out.chart?.overview?.computedFill, postMessage: out.postMessagePrefix },
  issues: { overflow: out.overflow, ariaMismatch: out.ariaMismatch, forbidden: out.forbidden, required: out.required, scenePaths: out.scenePaths, editEntries: out.editEntries, aiLoop: out.aiLoop, flip: out.flip, chart: out.chart, agent: out.agent, profileSwitch: out.profileSwitch, fatal: out.fatal ?? null }
}, null, 2));
process.exit(ok ? 0 : 1);
