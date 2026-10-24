#!/usr/bin/env node
/**
 * 装机验收探针（M6 三层验收的「加载层 + 交互层」）。
 *
 * 为什么要单独一个探针，而不是「装上、让用户点一下」：
 * 装进 Desktop 后才暴露的故障，家族里已经踩过四轮（包头缺 `dsh` 块 → 404；patch 缺
 * `config.root` → 重启回内存库；客户端占位 → 业务区空白；`API_BASE` 守卫写错 → 全白）。
 * 这些的共同点是**开发版能跑、装机副本不能跑**——因为开发版从来不经过 `node_modules`
 * 里的那一份，也不经过宿主的 `webServer.register` 前缀挂载。所以这个探针只做一件事：
 * **把装机副本从 `node_modules` 里加载起来，喂给它一个假宿主**，再让真 Chrome 走一遍。
 *
 * 假宿主只实现 `apply()` 真正用到的四个面（见 dsh/index.js）：
 *   ctx.webServer.register({ kind, path, handler })  → 接住 handler
 *   ctx.connection.requestRejection(req)            → 默认放行；PROBE_AUTH=401 时拦
 *   ctx.effect(fn, label)                           → 立即执行（真宿主是随 ctx 生命周期）
 *   Config                                          → 宿主侧才用，这里只断言导出存在
 *
 * `@deepseek-ai/schemastery` 是**宿主注入的 peer**（profile 的 node_modules 里故意没有），
 * 所以这里用 `module.registerHooks` 把它指到一个最小 shim；除此之外一行不放宽——
 * shim 只覆盖 `apply()` 不碰的部分，`Config` 的形状另有断言。
 *
 * 用法：
 *   node scripts/probe-install.mjs                     # 默认查 harness/profiles/web 里装的那份
 *   MEL_PKG=/path/to/node_modules/@xyb-community/melanoma-workbench node scripts/probe-install.mjs
 *   MEL_NO_CHROME=1 node scripts/probe-install.mjs    # 只跑配置/加载/接口，不起浏览器
 * 退出码 0/1。依赖本机 Chrome（可用 MEL_CDP_PORT 换端口）。
 */
import { createServer } from 'node:http'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SHOTS = join(ROOT, 'docs', 'screenshots')
const PAGES = (process.env.MEL_RESP_PAGES
  || 'dash,self,stage,treatment,irae,followup,chart,care,mind,docs').split(',')

const DEFAULT_PKG = join(
  homedir(),
  'Library/Application Support/dsh-desktop/harness/profiles/web/node_modules/@xyb-community/melanoma-workbench',
)
const PKG = process.env.MEL_PKG || DEFAULT_PKG

/* 本文件是照 ATTR 的探针改的，里面还有不少属性、接口前缀、页面路由是 ATTR 的。
   指错包时的表现最坏：满屏红条却全是假失败（2026-10-24 实测：探针曾默认指到别的包，
   于是 20 条断言连 404 都算进去）。所以先卡一道身份闸——指错了就直接说明白，
   不给一份看起来"很严重"的假报告。适配清单见 docs/PROGRESS-REPORT-PROMPT.md 的 M9 挂账。 */
try {
  const pkgJson = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'))
  if (pkgJson.name !== '@xyb-community/melanoma-workbench') {
    console.error(`✗ 探针指向了别的包：${pkgJson.name || '（无 name）'}\n  PKG=${PKG}\n  → 本探针尚未完全适配本包，不能拿它当装机验收结论。`)
    process.exit(1)
  }
} catch (error) {
  console.error(`✗ 读不到装机副本：${PKG}（${error.code || error.message}）`)
  process.exit(1)
}

const checks = []
const fails = []
const check = (layer, name, ok, detail) => {
  checks.push({ layer, name, ok: Boolean(ok), detail })
  if (!ok) fails.push(`[${layer}] ${name}${detail ? ` — ${detail}` : ''}`)
}

/* ---------------------------------------------------------------- 假宿主前置 */

/* schemastery shim：链式 no-op，够让 `Schema.object({...})` 求值不炸。
   真宿主会给真的实现；这里只需要证明「这一行 import 不是装机失败的根因」。 */
const shimDir = mkdtempSync(join(homedir(), '.xyb-mel-shim-'))
const shimFile = join(shimDir, 'schemastery.mjs')
writeFileSync(shimFile, `
const chain = () => { const o = {}; for (const k of ['required', 'optional', 'default', 'description', 'min', 'max']) o[k] = () => o; return o }
const make = () => chain()
export default {
  object: (shape) => ({ __schema: 'object', shape }),
  string: make, number: make, boolean: make, array: make, dict: make, union: make, const: make, any: make,
}
export const Schema = { object: (s) => ({ __schema: 'object', shape: s }) }
`)
registerHooks({
  resolve(spec, context, next) {
    if (spec === '@deepseek-ai/schemastery') {
      return { url: pathToFileURL(shimFile).href, shortCircuit: true, format: 'module' }
    }
    return next(spec, context)
  },
})

/* ------------------------------------------------------------------ L0 包元数据 */

const pkgJsonPath = join(PKG, 'package.json')
const pkgExists = existsSync(pkgJsonPath)
check('L0 包', '装机副本存在', pkgExists, pkgExists ? PKG : `未找到 ${PKG}`)
let pkg = {}
let version = null
if (pkgExists) {
  pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
  version = pkg.version
  const repoVersion = readFileSync(join(ROOT, 'VERSION'), 'utf8').trim()
  check('L0 包', `version = 仓库 VERSION（${repoVersion}）`, pkg.version === repoVersion, `装机副本 ${pkg.version}`)
  check('L0 包', 'dsh.client.platform = web', pkg.dsh?.client?.platform === 'web', String(pkg.dsh?.client?.platform))
  check('L0 包', 'dsh.bundle.patch 指向 cordis.patch.yml', pkg.dsh?.bundle?.patch === './cordis.patch.yml', String(pkg.dsh?.bundle?.patch))

  const patchPath = join(PKG, 'cordis.patch.yml')
  const patch = existsSync(patchPath) ? readFileSync(patchPath, 'utf8') : ''
  check('L0 包', 'patch 有 config.root（缺了=重启回内存库）', /root:\s*!!js\s+dshHomePath\('melanoma-workbench'\)/.test(patch), patch.split('\n')[3])
  check('L0 包', 'patch 的 name 是 npm 包名', /name:\s*"@xyb-community\/melanoma-workbench"/.test(patch))
  for (const f of ['dsh/index.js', 'dsh/server.js', 'public/app.js', 'public/index.html', 'public/shell.css', 'schema/0001_initial.sql']) {
    check('L0 包', `解包完整 ${f}`, existsSync(join(PKG, f)))
  }
}

/* ---------------------------------------------------------------- L1 模块图/导出 */

let mod = null
try {
  mod = await import(pathToFileURL(join(PKG, 'dsh/index.js')).href)
  check('L1 加载', 'import 装机副本 dsh/index.js', true)
  check('L1 加载', '导出 name/inject/Config/apply 四样',
    typeof mod.name === 'string' && Array.isArray(mod.inject) && mod.Config && typeof mod.apply === 'function',
    `name=${mod.name} inject=${JSON.stringify(mod.inject)}`)
  check('L1 加载', 'name = melanoma-workbench-main（与 patch 的 id 同值）', mod.name === 'melanoma-workbench-main', String(mod.name))
  check('L1 加载', 'inject 含 webServer + connection',
    mod.inject.includes('webServer') && mod.inject.includes('connection'))
  check('L1 加载', 'Config 覆盖 root', Boolean(mod.Config?.shape?.root), 'Config 是 Schemastery schema')
} catch (error) {
  check('L1 加载', 'import 装机副本 dsh/index.js', false, error?.message)
}

/* root 不传时当前实现退回内存演示库（与 THY 样板一致：装上去先能看见东西）。
   这里把这条行为明确记录下来；真正的数据落点由下面的 L2 断言（config.root → 磁盘库）负责。 */
if (mod?.apply) {
  let h0 = null
  try {
    mod.apply({
      webServer: { register: (o) => { h0 = o.handler; return () => {} } },
      connection: { requestRejection: () => undefined },
      effect: (fn) => fn(),
    }, {})
    check('L1 加载', '缺 config.root 时仍可启动（内存演示库；装机由 patch 强制给 root）', Boolean(h0))
  } catch (error) {
    check('L1 加载', '缺 config.root 时仍可启动（内存演示库；装机由 patch 强制给 root）', false, error?.message)
  }
}

/* ------------------------------------------------------ L2 apply + 路由 + 真实落库 */

const dataDir = mkdtempSync(join(homedir(), '.xyb-mel-install-'))
let handler = null
let mountPath = null
const registered = []
if (mod?.apply) {
  const ctx = {
    webServer: { register: (opts) => { registered.push(opts); handler = opts.handler; mountPath = opts.path; return () => {} } },
    connection: { requestRejection: () => (process.env.PROBE_AUTH ? Number(process.env.PROBE_AUTH) : undefined) },
    effect: (fn) => { fn() },
  }
  try {
    mod.apply(ctx, { root: dataDir })
    check('L2 接口', 'apply() 不抛异常', true)
  } catch (error) {
    check('L2 接口', 'apply() 不抛异常', false, error?.message)
  }
  check('L2 接口', '向宿主注册了 prefix 路由 /api/mel',
    registered.length === 1 && mountPath === '/api/mel', `registered=${registered.length} path=${mountPath}`)
  check('L2 接口', 'config.root 生效：真实库文件已建',
    existsSync(join(dataDir, 'xyb-mel.sqlite')), `${dataDir}/xyb-mel.sqlite`)
}

let server = null
let port = 0
if (handler) {
  server = createServer((req, res) => handler(req, res))
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  port = server.address().port
  const base = `http://127.0.0.1:${port}`
  const get = async (p, init) => {
    const res = await fetch(base + p, init)
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch { /* 非 JSON 正常 */ }
    return { status: res.status, json, text }
  }

  const health = await get('/api/mel/health')
  check('L2 接口', 'GET /api/mel/health = 200 ok', health.status === 200 && health.json?.ok === true, `status=${health.status} ${health.text.slice(0, 120)}`)
  check('L2 接口', 'health 报的版本与包一致', health.json?.version === version, `${health.json?.version} vs ${version}`)

  const boot = await get('/api/mel/bootstrap')
  const bootKeys = boot.json ? Object.keys(boot.json) : []
  check('L2 接口', 'GET /api/mel/bootstrap = 200', boot.status === 200, `status=${boot.status}`)
  check('L2 接口', 'bootstrap 六件齐全（version/build/meta/profiles/agent/layout）',
    ['version', 'build', 'meta', 'profiles', 'agent', 'layout'].every((k) => bootKeys.includes(k)),
    `keys=${bootKeys.join(',')}`)
  const profileKeys = (boot.json?.profiles || []).map((p) => p.id)
  check('L2 接口', '演示数据已种（两档案）', profileKeys.length >= 1, `profiles=${profileKeys.join(',')}`)

  const ui = await get('/api/mel/ui/')
  check('L2 接口', 'GET /api/mel/ui/ 返回页面（非 404）',
    ui.status === 200 && /<html/i.test(ui.text), `status=${ui.status} len=${ui.text.length}`)

  /* 导入一份本地 markdown（persist=1），确认候选真的落到 config.root 指的那只库。
     内存库也能 200，所以必须回读文件里的行数。 */
  const imp = await get('/api/mel/import?name=probe.md&profile=demo1&persist=1', {
    method: 'POST',
    headers: { 'content-type': 'text/markdown' },
    body: '# 装机探针\n\n| 项目 | 结果 | 单位 |\n| --- | --- | --- |\n| LDH | 210 | U/L |\n',
  })
  check('L2 接口', 'POST /api/mel/import（本地 md） = 200', imp.status === 200, `status=${imp.status} ${imp.text.slice(0, 140)}`)
  check('L2 接口', '导入产出 LDH 候选', (imp.json?.candidates || []).some((c) => c.key === 'LDH'), JSON.stringify(imp.json?.candidates || []).slice(0, 160))

  const dbFile = join(dataDir, 'xyb-mel.sqlite')
  let persisted = 0
  if (existsSync(dbFile)) {
    const { openDatabase } = await import(pathToFileURL(join(PKG, 'dsh/store.js')).href)
    const db = openDatabase(dbFile)
    try {
      persisted = db.prepare('SELECT COUNT(*) AS n FROM candidate').get()?.n ?? 0
    } catch (error) {
      check('L2 接口', '回读 candidate', false, error?.message)
    } finally {
      try { db.close() } catch { /* 关库失败不影响结论 */ }
    }
  }
  check('L2 接口', '写入落到磁盘库（不是内存库）', persisted >= 1, `candidate=${persisted}`)

  if (process.env.PROBE_AUTH) {
    const denied = await get('/api/mel/health')
    check('L2 接口', `宿主鉴权回了 ${process.env.PROBE_AUTH} 时原样透传`, denied.status === Number(process.env.PROBE_AUTH), `status=${denied.status}`)
  }
}

/* ------------------------------------------------------------ L3 交互层（真浏览器） */

let shots = []
if (handler && !process.env.MEL_NO_CHROME) {
  const { launchChrome, sleep, stopChrome } = await import('./cdp.mjs')
  mkdirSync(SHOTS, { recursive: true })
  const ch = await launchChrome({ port: Number(process.env.MEL_CDP_PORT || 9361) })
  const { cdp } = ch
  /* cdp.mjs 自己就在收：errors = 未捕获异常 + console.error，badResponses = 失败请求。 */
  try {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/api/mel/ui/` })
    for (let i = 0; i < 80 && !(await cdp.eval('Boolean(document.querySelector("#nav .nav-button"))')); i += 1) await sleep(120)

    /* ATTR 不设 data-booted（那是小星宝的写法）。这里的判据是**后端数据真的到了页面上**：
       顶栏版本 chip 由 bootstrap 的 version 回填，chip 有值 = 接口通了 + 前端跑起来了。 */
    const chip = String(await cdp.eval('(document.querySelector("#ver-chip")?.textContent || "").trim()'))
    check('L3 交互', `顶栏版本 chip = v${version}（bootstrap 回填成功）`, chip === `v${version}`, `chip="${chip}"`)
    const navCount = await cdp.eval('document.querySelectorAll("#nav .nav-button").length')
    check('L3 交互', `导航按钮数 = ${PAGES.length}`, navCount === PAGES.length, `实际 ${navCount}`)

    for (const page of PAGES) {
      const clicked = await cdp.eval(`(() => { const b = document.querySelector('#nav [data-page="${page}"]'); if (!b) return false; b.click(); return true })()`)
      if (!clicked) { check('L3 交互', `切到 ${page}`, false, '找不到导航按钮'); continue }
      await sleep(180)
      const info = await cdp.eval(`(() => {
        const m = document.querySelector('#main')
        return JSON.stringify({
          chars: (m?.innerText || '').replace(/\\s+/g, '').length,
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
        })
      })()`)
      const d = JSON.parse(info || '{}')
      check('L3 交互', `${page} 有内容且不横向溢出`,
        (d.chars || 0) > 80 && d.scrollW <= d.innerW + 1,
        `${d.chars} 字, scrollWidth=${d.scrollW}/${d.innerW}`)
    }

    if (PAGES.includes('dash')) {
      await cdp.eval('document.querySelector(\'#nav [data-page="dash"]\').click()')
      await sleep(250)
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
      const file = join(SHOTS, `install-${version}-dash.png`)
      writeFileSync(file, Buffer.from(shot.data, 'base64'))
      shots.push(file)
      check('L3 交互', '截图已存', true, file)
    }

    check('L3 交互', '控制台 0 个未捕获异常 / console.error', cdp.errors.length === 0, cdp.errors.slice(0, 3).join(' | '))
    check('L3 交互', '0 个失败请求', cdp.badResponses.length === 0, cdp.badResponses.slice(0, 3).join(' | '))
  } catch (error) {
    check('L3 交互', '浏览器探针执行', false, error?.message)
  } finally {
    await stopChrome(ch)
  }
}

server?.close()
try { server?.closeAllConnections?.() } catch { /* 老 Node 没有这个 */ }

const summary = {
  ok: fails.length === 0,
  pkg: PKG,
  version,
  dataDir,
  checks: checks.length,
  passed: checks.filter((c) => c.ok).length,
  fails,
  shots,
}
console.log(JSON.stringify(summary, null, 2))
if (fails.length) console.log('\n逐项：\n' + checks.map((c) => `${c.ok ? '✅' : '❌'} [${c.layer}] ${c.name}${c.detail ? ` — ${c.detail}` : ''}`).join('\n'))
process.exit(fails.length === 0 ? 0 : 1)
