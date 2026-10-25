# 小痣宝 MolePal · 皮肤黑色素瘤患者工作台

面向**皮肤黑色素瘤患者与照护者**的本机资料工作台：把自查记录、分期与分子、治疗与副作用、双轨随访整理成**可核对、可回溯、能带去门诊**的资料。
**只做信息整理与就诊准备，不做诊断、不做良恶性判断、不做分期判定、不给治疗方案建议。**

## 关键功能

### 自查档案：从"这颗痣好像变了"开始（确诊前形态）
![自查档案 · 肢端专项自查引导](docs/screenshots/readme-self-check-acral-0.3.1.png)
按部位与时间记录你看到的变化，照片只存本机。肢端引导按中国语境排顺序（足底→趾缝→甲下→手掌），并把"鸡眼/灰指甲/甲下血肿"这些常被混淆的说法讲清楚——**解释不是诊断**。

### 治疗路径：默认概要，点开看细节
![治疗路径与方案 · 折叠卡（默认概要）](docs/screenshots/readme-treatment-pathway-0.3.1.png)
每个病情阶段一张折叠卡：默认只显示「阶段 · 日期 · 一句话概要」，一眼看到走到哪一步。

![治疗路径 · 展开五块细节](docs/screenshots/readme-treatment-pathway-open-0.3.1.png)
点开任意阶段，同一处看到**方案 / 指标和趋势 / 影像发现 / 副作用总结 / 心理与营养措施及效果**——适合复诊时医生按需了解细节；打印时全部自动展开。

### 看板：今天该做什么
![看板 · 双主体入口](docs/screenshots/readme-dashboard-0.3.1.png)
患者本人与照护者各有"现在可以做"的入口（配偶可代检背部盲区并代记）。

### 病情一图秀：变化发生在哪一步
![一图秀](docs/screenshots/readme-one-chart-0.3.1.png)
多指标与治疗/检查节点同轴；分类序列只画节点不连线。

## 怎么用（DSH Desktop）
1. 工作台列表添加「小痣宝」（本地 tgz：`release/xyb-community-melanoma-workbench-0.3.1.tgz`，或 profile `pnpm add`）；
2. **首次使用先在左侧会话列表新建一个会话**（宿主按会话授权本台接口，否则显示离线演示数据）；
3. 数据保存在你选择的**本机资料目录**，不联网同步。

## 数据与口径
- 演示数据为合成；试验线索为真实登记库样例，**登记状态，未核实**（登记 ≠ 有效 ≠ 可入组）。
- 分子三态：**未检测 ≠ 阴性**；影像与副作用只照抄原文，不判读、不归因。
- FCR（复发恐惧）与身体意象默认私密，导出/AI/摘要三处出口按 visibility 过滤。

## 开发
- 闸口与里程碑：`docs/DEV-PLAN.md`（G1/G2/G3 + V1/V2/V3）；调研与设计：`docs/{USER-RESEARCH,SCENARIOS,DIFF-MATRIX,SPEC}.md`
- 检查：`npm run check`（27 项单测 + 红线词表 + 冻结 sha256 + 版本同源）；走查：`npm run probe`（64 页签/HVT/窄宽）
- 截图规范：README 截图按 starter `docs/33-README-SCREENSHOTS.md`（本页 5 张为 0.3.1 实渲），治疗路径折叠卡模版见 starter `docs/32-TREATMENT-PATHWAY-FOLDOUT.md`
