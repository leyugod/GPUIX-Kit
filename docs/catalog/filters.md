# v0.17 筛选条件与保存视图

新增 FilterChip、FilterSummary、FilterConditionRow、FilterBuilder、FilterPanel、SavedViewPicker。按条件行、受控表达式、提交草稿及命名视图分层，共用现有分页动作菜单和深浅主题。原 FilterBar 保留。

运行 `bun run dev:filters`；[完整 API 与边界](../../packages/uikit/docs/filters.md)。样例只查询本地内存记录，保存视图没有连接数据库或服务。

验证：check、test:filters、test:filters:narrow、test:filters:states、test:live:filters、test:package；回归 actions:states、workbench:states。截图为 artifacts/filters-*.png，具体本批运行记录见 compatibility.json。

当前为一层 all/any，最多 24 字段、12 条件、50 视图；条件值和保存权限由应用作最终校验。嵌套组、更多关系运算符、远程执行、持久化与平台 AX 尚缺。
