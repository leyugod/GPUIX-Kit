# 通用桌面 UIKit：范围校正与覆盖矩阵

核对日期：2026-09-14。本文替代“37 个导出即已完成通用 framework”的验收口径。

首个 GitHub 开源版本只提供组件、纯模型、适配接口、文档与示例，见[首版范围与验收](plans/first-open-source-release.md)。本矩阵保留长期 UI 能力全景；未实现业务服务不属于缺失组件，也不阻塞 UIKit 首版。高级 UI 项是否纳入首版按具体交付清单确定，不因服务排除而自动取消。

## v0.19 完整目录补齐

官网 30 类基础、37 类应用、18 类营销 UI 的逐项映射已建立，见[85 项目录](untitled-ui-coverage.md)。新增独立组件与宿主接口见[公开契约](../packages/uikit/docs/catalog-completion.md)。本表下方是历史全景与深度增强项，不能与本轮目录类别数量混算。目录、原生全量、独立包与源码归档已通过验收；GitHub 交付目标为 leyugod/GPUIX-Kit，见本版验收记录。

## v0.18 首版交付记录

首版具体范围已冻结，见[组件清单](releases/0.18.0.md)及[验收记录](releases/validation-0.18.0.md)。新增六个表格偏好组件，覆盖列显隐、锁位与顺序、三层排序、显示密度和草稿；补齐应用注入接口、开源文档/CI/归档工具。见[表格 API](../packages/uikit/docs/table-preferences.md)、[端口契约](../packages/uikit/docs/host-adapter.md)。以下历史批次保留其当时边界，不代表当前版本号。

## v0.17 筛选条件与保存视图记录

新增 FilterChip、FilterSummary、FilterConditionRow、FilterBuilder、FilterPanel、SavedViewPicker。覆盖五种字段值、一层 all/any、分页编辑、Apply/Cancel 草稿、保存视图选择与创建/更新/改名/删除意图、只读保护和异步锁。见[API](../packages/uikit/docs/filters.md)。没有嵌套组、查询编译器或持久化服务。

## v0.16 集合与异步资源记录

新增 ResourceState、LoadMoreButton、AsyncListView、CollectionItem、CollectionView、LazyTreeView；覆盖当前页二维键盘与范围选择、加载/空/错误/刷新、独立分支请求与失败重试、版本隔离和折叠保留请求锁。见[API](../packages/uikit/docs/collections.md)与[目录](catalog/collections.md)。集合仍无虚拟化/拖放，应用负责请求和响应版本检查。

## v0.15 Apple 风格侧栏记录

新增 SourceListSidebar、SourceListSectionHeader、SourceListRow、SidebarToggle、NavigationPane、NavigationSplitView，覆盖来源分组/行末动作、固定附属区、窗口活动视觉、可调整两栏/三栏与 Inspector。见[API](../packages/uikit/docs/sidebars.md)。自动收起保留应用偏好，UIKit 已登记的焦点支持显式恢复；不声明系统材质、AX 或完整 Finder/Mail 服务。

## v0.14 对话与面板记录

新增 AlertDialog、ConfirmDialog、PromptDialog、Sheet、Drawer、ProgressDialog。覆盖异步确认/输入草稿、任务意图、窗口边缘与尺寸、托管 Dialog/Popover 的顶层键盘及嵌套恢复，见[本批 API](../packages/uikit/docs/modals.md)。宿主 Select/Tooltip、自定义 anchored、OS 窗口和 AX 不属于该注册栈。Apple 风格侧栏已在 v0.15 增量交付，见[交付核对](plans/apple-sidebar.md)。

## v0.13 标签建议与编辑记录

新增 TokenSuggestionList、TokenCombobox、EditableTag、TokenEditor、TokenPickerPanel、TokenPicker。覆盖候选分页/禁用/本地查询、目录身份保留、自由创建冲突、改名判重/取消/外部更新、受保护清除与 Apply/Cancel 草稿。详见[本批 API](../packages/uikit/docs/token-input.md)。

六个组合共享既有主题、标签、校验和焦点基础；原 TokenField 的批量输入仍保留。远程请求、拖放、虚拟化及系统编辑能力不计入本批完成范围。

## v0.12 通知与任务反馈记录

新增七个组件：NoticeCard、UndoToast、ToastViewport、ProgressRing、TaskProgress、TaskList、TaskSummary，以及队列控制器/hook。覆盖候补与超时暂停、异步失败重试/重复锁/旧回调隔离、受控撤销与任务动作、分页和深浅主题。详见[本批 API](../packages/uikit/docs/notifications.md)。

原生宽窄窗口、状态测试、真实 macOS 输入截图与独立安装均按本批记录验收。静态未知进度不计作 Spinner；应用内通知不计作系统通知。

## v0.11 颜色组件记录

新增 ColorSwatch、ColorWell、ColorField、ColorPalette、ColorPanel、ColorPicker，见[颜色目录](catalog/colors.md)。已验证十六进制/RGBA、透明预览、草稿 Apply/Cancel/Clear、分页和嵌套拖动焦点；系统取色、HSV/HSL 二维色域、渐变、广色域与 AX 尚缺。

## v0.10 桌面动作与导航组合记录

新增 ButtonGroup、SplitButton、ToolbarActions、PathControl、WorkspaceSwitcher、AccountMenu，见[动作组合目录](catalog/actions.md)。已验收深浅色、受控值、动作锁、六行分页、动态集合焦点、空/禁用和嵌套 Escape；仍缺自定义工具栏、导航历史、系统菜单和全局 overlay/快捷键服务。

## v0.9 日期导航与范围组合记录

新增 MonthPicker、YearPicker、DualCalendar、DualRangeCalendar、DateRangePresets、DateRangePanel、DateRangeDialog，现有日历支持可选年月导航和只读。见[日期组合目录](catalog/date-navigation.md)。双月键盘焦点、完整范围校验、草稿 Apply/Cancel 及年月逐层 Escape 已验收；日期时间组合、时区与系统/AX 仍未完成。

## v0.8 滑块轨道与刻度记录

Slider/RangeSlider 新增可选轨道点击、横纵刻度/标签和只读状态，见[轨道与刻度目录](catalog/slider-tracks.md)。原生命中区域最多 201 个停靠值，细步长可继续关闭 trackPress 使用拖动/键盘。刻度最多 51 项；未完成触控、对数尺度或 AX 认证。

## v0.7 时间控件记录

新增 TimeField、TimeList、TimePicker：HH:mm 草稿/提交、同日范围、分钟步长、禁选时段、八行分页和原生弹层焦点。见[时间目录](catalog/time.md)。日期时间族仍为基础，秒、时间范围/日期时间组合、时区、双月/年月面板和 AX 仍未完成。

## v0.6 选择与标签记录

现有 Checkbox 增加三态与只读，新增 CheckboxGroup 范围批量选择、Tag、TokenField。标签支持同步整批校验、去重、受保护项及键盘增删，见[选择与标签目录](catalog/choices.md)。原生编辑器的 Backspace/方向键消费与 Tab 插入行为已明确记录；不声明完整 macOS TokenField、剪贴板或 AX 等价能力。

## v0.5 控件补齐记录

新增 Slider/RangeSlider、Calendar/RangeCalendar、DatePicker/DateRangePicker；支持深浅主题、受控值、原生拖动/键盘、闰年、公历范围边界、区间内禁用日期校验及日期弹层焦点。见[控件目录](catalog/controls.md)。该批尚无滑轨点击/刻度、时间选择（v0.7 补充）、双月面板和完整 AX 语义，不计为完整组件族。

## v0.4 第三批实施记录

新增分类折线/面积/分组与正负堆叠柱/饼与环形图、MetricCard、Timeline/ActivityFeed、MessageBubble/List/Composer、Dashboard/Conversation/Settings 布局插槽，以及窗口尺寸/标题/激活端口。见[Studio 目录](catalog/studio.md)。第三批仍是基础增量：没有完整生产应用模板、系统服务或 AX 适配；SettingsLayout 尚无独立场景验证，窗口标题/激活仅验证转发规则。

## v0.3 第二批实施记录

新增 ListView、TreeView、DataGrid/FilterBar、DocumentTabs、useForm/表单结构、CodeBlock/DiffView 与文件状态/预览容器。具体 API、行为和测试见[工作台目录](catalog/workbench.md)。这些依旧是组件族基础能力，虚拟化、拖放、完整表格编辑、系统文件适配与完整应用模板尚未完成。

## v0.2 第一批实施记录

已新增导航家族、Breadcrumb、SplitView/Inspector、Popover、DropdownMenu/ContextMenu、命令模型/面板、ComboBox/MultiSelect、NumberField/DateField。已验证的具体范围见[桌面目录](catalog/desktop.md)。这些组件族继续标记“基础”，不把子导出数或演示变体数作为完成率。第一批尚缺完整 Calendar/DatePicker、Slider、全局 overlay 栈和快捷键体系。

## 当前交付的准确定位

v0.1.0 是可安装、可运行、经过部分原生交互验证的**基础组件原型**。它没有完成原始“用于后续所有 GPUIX 项目复用的通用 UIKit framework”目标。

- Darwin UI：参考配色、半径、表面层次及部分组件接口；没有直接加载它的 React DOM 组件，也没有完整移植 Darwin 的所有组件。
- Untitled UI：此前主要参考目录分层，没有系统实现其应用组件、布局变体与组合范式。
- GPUIX：已使用原生元素和公开 Select/Tooltip，封装了部分键盘与焦点行为；尚未形成完整桌面交互基础设施。
- 37 是导出的组件函数数量，其中含 Text、Row、Stack、UIKitProvider 与 Card 的子组件，不能与组件族、设计变体或成熟控件数量等同。

已通过的测试只证明已覆盖的行为，不证明下列缺失组件已经完成，也不证明可满足所有桌面应用。

## 参考来源与职责

1. [Untitled UI 应用组件目录与侧栏](https://www.untitledui.com/react/components/sidebar-navigations)：应用组件广度、组合结构、多种导航形态、信息密度和状态。
2. [Darwin UI](https://github.com/surajmandalcell/darwin-ui)：统一视觉语言与深浅主题。
3. [Apple macOS 设计指南](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos/)：菜单、键盘、窗口、工具栏、选择与桌面行为。
4. [Apple 分栏](https://developer.apple.com/design/human-interface-guidelines/split-views)、[列表和表格](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)、[菜单](https://developer.apple.com/design/human-interface-guidelines/menus)：生产力应用核心场景。
5. [GPUIX](https://gpuix.dev/)：原生实现基础；实际能力需以固定 0.7.0 发布 API 和测试为准。

保持 Darwin 视觉并不限制组件种类。也不能把“看起来像 macOS”当作系统行为兼容。

## 组件族覆盖

状态说明：**基础**表示只有较窄实现和部分验证；**缺失**表示没有可交付实现；**宿主适配**表示需要核对或扩展 GPUIX/native 能力，当前未封装。下列包含已实现的基础能力和待实现目标；基础能力不能计为完整组件族。

| 组件族       | 应具备的能力与变体                                          | 当前状态      | 主要缺口                                                                                                         |
| ------------ | ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| 设计基础     | 语义色、字阶、间距、圆角、阴影、密度、动效、焦点、图标规则  | 基础          | 密度模式、完整动效/图标规范和系统强调色适配                                                                      |
| 文本与图标   | 富样式文本、链接、截断、复制、SF Symbols/通用图标适配       | 基础          | 目前普通 Text 会合并文字；没有完整图标/链接/复制方案                                                             |
| 按钮         | 默认/主要/危险/工具按钮、图标、分裂按钮、按钮组、默认动作   | 基础          | 已有 SplitButton/ButtonGroup 与禁用/加载/键盘；缺窗口级默认/取消动作仲裁                                                            |
| 文本输入     | 单行、多行、搜索、密码、数字、只读、清除、前后缀            | 基础          | 密码/数字/前后缀/清除能力、IME 与编辑语义验证                                                                    |
| 表单         | Label、Field、Group、帮助、错误汇总、验证、提交状态         | 基础          | 新增受控 useForm、规则组合、错误摘要/聚焦、提交锁与失败反馈；缺嵌套字段、异步校验与完整 dirty/touched            |
| 勾选与单选   | Checkbox、三态、Switch、RadioGroup                          | 基础          | 已有三态 Checkbox、只读与范围批量选择；RadioGroup 标准方向键焦点与完整 AX/状态矩阵仍待完善                       |
| 选择器       | Select、Combobox、MultiSelect、分组、可搜索、异步列表       | 基础          | 已有 Select、ComboBox/MultiSelect；缺分组、自由创建和大型列表虚拟化                                              |
| 数值控件     | Slider、RangeSlider、Stepper、NumberField、单位             | 基础          | 已有 NumberField、横纵 Slider/RangeSlider 拖动/键盘/取消；已有有界轨道点击、刻度/标签和只读；缺触控、对数尺度与完整本地化                 |
| 日期时间     | Calendar、DatePicker、DateRangePicker、TimePicker           | 基础          | 已有公历单/双月、年月导航、预设/范围草稿与 HH:mm 选择；缺秒、AM/PM、时间范围/日期时间组合、时区和 AX |
| 颜色控件     | ColorWell、ColorPicker、颜色/渐变预览                       | 基础          | 已有六个十六进制/RGBA 颜色组件；新增 GradientPicker/GradientPreview；缺系统取色、HSV/HSL、径向/网格渐变、广色域和 AX                                                                         |
| 标签输入     | Tag、可移除 Tag、TokenField、多选 token                     | 基础          | 已有批量 TokenField 及建议/改名/草稿选择六组合；缺远程调度、拖放、范围选择、虚拟化与 AX              |
| 侧栏导航     | simple、slim、dual-tier、分组、子标题、分隔、可折叠子项     | 基础          | 新增分组、两级展开、simple/slim/dual-tier 与键盘导航；已有工作区/账户菜单基础组合；已有 SourceListSidebar 来源模板；仍缺拖放/多选/系统材质                                    |
| 侧栏附属区   | 搜索、工作区切换、账户菜单、底部操作、进度/提示卡           | 基础          | 已有 WorkspaceSwitcher/AccountMenu；新增固定头部/搜索/底部插槽和本地进度示例；真实账户/同步服务由应用提供，不属于 UIKit 缺口                                                                                |
| 路径导航     | Breadcrumb、PathControl、返回/前进、历史状态                | 基础          | 已有 Breadcrumb、PathControl 与中间段溢出；缺返回/前进与历史状态                                                              |
| Tabs         | 标签页、分段控制、关闭/新增、重排、溢出                     | 基础          | 新增 DocumentTabs 关闭/新增/键盘重排/横向溢出；缺鼠标拖放、标签列表菜单与文档恢复                                |
| 树与大纲     | TreeView、OutlineView、展开、选择、懒加载、拖动             | 基础          | 已有 TreeView 与 LazyTreeView 分支状态、失败重试和版本锁；缺虚拟化、拖放和滚动锚定                            |
| 分栏布局     | SplitView、双栏、三栏、嵌套分栏、可调整分隔条               | 基础          | 已有横纵 SplitView、拖动/键盘/取消/折叠；新增有明确尺寸的两栏/三栏/Inspector 与收起策略；缺自动测量和 OS 恢复                                       |
| 检查器       | Inspector、属性分组、详情面板、辅助侧栏                     | 基础          | 已有 Inspector/Section 与可关闭示例；缺复杂属性编辑和辅助栏模板                                                  |
| 工具栏       | 标题、动作组、搜索、分隔、溢出、自定义                      | 基础          | 已有 ButtonGroup、SplitButton、ToolbarActions 与分页溢出；缺自动测量和自定义工具栏                                                                            |
| 菜单         | DropdownMenu、ContextMenu、子菜单、勾选项、分组、快捷键标签 | 基础          | 已有统一命令菜单、右键与逐级子菜单；缺级联悬停、typeahead、鼠标坐标定位                                          |
| 命令系统     | CommandPalette、CommandRegistry、快捷键、启用/禁用          | 基础          | 已有 registry、关键词搜索与原生面板；缺快捷键注册/冲突/作用域仲裁                                                |
| 应用菜单栏   | macOS 应用/Edit/View/Window/Help 菜单与 responder 关系      | 宿主适配      | UIKit 没有应用菜单适配；不能用窗口内横排菜单冒充                                                                 |
| 弹层基础     | Popover、Dropdown、嵌套层、碰撞回避、外部点击               | 基础          | 新增 Popover、焦点范围/恢复、外点击；Dialog/Popover 已有 renderer 内托管层与嵌套恢复；原生 Select/Tooltip 与自定义层未纳入                                                |
| 对话与面板   | Dialog、AlertDialog、Sheet、Drawer、确认、嵌套模态          | 基础          | 已有 Dialog 及六个对话/面板组合和托管层；缺 OS sheet、系统对话与跨窗口仲裁                                                                       |
| 通知反馈     | Toast 队列、自动关闭/暂停、进度通知、可撤销动作             | 基础          | 已有应用内队列、计时/暂停、异步动作与撤销；缺历史持久化、系统通知和 AX 公告                                                                         |
| 加载与进度   | Spinner、线性/环形进度、Steps、Skeleton                     | 基础          | 已有线性/环形进度、任务行/分页列表/汇总；新增八点 LoadingIndicator 动画、reducedMotion、ProgressSteps 与 ActivityGauge                                                                                    |
| 列表 | ListView、分组、单/多选、加载/空状态、可变高/虚拟列表 | 基础 | 已有 ListView 与 AsyncListView 加载/空/错误/刷新和当前页选择；缺不定高、虚拟化、分组和拖放 |
| 数据表格     | 排序、筛选、单/多选、列宽、固定列、编辑、虚拟化             | 基础          | 新增 DataGrid 排序描述、选择、列宽和字符串单元格编辑；缺冻结列、多列排序、范围编辑/公式/虚拟化                   |
| 集合视图 | Grid/CollectionView、卡片选择、键盘、拖动重排 | 基础 | 已有 100 项当前页网格、卡片、二维键盘与范围选择；缺虚拟化、拖放、瀑布流与交互卡片 |
| 筛选与搜索 | FilterBar、SearchBar、条件编辑器、保存视图 | 基础 | 已有一层 all/any 类型化条件、草稿提交和保存视图操作；缺嵌套组、多值/范围关系及更多操作符；远程执行和持久化由应用提供 |
| 头像与身份   | Avatar、Group、在线状态、加载失败回退                       | 基础          | 仅单头像；网络图片失败回退未实现                                                                                 |
| 卡片与指标   | Card、StatCard、Metric、趋势、标题与操作区                  | 基础          | 新增 MetricCard 数值、变化与趋势语义；计算、单位格式与业务口径由调用方提供                                       |
| 图表         | Line、Area、Bar、StackedBar、Pie、Donut、坐标轴/图例        | 基础          | 已有分类图表、正负堆叠、图例/键盘与空/异常状态，新增多系列 RadarChart；缺连续/时间轴、缩放、导出、大数据与完整 AX                   |
| 活动与时间线 | ActivityFeed、Timeline、分组、状态和加载更多                | 基础          | 已有事件模型、相邻分组、状态、动作和加载更多；缺虚拟化与动态相对时间；远程数据层由应用提供                                 |
| 消息与对话   | Message、Conversation、Composer、附件/引用/流式状态         | 基础          | 已有气泡/列表、引用、附件元数据、流式状态与提交锁；缺历史虚拟化、滚动锚定与富文本；实际传输由应用提供                      |
| 富内容       | Markdown、Code、Diff、富文本编辑器、链接动作                | 基础          | 新增 CodeBlock/DiffView 原生预览与差异折叠；新增 RichTextEditor 原生块编辑、格式、链接、历史与注入表面；缺任意内联选区和完整编辑引擎                                 |
| 图片与预览   | Image、ImageViewer、Zoom、Gallery、文档预览                 | 基础          | 仅 Avatar 内使用 img，没有通用预览组件                                                                           |
| 文件交互     | DropZone、FileList、上传状态、Open/Save panels              | 基础/宿主适配 | 新增 FileUploader 请求锁、分页和失败重试，ImagePicker/Viewer；已有注入文件位置端口，缺原生拖入；真实上传服务和权限策略由应用提供                   |
| 编辑能力     | Undo/Redo、复制粘贴、查找替换、选择、拖放                   | 宿主适配      | 宿主编辑器局部支持不等于 UIKit 有统一接口                                                                        |
| 窗口与文档   | 多窗口、标题栏、文档修改状态、恢复、设置窗口                | 基础          | 新增尺寸/标题/激活适配与失败结果；尺寸已原生验证，标题/激活仅转发验证；文档生命周期/多窗口恢复仍缺               |
| 系统集成     | 剪贴板、菜单栏状态项、通知、系统主题与强调色                | 宿主适配      | 需按平台探测，不创建伪成功实现                                                                                   |
| 无障碍与输入 | 语义、屏幕阅读器、键盘范围、IME、减少动态效果               | 基础          | 已验证部分键盘路径；没有完整 AX/IME 适配验证                                                                     |
| 应用模板     | 设置、文件管理、邮件三栏、数据管理、仪表盘、对话            | 基础          | 已有 Workbench/Studio 示例与 Dashboard/Conversation/Settings 布局插槽；新增 Mail 三栏与 Files 来源示例；组合示例仍需完善；真实设置/文件/邮件业务系统不属于首版          |

## 先修正的架构

现有按 base/layout/data/feedback 分类的文件夹可保留，但 framework 还应具备：

- `interaction`：选择模型、键盘导航、快捷键与命令、焦点范围、拖动、overlay 栈。
- `platform`：系统菜单、窗口/文档、剪贴板、文件面板、外观与无障碍端口，以及受能力探测控制的 GPUIX 适配。
- `components`：按组件族划分目录；分离状态逻辑、原生视图、tokens 与测试，不继续把所有组件塞进分类 index.tsx。
- `patterns`：侧栏家族、三栏窗口、设置与管理应用组合；通过公共 API 消费基础组件。
- `catalog`：每个组件族有用法、变体、状态、键盘说明、能力要求和测试证据。

`platform` 可依赖原生系统适配；视觉组件不直接访问文件系统或数据库。涉及 GPUIX 0.7.0 缺少的能力时，需明确做宿主扩展或标记未支持，不能用演示控件替代。

## 组件能力完成标准（首版仅验收纳入清单的范围）

组件族只有同时具备下列内容才能从“基础/缺失”变成“完成”：

1. 明确的公开 API、状态模型和功能边界。
2. 适用的默认、hover、pressed、focus、selected、disabled、loading、error、empty 状态。
3. 深浅主题、长文本、窄窗口、高密度及数据量边界。
4. 鼠标/键盘行为、焦点进入/退出、受控状态和事件语义。
5. 文档、完整可操作示例、原生交互测试和实际截图。
6. 有系统依赖时，完成真实平台适配与联调，并列出未验证平台。

每个组件族的变体不重复计作多个“已完成组件”；CardHeader/Provider 等辅助导出不用于衡量组件覆盖率。

## 实施顺序

- 第一批：导航家族、分栏/Inspector、命令与菜单、Overlay 基础、多选与 ComboBox、数值/日期输入。这些是当前桌面 app 的主要缺口。
- 第二批：列表/树/高级表格、筛选、文档 Tabs、表单体系、文件与内容预览。
- 第三批：图表、活动/消息组件与完整应用模板；同时推进平台桥接和无障碍专项。

以上为历史实施顺序。当前 0.19.0 以 85 类目录映射为组件范围；全景矩阵中的长期增强不被宣称完成。

## 首版之后保留的 UI 路线

- 桌面交互：托管栈之外的宿主弹层协作、快捷键作用域/冲突、工具栏定制和导航附属区。
- 高数据量：虚拟集合、树滚动锚定与分支分页、表格冻结列和更多编辑类型、文档/集合拖放、消息历史锚定。
- 高级控件：富文本内联选区/代码编辑、日期时间/时区、嵌套筛选、图表缩放与连续时间轴。
- 原生体验：系统材质/菜单、平台适配、完整 AX/IME 和 Windows/Linux 原生验收。

这些属于保留的 UI 能力，不是后台服务。首版发布既有组件的已文档化能力，不等待所有长期增强；业务系统不作为 UIKit 缺项。每批仍按状态、键盘、主题与真实宿主证据验收。

版本编号按整数递增：v0.17.0 → v0.18.0 → v0.19.0，不把 minor 当小数。
