# Schema 冻结合同（G3）· 2026-10-25 · MEL

| 项 | 值 |
| --- | --- |
| 文件 | `schema/0001_initial.sql` |
| sha256 | `ffc00fce5e897e18334564b2d98ebd92509e6b0fc9cbfcb04bbd0b844f0c3db8` |
| 表数 | 30（档案 2 + 指标 3 + 通用 7 + MEL 专属 15 + 导入 3） |
| 冻结日 | 2026-10-25（G1+G2 签认后；G3 签认人 samqin123） |
| 验证 | 内存库 30 表全建；**K1 无 diagnosis/benign/malignant/risk_level 列断言 PASS**；fcr_record.visibility 默认 'private' |

## 内容边界（MEL 专属 15 表）
self_check（部位+时间+自述+照片本机路径）/ lesion（皮损条目）/ stage_record + slnb_record（只引用三态）/ molecular_marker(+title)（BRAF/NRAS/TERT 三态）/ surgery_record（切缘原文）/ systemic_tx（靶向/免疫周期，反应原文）/ **irae_event（IO 五轨，不归因）** / **followup_track（皮肤线/影像线）** / imaging_followup（并列 + LDH）/ sun_exposure（事实记录）/ **fcr_record（默认 private）** / viewpoint（默认 private）/ decision_checklist。

## 冻结规则
同家族：sha256 实算一致；只增不改（000N）；分节补列走 ALTER；解冻需用户确认。
