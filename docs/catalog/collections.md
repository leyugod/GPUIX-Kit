# v0.16 集合、列表与树资源状态

本批交付 ResourceState、LoadMoreButton、AsyncListView、CollectionItem、CollectionView、LazyTreeView。与 v0.15 Apple 风格分栏组合成独立资源浏览示例，保留 Darwin 深浅主题。

运行 `bun run dev:collections`，查看[API、键盘及请求边界](../../packages/uikit/docs/collections.md)。示例使用本地内存 Promise，包含首次失败、分支重试、分页结束以及 Grid/List 切换。

验收命令：check、test:collections、test:collections:narrow、test:collections:states、test:live:collections、test:package；回归 workbench、workbench:states 和 sidebars。截图为 artifacts/collections-*.png。具体运行结果以 compatibility.json 本批记录为准。

集合有界为 100 项/页，树为整个已加载集合 200 项/9 层。锁只管理 UI 请求生命周期，应用必须处理响应版本与数据更新。虚拟化、无限滚动、拖放、文件/邮件服务和系统 AX 仍未完成。
