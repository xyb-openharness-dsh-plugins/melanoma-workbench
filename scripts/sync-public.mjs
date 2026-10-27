#!/usr/bin/env node
/**
 * 原型 → 开发版（public/）的整文件同步清单。
 *
 * 为什么只同步这三件：public/app.js 与 public/style.css 是「定点替换后的手工副本」
 * （数据/AI 五态/宽度/版本/启动五处），由 test/ui-parity.test.mjs 逐字符比对兜住，不能整文件覆盖。
 * 疾病概要三件套（primer.js / primer.css / primer-data.js）在开发版里没有任何替换点，
 * 整文件复制才能保证两份同源——否则原型能用、用户装到的版本没有这个功能。
 *
 * 用法：
 *   node scripts/sync-public.mjs           写入 public/
 *   node scripts/sync-public.mjs --check   只校验（不一致或 index.html 未引用时退出 1）
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'prototypes/v0.2')
const DEST = join(ROOT, 'public')
const FILES = ['primer.js', 'primer.css', 'primer-data.js']
const checkOnly = process.argv.includes('--check')

const problems = []
for (const name of FILES) {
  const from = join(SRC, name)
  const to = join(DEST, name)
  if (!existsSync(from)) { problems.push(`原型缺文件：prototypes/v0.2/${name}`); continue }
  const body = readFileSync(from, 'utf8')
  if (checkOnly) {
    if (!existsSync(to)) problems.push(`public/${name} 缺失（运行 node scripts/sync-public.mjs）`)
    else if (readFileSync(to, 'utf8') !== body) problems.push(`public/${name} 与原型不一致`)
  } else if (!existsSync(to) || readFileSync(to, 'utf8') !== body) {
    writeFileSync(to, body)
    console.log(`→ public/${name}`)
  }
}

/* index.html 必须真的引用这三件，否则文件在、功能不在（剩余风险：漏 script 标签） */
const index = join(DEST, 'index.html')
if (!existsSync(index)) problems.push('public/index.html 缺失')
else {
  const html = readFileSync(index, 'utf8')
  for (const ref of ['primer.css', 'primer-data.js', 'primer.js']) {
    if (!html.includes(ref)) problems.push(`public/index.html 未引用 ${ref}`)
  }
  const iData = html.indexOf('primer-data.js')
  const iModule = html.indexOf('primer.js')
  if (iData >= 0 && iModule >= 0 && iData > iModule) problems.push('public/index.html 中 primer-data.js 必须在 primer.js 之前加载')
}

if (problems.length) {
  console.error('✗ 开发版疾病概要三件套未就绪：')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(checkOnly ? '✓ public/ 疾病概要三件套与原型一致（含 index.html 引用与加载顺序）' : '✓ 已同步 public/ 疾病概要三件套')
