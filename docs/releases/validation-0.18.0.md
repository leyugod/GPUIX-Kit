# 0.18.0 本地验收记录

验收窗口：2026-09-13 至 2026-09-14（Asia/Shanghai）。本机 macOS arm64 图形会话；Bun 1.4.2、GPUIX React/native 0.7.0、React 19.2.4、TypeScript 5.9.3。首版范围见[组件清单](0.18.0.md)。

| 验证 | 结果 | 实际覆盖 |
| --- | --- | --- |
| bun run check | 通过 | 2 个 Workspace 包与工具 TypeScript、AST 依赖边界、19 文件 / 163 项纯规则 |
| bun run test:native:all | 通过 | 53 个 TestRenderer 脚本全部顺序执行；宽窄、深浅和状态场景，见[逐项记录](native-0.18.0.json) |
| test:table-prefs / :narrow | 通过 | 新增底部布局断言后重跑两种尺寸，验证表格摘要位于状态栏上方 |
| test:live:table-prefs / test:live | 通过 | 两个真实 macOS 窗口的启动、中文文本注入、键盘主题切换、截图和关闭 |
| bun run test:package | 通过 | 0.18.0 tgz 离线装入独立临时消费者，公开入口/类型、各批代表性交互、新偏好 Apply/密度、注入端口和 unsupported |
| bun run docs:api:check | 通过 | 74 个公开入口的符号索引与源码一致 |
| GitHub YAML 解析 | 通过 | CI、Bug/Feature 模板；不是远端 CI 执行证明 |
| bun run check:release-source | 通过 | 源码允许列表、版本、导出文件、许可证、依赖排除与有界私有内容模式检查 |

全量原生通过后只修改表格 Gallery 的高度预算并增加几何断言，已重跑该 Gallery 两种尺寸；HostPorts 加严单选快照约束后已通过纯规则和独立消费者。未为未改动组件重复生成完成声明。

## 归档与干净目录复现

已完成源码归档逐文件 SHA-256 与允许列表核对：252 个源码文件；组件 tgz 的 124 个文件逐字节匹配 packages/uikit。全部相对 Markdown 文件链接指向归档内文件。

从源码归档解压到全新临时目录后，冻结离线安装、bun run check（163 项规则）、docs:api:check 和 check:release-source 均通过。复现依赖本机已有 Bun 包缓存；未用联网安装结果代替离线验证。最后仅更新本文与兼容性记录，再重新归档并核对内容。

源码归档排除 node_modules、artifacts、.git、本机配置、日志和环境文件；保留已检查的两张展示截图。安装包含源代码、类型、API 文档与许可证。完整文件清单及 SHA-256 在 artifacts/gpuixKit-0.18.0-source.manifest.json，产物校验和在 artifacts/SHA256SUMS。

## 记录范围

原始日志、全部原生截图与两个真实窗口截图在本机 artifacts；它们未全部嵌入源码。native-0.18.0.json 提供命令清单与状态，其 log 路径表示本地相对路径，可按发布流程重新生成。历史 compatibility.json 的旧批次记录不意味着本轮运行了所有历史真实窗口脚本。

这是已列明路径的自动化与视觉检查，不声明所有输入、完整 AX/IME、所有平台或系统控件等价能力。GitHub 尚未指定目标仓库，未创建、推送或运行远端 CI；npm 未发布。
