# 项目规格 v0.1（SPEC）· 皮肤黑色素瘤「小痣宝 MolePal」

状态：**草案，待 G1 签认**。双主体；占位品牌小痣宝 MolePal；melanoma-workbench。

## 0. 需求审计
核心：**确诊前自查档案（家族首次）** + 分期/SLNB 引用 + 分子三态 + 靶向/免疫治疗 + IO 四轨 + 双轨随访 + 肢端语境。红线 K1–K6。G1 待拍板：3 个结构决策点 + 品牌 + 二期。

## 3. ADR
家族标准；client 链路 cervical 底本；apiBase 定稿契约；样板 cervical + 基准 breast；MinerU 接入；AI 按钮一键携带提示词+病情上下文（四仓定稿件直接继承）；模型路由 GLM-5.3+Flash。

## 4. 功能范围（10 线 30 页签，family-landscape §6）
F-DASH / **F-SELF（自查档案：我的痣/新增/照片对比/ABCDE·肢端翻译/就诊准备）** / F-TUMOR（病理·Breslow/分期SLNB/分子/报告）/ F-TX（靶向/免疫/变更）/ **F-IO（皮疹/腹泻/肝甲/其他 irAE）** / F-FU（皮肤线/影像线/LDH）/ F-CHART / F-LIFE（暴露/防晒/营养）/ F-MIND（当下/疤痕/性健康/遗传）/ F-DOCS（复诊/资料/试验/导出）/ F-SET。

## 7. 验收
G1 → G2（四必查件+HVT X1–X4+窄宽+computed fill）→ G3 → V1 check → V2/V3 真机（先新建会话）。✅🔧⏳ 铁律。

## 8. 明确不做
诊断/良恶性判断/分期判定/方案推荐/"消除复发恐惧"承诺；葡萄膜黑色素瘤（#43 另案）；多用户云同步。
