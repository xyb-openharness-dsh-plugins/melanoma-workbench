#!/usr/bin/env node
/**
 * HVT 交互路径一致性 X1–X4（15-HVT-REVIEW §X；基准=docs/INTERACTION-DESIGN.md v1.1）。
 *
 * X1 页面覆盖：13 场景 landing ∪ 页内 data-step 目标 = 10 线 30 页签（孤儿=0）。
 * X2 路径走通：从看板逐 chip → 落地页渲染非空 → 页内 data-step 逐站导航 → 回看板一步；两档案各一遍。
 * X3 编辑入口 ≤1/页：每 (view,sub) 里同时出现的显式编辑动作 ≤1。
 * X4 AI 候选闭环：ai-draft → 候选卡三步（确认/修改/拒收）→ 拒收后候选消失；10 条一级线都有 AI 协助。
 *
 * 用法：node scripts/check-hvt.mjs；退出码 0/1。依赖本机 Chrome。
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome, stopChrome, sleep } from './cdp.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CDP_PORT = Number(process.env.MEL_HVT_CDP_PORT || 9360);
const URL_APP = `file://${join(ROOT, 'prototypes', 'v0.2', 'index.html')}`;
const SOURCE = readFileSync(join(ROOT, 'prototypes/v0.2/app.js'), 'utf8');

/* 13 场景（与 app.js SCENES 同源；步骤用 DOM 里真实存在的 data-step 目标） */
const SCENES = [...SOURCE.matchAll(/\['(S\d\d)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g)]
  .map((m) => ({ id: m[1], landing: `${m[3]}/${m[4]}` }));

const ALL_SUBS = [
  ['self', 'map'], ['self', 'lesion'], ['self', 'timeline'], ['self', 'acral'], ['self', 'abcde'],
  ['stage', 'pathology'], ['stage', 'slnb'], ['stage', 'record'], ['stage', 'molecular'],
  ['treatment', 'pathway'], ['treatment', 'surgery'], ['treatment', 'systemic'],
  ['irae', 'tracks'], ['irae', 'rash'], ['irae', 'redline'],
  ['followup', 'calendar'], ['followup', 'skin'], ['followup', 'imaging'], ['followup', 'privacy'],
  ['care', 'intake'], ['care', 'sun'], ['care', 'fatigue'],
  ['mind', 'feelings'], ['mind', 'body'], ['mind', 'intimacy'], ['mind', 'genetic'],
  ['docs', 'library'], ['docs', 'candidates'], ['docs', 'prepare'], ['docs', 'trials'],
];
const FORM_ACTIONS = ['lesion-add', 'cycle-add', 'rash-add', 'skin-add', 'imaging-add', 'sun-add',
  'intake-add', 'fatigue-add', 'fcr-add', 'body-add', 'doc-add', 'q-add', 'manual-edit'];

/* X1 静态覆盖：landing ∪ 所有 data-page/data-sub 链接 */
const covered = new Set(SCENES.map((s) => s.landing));
for (const m of SOURCE.matchAll(/data-page="([a-z]+)"\s+data-sub="([a-z]+)"/g)) covered.add(`${m[1]}/${m[2]}`);
const orphans = ALL_SUBS.map(([p, s]) => `${p}/${s}`).filter((k) => !covered.has(k));
const out = { X1: { total: ALL_SUBS.length, covered: covered.size, orphans: orphans.length, orphanList: orphans }, X2: { walked: 0, failures: [] }, X3: { views: 0, over: [], max: 0 }, X4: { pages: 0, failures: [] } };

const ch = await launchChrome({ port: CDP_PORT });
const { cdp } = ch;
try {
  await cdp.send('Page.navigate', { url: URL_APP });
  await sleep(500);
  for (let i = 0; i < 60 && !(await cdp.eval("document.body.getAttribute('data-booted') === '1'")); i += 1) await sleep(150);

  /* ── X2：两档案 × 13 场景 ── */
  for (const pid of ['demo1', 'demo2']) {
    for (const s of SCENES) {
      await cdp.eval(`(() => { state.profileId=${JSON.stringify(pid)}; state.page='dash'; state.sub={}; render(); })()`);
      await sleep(60);
      const clicked = await cdp.eval(`(() => { const b = document.querySelector('.scene-chip[data-scene="${s.id}"]'); if (!b) return null; b.click(); return true; })()`);
      if (!clicked) { out.X2.failures.push(`${pid}/${s.id}: 看板无 chip`); continue; }
      await sleep(60);
      const cur = await cdp.eval("state.page + '/' + (state.sub[state.page] || '')");
      if (cur !== s.landing) { out.X2.failures.push(`${pid}/${s.id}: 落地=${cur} 期望=${s.landing}`); continue; }
      const textLen = await cdp.eval("document.getElementById('main').innerText.trim().length");
      if (textLen < 30) { out.X2.failures.push(`${pid}/${s.id}: 落地页内容过少`); continue; }
      /* 页内 data-step：逐个点，校验落点；每点一次后回到落地页继续 */
      const steps = await cdp.eval(`[...document.querySelectorAll('#main [data-step]')].map((e) => ({ step: e.dataset.step, page: e.dataset.page, sub: e.dataset.sub }))`);
      for (const st of steps) {
        const ok = await cdp.eval(`(() => { const el = document.querySelector('#main [data-step="${st.step}"]'); if (!el) return false; el.click(); return true; })()`);
        if (!ok) { out.X2.failures.push(`${pid}/${s.id}/${st.step}: 点不到`); continue; }
        await sleep(40);
        const after = await cdp.eval("state.page + '/' + (state.sub[state.page] || '')");
        if (after !== `${st.page}/${st.sub}`) out.X2.failures.push(`${pid}/${s.id}/${st.step}: 落点=${after} 期望=${st.page}/${st.sub}`);
        await cdp.eval(`(() => { const [p, x] = ${JSON.stringify(s.landing)}.split('/'); state.page=p; state.sub[p]=x; render(); })()`);
        await sleep(40);
      }
      const back = await cdp.eval(`(() => { const b = document.querySelector('#main .back-row [data-action="go"]'); if (!b) return false; b.click(); return state.page === 'dash'; })()`);
      if (!back) out.X2.failures.push(`${pid}/${s.id}: 回看板失败`);
      out.X2.walked += 1;
    }
  }

  /* ── X3：每 (view,sub) 显式编辑入口 ≤1 ── */
  for (const [page, sub] of ALL_SUBS) {
    await cdp.eval(`(() => { state.page=${JSON.stringify(page)}; state.sub[${JSON.stringify(page)}]=${JSON.stringify(sub)}; render(); })()`);
    await sleep(40);
    const n = await cdp.eval(`[...document.querySelectorAll('#main [data-action]')].filter((e) => ${JSON.stringify(FORM_ACTIONS)}.includes(e.dataset.action)).length`);
    out.X3.views += 1;
    out.X3.max = Math.max(out.X3.max, n);
    if (n > 1) out.X3.over.push(`${page}/${sub}=${n}`);
  }

  /* ── X4：10 条一级线 AI 候选三步 ── */
  for (const page of ['dash', 'self', 'stage', 'treatment', 'irae', 'followup', 'chart', 'care', 'mind', 'docs']) {
    await cdp.eval(`(() => { state.page=${JSON.stringify(page)}; state.sub={}; render(); })()`);
    await sleep(40);
    const btn = await cdp.eval("!!document.querySelector('#main [data-action=\"ai-draft\"]')");
    if (!btn) { out.X4.failures.push(`${page}: 无 AI 协助入口`); continue; }
    await cdp.eval("document.querySelector('#main [data-action=\"ai-draft\"]').click()");
    await sleep(50);
    const three = await cdp.eval("['cand-ok','cand-fix','cand-reject'].every((a) => document.querySelector(`[data-action=\"${a}\"]`))");
    if (!three) out.X4.failures.push(`${page}: 候选三步不全`);
    await cdp.eval("document.querySelector('[data-action=\"cand-reject\"]').click()");
    await sleep(40);
    const gone = await cdp.eval("!document.querySelector('[data-action=\"cand-ok\"]')");
    if (!gone) out.X4.failures.push(`${page}: 拒收后候选未消失`);
    out.X4.pages += 1;
  }
} finally {
  stopChrome(ch);
}

const ok = out.X1.orphans === 0 && out.X2.failures.length === 0 && out.X3.over.length === 0 && out.X4.failures.length === 0;
console.log(`X1 覆盖 ${out.X1.covered}/${out.X1.total} 页签 · 孤儿 ${out.X1.orphans}${out.X1.orphanList.length ? ' → ' + out.X1.orphanList.join(',') : ''}`);
console.log(`X2 路径 ${out.X2.walked}/26 走通 · 失败 ${out.X2.failures.length}${out.X2.failures.length ? ' → ' + out.X2.failures.slice(0, 5).join(' | ') : ''}`);
console.log(`X3 视图 ${out.X3.views} · 编辑入口最大 ${out.X3.max}（≤1）· 违规 ${out.X3.over.length}`);
console.log(`X4 AI 闭环 ${out.X4.pages}/10 · 失败 ${out.X4.failures.length}${out.X4.failures.length ? ' → ' + out.X4.failures.join(' | ') : ''}`);
if (!ok) process.exit(1);
