# v0.15 Apple 风格来源侧栏

新增 SourceListSidebar、SourceListSectionHeader、SourceListRow、SidebarToggle、NavigationPane、NavigationSplitView。来源组/选中态/行末操作、固定搜索和底部区、可调整两栏/三栏及 Inspector 共用既有主题与分栏。

运行 `bun run dev:sidebars`。Mail 和 Files 两个来源示例使用应用持有的内存状态。查看[完整 API 与边界](../../packages/uikit/docs/sidebars.md)及[原规划的交付核对](../plans/apple-sidebar.md)。

验收：check、test:sidebars、test:sidebars:narrow、test:sidebars:states、test:live:sidebars、test:package。另回归 desktop、desktop:states、modals:states、colors:states、tokens:states。截图位于 artifacts/sidebars-\*.png。

来源集合有界为 20 组/100 项，无虚拟化、系统材质或真实文件/邮件服务。自动焦点恢复依赖 UIKit 登记，不声明 GPUIX 内部编辑器全部焦点变化均可观察。
