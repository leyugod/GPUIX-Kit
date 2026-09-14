# 桌面动作与导航组合

v0.10.0 新增 ButtonGroup、SplitButton、ToolbarActions、PathControl、WorkspaceSwitcher、AccountMenu。

- [完整 API、组合示例和限制](../../packages/uikit/docs/actions.md)
- 展示：`bun run dev:actions`
- 原生测试：`bun run test:actions`、`bun run test:actions:narrow`、`bun run test:actions:states`
- 真实窗口：`bun run test:live:actions`

验收覆盖六组件深浅色、动作锁定、路径收纳、工作区选择、六行分页、数据变化后的焦点、空/全禁用菜单与嵌套 Escape。工具栏数量由应用布局传入；账户操作、路由与持久化属于应用层。仍无完整系统菜单、全局快捷键或 overlay 栈。
