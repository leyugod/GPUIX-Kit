# 参与 gpuixKit

首版范围是原生组件、纯模型和可注入接口。请先阅读 [架构](docs/architecture.md)、[首版清单](docs/releases/0.18.0.md)和 [API](packages/uikit/README.md)。

## 本地开发

需要 Bun 1.4.2；原生 UI 使用固定 GPUIX 0.7.0。当前发布验证环境为 macOS arm64。不要混用其他 native 构建产物。

```sh
bun install --frozen-lockfile
bun run check
bun run dev:table-prefs
```

所有公开包间导入使用 exports；领域规则保持纯 TypeScript；普通文本使用 Text，颜色使用主题语义色，交互节点提供稳定 testId。组件不读取数据库、密钥或应用服务。新增端口需要说明能力、参数、失败和不支持的结果。

## 提交变更

1. 在 Issue 或 PR 中描述具体行为、受控 API 与复现方式。不要附上私有数据、凭据或用户文件。
2. 纯规则使用 Vitest；原生行为用 TestRenderer；真实窗口启动/输入/截图单独验证。不要使用已知存在原生重入风险的 live simulateClick。
3. 运行 `bun run check` 和相关原生用例；公共焦点/输入/表格等基础变更需扩大回归范围。首版全量原生回归为 `bun run test:native:all`。
4. 更新组件文档、能力限制和变更记录。未运行的平台明确标记，不将模拟结果称作系统联调。
5. PR 说明包含问题、行为变化与验证；不在库内实现账户、邮件、云存储等业务服务。

不要求贡献者上传所有本机截图或测试日志。维护者发布前运行 [发布流程](docs/releasing.md)，选择没有个人数据的展示截图。原生测试需要有图形服务的 macOS 会话，普通无界面 CI 不能替代该验收。
