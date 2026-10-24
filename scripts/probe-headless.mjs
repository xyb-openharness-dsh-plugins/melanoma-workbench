#!/usr/bin/env node
/**
 * 开发版无头实测（M5 验收：必须出数字，不口头说"没问题"）。
 *
 * 与 probe-proto.mjs（原型 file://）的区别：这里起 dev-server（干净临时目录），走
 * `http://127.0.0.1:<port>/api/mel/ui/index.html`，验证"真数据源 + 真路由"下的同一套视图。
 *
 * 数字：10 一级 ×（2 无二级 + 30 二级）× 2 档案 = 64 页签；aria-selected 与内容指纹；
 * 每页 scrollWidth vs innerWidth；console error / 网络 4xx；AI 面板 35/45/25/收起；
 * 一图秀 computed fill=none；版本首屏；数据源必须是 api（不是离线回退）。
 *
 * 用法：node scripts/probe-headless.mjs；退出码 0/1。依赖本机 Chrome。
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome, stopChrome, sleep } from './cdp.mjs';
import { Workbench } from '../dsh/workbench.js';
import { startWorkbenchServer } from '../dsh/server.js';
import { version as VERSION } from '../lib/version.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CDP_PORT = Number(process.env.MEL_DEV_CDP_PORT || 9356);

const VIEW_SUBS = [
  ['dash', ''], ['chart', ''],
  ['self', 'map'], ['self', 'lesion'], ['self', 'timeline'], ['self', 'acral'], ['self', 'abcde'],
  ['stage', 'pathology'], ['stage', 'slnb'], ['stage', 'record'], ['stage', 'molecular'],
  ['treatment', 'pathway'], ['treatment', 'surgery'], ['treatment', 'systemic'],
  ['irae', 'tracks'], ['irae', 'rash'], ['irae', 'redline'],
  ['followup', 'calendar'], ['followup', 'skin'], ['followup', 'imaging'], ['followup', 'privacy'],
  ['care', 'intake'], ['care', 'sun'], ['care', 'fatigue'],
  ['mind', 'feelings'], ['mind', 'body'], ['mind', 'intimacy'], ['mind', 'genetic'],
  ['docs', 'library'], ['docs', 'candidates'], ['docs', 'prepare'], ['docs', 'trials'],
];

const tmp = mkdtempSync(join(homedir(), '.xyb-mel-dev-'));
const workbench = await Workbench.open(join(tmp, 'workspace'));
const started = await startWorkbenchServer({ port: 0, host: '127.0.0.1', workbench });
const URL_APP = `${started.url}api/mel/ui/index.html`;

const ch = await launchChrome({ port: CDP_PORT });
const { cdp } = ch;
const out = { tabs: 0, overflow: [], ariaMismatch: [], dup: [], agent: {}, chart: {}, version: {}, errors: [], dataSource: 'unknown' };

try {
  await cdp.send('Page.navigate', { url: URL_APP });
  await sleep(500);
  let booted = false;
  for (let i = 0; i < 60; i += 1) { booted = await cdp.eval("document.body.getAttribute('data-booted') === '1'"); if (booted) break; await sleep(200); }
  if (!booted) out.errors.push('页面 12 秒内没有完成启动（data-booted）');

  out.dataSource = await cdp.eval("typeof state !== 'undefined' ? state.dataSource : 'unknown'");
  if (out.dataSource !== 'api') out.errors.push(`数据源=${out.dataSource}（应为 api）`);

  for (const pid of ['demo1', 'demo2']) {
    for (const [page, sub] of VIEW_SUBS) {
      await cdp.eval(`(() => { state.profileId=${JSON.stringify(pid)}; state.pin=null; state.flipped=new Set(); state.page=${JSON.stringify(page)}; state.sub[${JSON.stringify(page)}]=${JSON.stringify(sub)}; render(); })()`);
      await sleep(35);
      const info = JSON.parse(await cdp.eval(`(() => {
        const m = document.getElementById('main');
        const sub = ${JSON.stringify(sub)};
        const btn = sub ? document.querySelector('.subnav button[data-sub="' + sub + '"]') : null;
        return JSON.stringify({ len: m.innerText.trim().length, aria: btn ? btn.getAttribute('aria-selected') : null, stateSub: state.sub[${JSON.stringify(page)}] || '', fp: (m.innerHTML || '').replace(/\\s+/g, '').slice(0, 160), over: document.body.scrollWidth - window.innerWidth });
      })()`));
      out.tabs += 1;
      if (info.len < 20) out.errors.push(`${pid}/${page}/${sub || '(本页)'}: 内容过少`);
      if (sub && (info.aria !== 'true' || info.stateSub !== sub)) out.ariaMismatch.push(`${pid}/${page}/${sub}: aria=${info.aria} state=${info.stateSub}`);
      if (info.over > 1) out.overflow.push(`${pid}/${page}/${sub || '(本页)'}(+${info.over}px)`);
      out.dup.push(`${pid}:${page}/${sub}:${info.fp}`);
    }
  }

  /* AI 面板：默认 35 / Home 45 / End 25 / 收起 */
  await cdp.eval(`(() => { state.profileId='demo1'; state.page='dash'; state.sub={}; render(); })()`);
  await sleep(60);
  await cdp.eval("document.querySelector('#agent-toggle').click()");
  await sleep(60);
  const readW = async () => Number(await cdp.eval("getComputedStyle(document.documentElement).getPropertyValue('--agent-w').replace('%','')"));
  out.agent.default = await readW();
  await cdp.eval("document.querySelector('#agent-splitter').dispatchEvent(new KeyboardEvent('keydown', {key:'Home', bubbles:true}))");
  await sleep(40);
  out.agent.home = await readW();
  await cdp.eval("document.querySelector('#agent-splitter').dispatchEvent(new KeyboardEvent('keydown', {key:'End', bubbles:true}))");
  await sleep(40);
  out.agent.end = await readW();
  await cdp.eval("document.querySelector('#agent-toggle').click()");
  await sleep(40);
  out.agent.closedHidden = await cdp.eval("document.querySelector('#agent-pane').hidden && document.querySelector('#agent-splitter').hidden");
  out.agent.label = await cdp.eval("document.querySelector('#agent-toggle').textContent");

  /* 一图秀：computed fill must be none */
  await cdp.eval(`(() => { state.page='chart'; state.sub={}; render(); })()`);
  await sleep(60);
  out.chart = JSON.parse(await cdp.eval(`(() => {
    const lines = [...document.querySelectorAll('.chart .line')];
    const fills = [...new Set(lines.map((l) => getComputedStyle(l).fill))];
    return JSON.stringify({ lines: lines.length, fills, paths: document.querySelectorAll('.chart path').length, dots: document.querySelectorAll('.chart circle').length });
  })()`));

  out.version = JSON.parse(await cdp.eval(`JSON.stringify({ chip: document.querySelector('#ver-chip').textContent, footer: document.querySelector('#app-version').textContent, expected: 'v${VERSION}' })`));
  if (out.version.chip !== `v${VERSION}` || out.version.footer !== `v${VERSION}`) out.errors.push('版本首屏不一致');

  const consoleErrors = cdp.errors ? cdp.errors.length : 0;
  const badResponses = cdp.badResponses ? cdp.badResponses.length : 0;
  out.consoleErrors = consoleErrors;
  out.badResponses = badResponses;
} finally {
  stopChrome(ch);
  started.server.close();
  workbench.close();
  rmSync(tmp, { recursive: true, force: true });
}

const fillOk = Array.isArray(out.chart.fills) && out.chart.fills.length === 1 && out.chart.fills[0] === 'none';
const ok = out.errors.length === 0 && out.overflow.length === 0 && out.ariaMismatch.length === 0
  && out.agent.default === 35 && out.agent.home === 45 && out.agent.end === 25 && out.agent.closedHidden
  && fillOk && out.consoleErrors === 0 && out.badResponses === 0 && new Set(out.dup).size === out.dup.length;

console.log(`页签 ${out.tabs}/64 · 溢出 ${out.overflow.length} · aria 不符 ${out.ariaMismatch.length} · 内容指纹重复 ${out.dup.length - new Set(out.dup).size}`);
console.log(`AI 面板 默认 ${out.agent.default}% / Home ${out.agent.home}% / End ${out.agent.end}% / 收起 ${out.agent.closedHidden} · 按钮「${out.agent.label}」`);
console.log(`一图秀 lines=${out.chart.lines} paths=${out.chart.paths} dots=${out.chart.dots} computed fill=${JSON.stringify(out.chart.fills)}`);
console.log(`版本 ${out.version.chip}/${out.version.footer}（期望 ${out.version.expected}）· console error ${out.consoleErrors} · 4xx/失败请求 ${out.badResponses}`);
console.log(`数据源 ${out.dataSource} · 失败项 ${out.errors.length}${out.errors.length ? ' → ' + out.errors.slice(0, 4).join(' | ') : ''}`);
if (!ok) {
  if (out.overflow.length) console.log('溢出：' + out.overflow.slice(0, 8).join(', '));
  if (out.ariaMismatch.length) console.log('aria：' + out.ariaMismatch.slice(0, 8).join(', '));
  process.exit(1);
}
