# HTML交互原型确认记录

状态：待制作/预览/用户确认。未填入真实依据前不可标已确认。

- HTML实际路径、版本与SHA-256：
- 当前SPEC/场景/数据模型版本：
- 预览环境/容器尺寸/日期；无法预览及限制：
- 模拟数据/MockAdapter与真实功能界限：
- 核心任务、二级页、弹窗/状态、回顾/导出覆盖与未覆盖项：
- 版本号显示与一致性（P1）：顶栏/页脚/关于三处文本；`VERSION` 与校验脚本输出
- 一图秀核对（若涉及）：`docs/ONE-CHART-SPEC.md` 的 C1–C12 逐条结果
- 用户反馈及修订：

| 模块/功能ID | 对应HTML/行为 | 实际走查证据 | 用户明确确认依据/人/日期 | 未确认项 | 允许实施的范围 |
| --- | --- | --- | --- | --- | --- |

只确认对应版本/模块，新增/重大交互变更重新展示；确认不代表服务接通、数据库冻结或业务验收通过。实际数据模型/API复核后实现，参见docs/14-HTML-AND-DATA-CONTRACT.md。


## 独立评审修订留痕（2026-10-25，DESIGN-REVIEW 4 个 P0）

| P0 | 修复 |
| --- | --- |
| IB 期给 BRAF/MEK 辅助（不适用） | demo2 改 **IIIB（pT2aN1bM0，SLNB 阳性）**——靶向辅助符合 III 期适应证；重生成 demo-data |
| ABCDE 的 E 缺中国口径 | 双口径并列：**Elevation 隆起（中国指南）/ Evolving 演变（国际版）** + 甲下 ABCDEF 注记 |
| X1/X2 数字不可复现 | data-step 唯一目标 **23**、原两孤儿页各补入链（孤儿 0）——数字与命令写回 INTERACTION-DESIGN §四 |
| FCR private 被三出口击穿 | fcr 加 `visibility:'private'`；**导出与 AI 上下文按字段过滤**（导出显示"私密，已过滤"、AI 上下文带过滤说明）；摘要区计入 privateRows |
| 残留 | THY 注释清零（style.css 蝶翼）；TSH 指标保留（MEL 的 IO 甲减监测合法） |

复验：check staticPass / probe-proto fatal=null / 数字见上。
