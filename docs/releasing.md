# 发布流程

当前交付版本 v0.20.0。GitHub Release 与 npm 是独立发布动作；普通开发和 CI 不自动发布。本库不依赖业务服务。

## 本地验收

在 macOS ARM64 图形会话使用 Bun 1.4.2：

```sh
bun install --frozen-lockfile
bun run check
bun run docs:api
bun run docs:catalog
bun run docs:handbook
bun run docs:api:check
bun run docs:handbook:check
bun run test:native:all
bun run test:live:handbook
bun run test:package
bun run test:starters
bun run test:source
```

顺序运行原生测试；每条结果写入 artifacts/native-release.json，全部通过后复制到 docs/releases/native-当前版本.json。更新本版验收文档和兼容性声明。真实窗口仅执行启动、输入和键盘操作，点击行为由 TestRenderer 验证。

修改独立示例后运行 docs:handbook；每个分类使用同一个 TSX 文件供文档代码块和原生预览消费。test:handbook 生成两种主题的截图。检查截图后将选定手册首页预览复制到 docs/images/handbook-light.png 和 handbook-dark.png。

## 构建附件

`bun run build:starters` 先打包 UIKit，再构建两个独立模板；模板包含 vendor/gpuix-kit.tgz 和生成的 bun.lock，不包含 node_modules。`bun run test:starters` 会重新构建并在临时目录验收安装、原生交互及真实窗口。源码模板 manifest 使用固定 Release URL。

`bun run test:source` 生成允许列表中的源码归档，解包后校验文件内容、Markdown 本地链接、冻结安装、静态检查和文档索引。更新任何文件后重新生成归档。

运行 `bun run release:checksums` 生成 SHA-256 清单，上传这些附件：

- mirai-gpuix-kit-0.20.0.tgz
- gpuix-kit-minimal-0.20.0.tar.gz
- gpuix-kit-sidebar-0.20.0.tar.gz
- gpuixKit-0.20.0-source.tar.gz
- gpuixKit-0.20.0-source.manifest.json
- 0.20.0-SHA256SUMS.txt

源代码审计排除依赖、构建产物和本机目录，检查版本、许可证、公开入口、原生报告及常见凭据模式。维护者还需检查归档清单。

## GitHub 交付与下载复验

收到发布授权后，将验收过的源代码提交并推送到目标仓库，确认提交对应的 CI 成功，再为该提交建立固定版本 Release 并上传附件。通过 GitHub CLI 的结构化参数或 notes-file 提交说明，不使用未经检查的命令拼接。

重新下载已发布附件并校验 SHA-256。在独立项目中执行 README 的固定版本 URL 安装；对下载的模板执行冻结安装与窗口启动。Release 存在、附件上传、CI 通过和消费验证是不同的检查结果，分别记录。

当前仓库为 [leyugod/GPUIX-Kit](https://github.com/leyugod/GPUIX-Kit)。npm 尚未发布。GitHub CI 使用只读权限，验证类型/边界/纯规则、目录、API、手册和源码审计；Linux CI 通过不表示原生 Linux 兼容。
