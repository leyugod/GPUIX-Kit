# gpuixKit 开发约定

- 这是独立的通用原生 UIKit；不依赖 CRM 或其他应用的业务、数据库、密钥与存储。
- 首个 GitHub 开源版本只交付组件、纯模型、适配接口、文档与示例；高级业务服务不在范围内。首版依据 docs/plans/first-open-source-release.md，不能把真实账户/邮件/云存储等计为缺失组件。
- 先读 README.md、docs/architecture.md 和 docs/compatibility.json。
- Bun Workspace；公共库位于 packages/uikit，展示应用位于 apps/gallery。
- 使用固定 @gpuix/react / native 0.7.0 发布产物；真实 API 以 node_modules 类型与发布 JS 为准。
- 不引入 DOM、React DOM、CSS/Tailwind 运行时、浏览器 API 或 localStorage。
- 普通文本仅使用 Text；语义色来自 UIKitProvider；交互控件必须有 testId。
- 控件受控，业务逻辑由使用方管理；原生焦点适配集中在 core/focus 与 overlays。
- 包仅使用公开 exports；依赖写进使用方 manifest。运行 bun run check:boundaries。
- 纯规则使用 Vitest，原生交互使用 TestRenderer；实际窗口单独验证启动/输入/截图，不用 live simulateClick。
- 新代码用简洁中文注释说明边界。保留第三方来源、固定版本与许可证。
- 不自动发布；不修改系统配置。不要把未验证平台、无障碍或复杂特效宣称为已完成。
- 版本按整数 minor 递增：v0.9.0 后为 v0.10.0、v0.11.0，不按小数计算或自动升为 v1.0.0。
- 每批完成更多相关组件，以完整组件组合、示例和验证交付；不以导出数量宣称框架完成。
