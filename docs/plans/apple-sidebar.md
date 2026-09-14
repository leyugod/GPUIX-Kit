# Apple 风格应用侧栏 · v0.15 交付核对

原计划已在 v0.15 增加来源侧栏、分组头、导航行、显隐开关、内容面板与两栏/三栏容器。见[完整 API](../../packages/uikit/docs/sidebars.md)。以下保留目标并说明边界，完整通用框架仍未完成。现有 SidebarNavigation 提供 simple/slim/dual-tier、分组标题、两级展开、图标、徽标、搜索/头尾插槽；SplitView、Inspector、WorkspaceSwitcher、AccountMenu 可组合使用。完整 macOS 应用侧栏仍有缺项。

目标组合是 Finder 风格来源列表，以及 Mail/Notes 风格的侧栏—内容列表—详情。深层级优先使用中间内容列，而不是无限加深侧栏。参考 [Apple Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars) 与 [Split views](https://developer.apple.com/design/human-interface-guidelines/split-views)。

本批交付与范围：

1. SourceListSidebar：收藏、位置、标签等通用分组；应用传入数据与语义名称。
2. 分组头与导航行：折叠、图标、徽标、行末操作、选中和非活动窗口的视觉状态。
3. 固定搜索与底部附属区：可组合账户、工作区、同步/任务摘要；正文单独滚动。
4. 已提供 SidebarToggle 与受控宽度：显示/隐藏、宽度拖动和最小宽度约束；偏好保存由应用负责。
5. NavigationSplitView：两栏/三栏联动及可选右侧 Inspector；窄窗口按明确规则收起辅助列。
6. 可操作示例：Mail 三栏与 Files 来源列表；已验证键盘进入/退出、折叠选中项、删除后的显式换选、滚动定位和深浅主题。Files 仍使用通用内容示例，不是完整 Finder；没有真实文件/邮件服务。

先完成原生布局、深浅主题、状态和交互，不把普通透明色称为系统材质。Vibrancy/Liquid Glass、系统强调色、窗口激活检测、系统图标资源和 AX 分别核对 GPUIX 0.7.0 的实际 API；缺少能力时记录扩展边界。v0.14 的对话与面板基础继续保留；v0.15 新增焦点区域登记，但原生编辑器未转发的内部焦点变化仍有边界。

实际公开数据类型使用 SourceListItem/SourceListGroup，与旧 SidebarItem/SidebarSection 并存。验收以完整组件组合和真实原生测试为准，不用导出数量代替完整性。

后续仍缺：来源拖放/多选/自动展开、系统窗口活动及材质适配、SF Symbols、AX、真正多账户和文件/邮件数据服务。列表/树加载、失败重试与集合展示已在 v0.16 增量实现，见[API](../../packages/uikit/docs/collections.md)；不回计为 v0.15 的交付。
