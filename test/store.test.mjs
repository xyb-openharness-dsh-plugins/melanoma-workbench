/* 数据层单测：迁移幂等 / 播种幂等 / readmodels parity / schema 冻结 30 表 / 事实可回读。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../dsh/store.js';
import { seedDemo, hasDemoData } from '../dsh/demo.js';
import { bootstrap, getProfile } from '../dsh/readmodels.js';
import { buildDemoProfiles } from '../demo/build-demo-data.mjs';

const fresh = () => {
  const db = new DatabaseSync(':memory:');
  migrate(db);
  seedDemo(db);
  return db;
};

test('迁移：30 张业务表 + 迁移台账；重复 migrate 幂等', () => {
  const db = new DatabaseSync(':memory:');
  const first = migrate(db);
  assert.equal(first.executed.length, 1);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name <> 'schema_migrations'").all();
  assert.equal(tables.length, 30, `业务表应为 30，实际 ${tables.length}`);
  const second = migrate(db);
  assert.deepEqual(second.executed, []);
  db.close();
});

test('播种：幂等（第二次整批跳过）且单事务', () => {
  const db = fresh();
  assert.equal(hasDemoData(db), true);
  const before = db.prepare('SELECT COUNT(*) AS n FROM metric_point').get().n;
  const again = seedDemo(db);
  assert.equal(again.skipped, true);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM metric_point').get().n, before);
  db.close();
});

test('parity：bootstrap 两档案与 demo-data.js 逐字段一致（deepStrictEqual）', () => {
  const db = fresh();
  const got = bootstrap(db, { version: 'test', build: 'test' });
  const want = buildDemoProfiles();
  assert.deepEqual(got.meta, want.meta);
  assert.equal(got.profiles.length, want.profiles.length);
  got.profiles.forEach((p, i) => assert.deepEqual(p, want.profiles[i], `profile ${p.id} parity 不一致`));
  db.close();
});

test('事实可回读：改一行 metric_point，bootstrap 立即反映（不是返回静态 JSON）', () => {
  const db = fresh();
  db.prepare("UPDATE metric_point SET value_num = 99 WHERE profile_id='demo1' AND code='ALT' AND measured_at='2026-10-16'").run();
  const p = getProfile(db, 'demo1');
  const last = p.metrics.numeric.ALT.at(-1);
  assert.equal(last.v, 99);
  db.close();
});

test('K1/K3/K5 结构：无诊断列、SLNB 三态、IO 无归因列', () => {
  const db = fresh();
  const cols = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
  const selfCols = cols('self_check');
  for (const forbidden of ['diagnosis', 'benign', 'malignant', 'risk_level']) assert.equal(selfCols.includes(forbidden), false);
  assert.equal(cols('slnb_record').includes('status'), true);
  assert.equal(cols('irae_event').includes('causality'), false);
  const p = getProfile(db, 'demo1');
  assert.equal(p.stage.slnb.state, 'result');
  assert.equal(getProfile(db, 'demo2').stage.slnb.state, 'not_done');
  db.close();
});

test('K4：分子三态齐全，未检测与未检出分开', () => {
  const db = fresh();
  const p = getProfile(db, 'demo1');
  const braf = p.stage.molecular.find((m) => m.marker.startsWith('BRAF'));
  const nras = p.stage.molecular.find((m) => m.marker === 'NRAS');
  assert.equal(braf.status, 'not_tested');
  assert.equal(nras.status, 'not_detected');
  db.close();
});
