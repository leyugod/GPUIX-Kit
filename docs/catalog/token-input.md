# v0.13 标签建议与编辑

六个公开组件覆盖建议目录、可搜索标签选择、单标签改名、分页管理、选择草稿和弹出选择。原 TokenField 继续负责批量拆分输入，不改变已有 API。

运行 bun run dev:tokens。Gallery 包含自由创建、受保护标签、目录禁用项、改名冲突、Apply/Cancel 和实时深浅主题切换。完整契约见[包内 API](../../packages/uikit/docs/token-input.md)。

验收：bun run check、test:tokens、test:tokens:narrow、test:tokens:states、test:live:tokens、test:choices、test:choices:states、test:package。截图位于 artifacts/tokens-*.png。候选仅来自应用提供的当前数据，未实现远程服务和系统编辑适配。
