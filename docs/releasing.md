# 发布流程

首个开源交付版本为 0.19.0；npm 发布与 GitHub 上传是单独的发布动作。此流程不依赖真实业务服务。

## 本地验收

使用 macOS arm64 图形会话和 Bun 1.4.2：

```sh
bun install --frozen-lockfile
bun run check
bun run docs:api
bun run docs:api:check
bun run check:catalog
bun run test:native:all
bun run test:live:catalog
bun run test:live
bun run test:package
bun run check:release-source
bun run test:source
```

test:native:all 从 package.json 读取全部 TestRenderer 脚本，按顺序执行，失败立即退出。通过后将当前结果复制到 docs/releases/native-当前版本.json。结果与日志在 artifacts/native-release.json、artifacts/release-logs/，不会跳过失败。真实窗口不用 live simulateClick。历史 compatibility.json 记录与本次全量结果区分阅读。

## 产物

- artifacts/mirai-gpuix-kit-0.19.0.tgz：组件包，包含公开源码、类型、文档和许可证。
- artifacts/gpuixKit-0.19.0-source.tar.gz：明确允许列表中的完整仓库源码，含 Gallery、测试、CI 与文档。
- artifacts/gpuixKit-0.19.0-source.manifest.json：源码归档每个文件的 SHA-256。构建后核对归档和清单；源码归档不嵌套 artifacts 或 node_modules。
- docs/images/：人工检查后选入源码的展示截图。其余本机截图和日志在 artifacts，不自动提交。

源码审计核对公开入口、版本、许可证、必要文档、依赖排除及常见凭据/本机用户路径模式。这是有界检查，不宣称能识别所有敏感信息。维护者发布前还应审阅归档清单。

## CI 与平台

GitHub 工作流对 push/PR 运行冻结安装、类型/边界/纯规则、API 索引及源码审计。配置参考 [setup-bun 官方文档](https://github.com/oven-sh/setup-bun)与 [GitHub 工作流语法](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)。工作流仅具备 contents:read 权限，不自动发布，也不获取应用密钥。

普通 Linux CI 的规则通过不能证明原生 Linux 兼容。macOS 图形验收由维护者在允许图形访问的会话执行；完整 AX/IME 和 Windows/Linux 原生支持不在首版已验证声明中。

## GitHub 交付

将审阅过的源码归档内容提交到指定公开仓库，保留现有许可证与来源。确定目标 owner/repository、公开可见性和版本标签后再上传；没有目标仓库时，本地交付可以验收，公开上传状态保持 pending。上传后检查 README 链接、默认分支、首个 CI 结果和 Release 附件，不把配置存在等同于远端 CI 已运行。
