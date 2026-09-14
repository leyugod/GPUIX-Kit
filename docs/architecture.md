# 架构

`packages/uikit` 是唯一交付给其他应用的包，名字为 `@mirai/gpuix-kit`。
`apps/gallery` 是独立消费者，所有示例数据留在内存；不访问 CRM 目录或其服务。

依赖方向：gallery → UIKit → React / GPUIX。

首个 GitHub 开源版本以[首版范围](plans/first-open-source-release.md)为验收依据：组件、纯模型和适配接口属于库，业务服务属于消费应用。示例使用内存数据；平台接口、已实现适配和不支持能力应明确区分。

- core/tokens：纯 TypeScript 语义色、间距、半径、字号、控件尺寸与规则。
- core/theme：受控主题 Context；可覆盖 Colors。系统主题检测和持久化由应用负责。
- core/focus：原生控件 ref 与弹窗焦点范围适配。
- base：Text、Stack、Row、Button、输入、选择等基础控件。
- layout：卡片组合、工具栏、侧栏、分段选择、Tabs、Accordion、AppShell。
- data：Badge、Avatar、Progress、Skeleton、Table、Pagination、Markdown。
- feedback：Alert、EmptyState、可受控关闭的 Toast。
- overlays：GPUIX Tooltip 包装，以及放在 AppShell.overlay 中的 Dialog。

API 约定：`onPress` 表示激活意图；`value/onValueChange` 与 `checked/onCheckedChange` 表示受控状态；`testId` 是稳定测试入口。
没有 className 或任意 DOM props；样式扩展使用 GPUIX StyleDesc。原生 Text 明确指定颜色，输入与 Markdown 显式提供 theme。

Table 接收已分页 rows，分页/查询/排序由使用方管理，不在组件内部加载完整数据集。正文滚动由使用方选择唯一容器。Dialog 的背景阻挡点击与滚轮；统一键盘处理将 Tab/Shift+Tab 导回范围内已注册的 UIKit 控件，关闭后使用显式 restoreFocusRef 归还焦点。混入自定义原生控件时通过公开 /focus 的 useFocusTarget 转发 ref 与事件；不要把浏览器组件放进弹窗。

无 CSS backdrop-filter / Framer Motion 依赖。当前表面通过实色、细边框与原生阴影表达层次，不声称实现真实背景毛玻璃或 spring 动画。

0.7.0 TestRenderer 的程序化 focusElement 没有派发 focus/blur，原生 Tab 事件也不能按浏览器默认行为假定。UIKit 通过实际键盘/鼠标事件和原生 focusElement 管理交互焦点，Dialog 单独循环本范围的控件。原始 native 子节点不自动获得此行为。

## v0.2 桌面增量

新组件按组件族放入 components/navigation、split-view、popover、menu、command、combobox、value-input。各族通过独立公开子路径导出；原 base/layout 等入口保持兼容。interaction/commands 是纯 TypeScript 命令模型与 registry，不读取宿主或注册快捷键。

ComboBox/MultiSelect 使用原生 input 与公共 anchored JSX，并由 UIKit 管理筛选、禁用项、键盘高亮和焦点；不依赖宿主 Combobox 的挂载时序。Popover 单独建立焦点范围，外点击不强行恢复触发器焦点。Dialog 增加 initialFocusRef 与 bodyScrollOffset，供命令面板设置初始编辑器和高亮滚动位置。Button/Input 的 onKeyDown 可返回 true 消费键盘行为，供嵌套选择器先处理 Escape。

SplitView 在拖动期间使用窗口范围的 anchored 捕获层，结束或 Escape 时销毁；应用负责约束实际容器大小与保存 size。桌面 Gallery 是独立页面入口，所有命令、选择和布局仍只修改示例内存。

当前尚无全局 overlay 栈、完整系统平台桥、快捷键冲突仲裁或 AX 适配。逐级子菜单使用单一浮层，避免暗示已具备 macOS 悬停级联行为。

## v0.3 数据工作台增量

interaction/selection 提供选择、可见树展开、排序描述与稳定排序、文档关闭回退规则。ListView、TreeView 和 DataGrid 共享这些规则；输入是当前页数据，不自动加载或保存。DataGrid 发出排序描述，应用先处理全量结果后分页，避免错误地对单页排序。

DocumentTabs 的值和顺序均受控；未保存文档的关闭决定属于应用。useForm 保持 values 在应用层，内部仅管理同步规则、焦点与 Promise 提交状态。原生焦点操作继续通过 core/focus，异步结束后检查组件生命周期。

content 使用固定宿主的 code/diff 元素显示传入文本，文件控件只有状态和动作端口。FilePickerArea 不声明系统文件选择/拖入能力，示例明确使用内存数据。新 Workbench Gallery 通过公开包子路径之外的根导出消费组件，与原有两个 Gallery 入口并存。

ListView 当前不是虚拟列表；调用方应分页并约束行高。高级表格虚拟化、行拖放、系统文件服务、全局快捷键与无障碍适配继续在覆盖矩阵中保留。

## v0.4 图表与消息增量

charts/model 是纯 TypeScript 数据校验和几何计算；charts 使用原生 div 与 SVG 路径分层绘制，文字仍通过 Text。传入数值和有限十六进制颜色，不接收外部 SVG 标记。分类图表限制 200 类别、12 系列，饼图限制 50 项；调用方先聚合数据。像素尺寸由调用方根据实际布局提供，不调用 DOM 测量。

MetricCard 不计算业务指标。Timeline 接收已分组的当前页事件和格式化时间。MessageList 接收当前消息窗口，应用控制 followTail 与历史加载；composer 在激活时创建草稿快照、锁定重复提交，并将 Promise 失败反馈到 UI。组件不会清空受控草稿、发送请求或持久化；应用在成功回调后更新数据。附件仅为元数据，Stop 只发出停止意图。

patterns 是可组合布局插槽；Dashboard 自带单一纵向滚动，Conversation 不增加外围同轴滚动，消息插槽须自己约束高度。Settings 固定导航和独立内容滚动，尚未完成独立设置应用场景验证。

platform/createWindowAdapter 仅映射固定宿主公开的尺寸、标题与激活方法，捕获失败并返回结构化结果。capabilities 的 false 表示 UIKit 尚未映射该能力，不代表操作系统不支持。窗口尺寸已在原生测试验证，标题/激活只验证方法转发，系统菜单/文件面板/剪贴板/AX 仍未封装。

## v0.5 精确值与日期控件

slider/model 统一步长对齐和键盘增量。Slider/RangeSlider 值由应用控制，拖动期间仅保存起点快照，鼠标释放发出 commit，Escape/Tab 恢复快照。固定 length 用于将原生窗口坐标差换算成值；不假定存在 DOM 测量、局部鼠标坐标或轨道点击命中服务。双拇指顺序固定、不可交叉。禁用或轨道参数改变会销毁拖动捕获层。

calendar/model 以公历日期字符串为边界，用 UTC 整数日运算避开本地时区与夏令时；不使用机器时间推断 today。月份和值分别受控。网格作为单一键盘焦点，日单元通过指针选择；范围选择逐日校验禁用条件并限制区间长度。DatePicker/DateRangePicker 复用 Popover，挂载时聚焦网格，Escape 关闭当前弹层并恢复触发器。

截图发现固定宿主 anchored 未显式指定透明背景时，圆角外露出黑色底色。Popover 在 anchored 层显式使用透明背景和圆角，内容阴影、滚动与焦点实现保持原有结构；已单独复核原生截图并回归公共弹层交互。

## v0.6 三态选择与标签输入

Checkbox 扩展 checked 为 boolean | indeterminate，激活 indeterminate 时发出 true；Switch 仍保持布尔值。checkbox/model 仅计算当前可操作范围的状态和批量变更，保留范围外及禁用项的选择。CheckboxGroup 不加载全部结果，调用方传入当前范围。

tags/model 对完整草稿做拆分、NFC 规范化、去重、数量/长度与应用规则校验，通过后才生成一次值变更。工厂和校验必须同步且无副作用。TokenField 的集合和草稿均受控；应用负责立即更新视图数据，再处理异步持久化。标签组件没有剪贴板、数据库或建议请求。

固定 GPUIX 原生编辑器提前消费 Backspace 和左右方向键，TokenField 因此用 Shift+Tab 进入标签，标签节点自身支持方向键、Backspace/Delete 和 Escape。原生 Tab 还会报告制表符插入；TokenField 抑制该次应用回调，并通过 Input.resetKey 重建原生编辑器恢复草稿。这会重置原生撤销/光标历史，未扩展成通用编辑器语义保证。

Input/Textarea 新增可选 resetKey，React 组件与焦点注册保持挂载，仅重建内部宿主编辑器。useFocusTarget 记录首次注册顺序，Dialog/Popover 按组件顺序移动焦点，避免宿主 ID 改变后将编辑器排到末尾。新增原生回归验证重建后 editor → Add → following control 的顺序；此历史批次未建立 overlay 栈；v0.14 的托管层边界见下文，AX 仍未适配。

## v0.7 时间控件

time-input/model 使用分钟整数与严格 HH:mm 字符串，校验同日边界、从 min 对齐的步长和同步禁用规则。组件不读取系统时钟或进行日期/时区转换。TimeField 原始草稿受控，Enter/步进才发出合法提交；TimeList 将候选数据和八行原生视图分离。TimePicker 组合 Popover 与列表，不实现独立浮层服务。空列表保留焦点，确保 Escape 先关闭时间弹层。

时间输入复用 Input.resetKey 处理固定宿主的 Tab 制表符插入，保留组件注册顺序，原生撤销/光标历史会重置。该限制不扩展为完整原生编辑语义保证。业务保存、时区、夏令时、跨午夜规则与日期时间组合属于后续层次。

## v0.8 滑块轨道与刻度

Slider/RangeSlider 继续共享 SliderControl，新增只读、刻度数据与可选 trackPress。slider/model 将停靠值中点转换为局部命中区域，由原生布局系统决定点击目标；不查询元素窗口位置。为限制宿主节点数，轨道点击最多 201 个停靠值，刻度最多 51 项。默认关闭 trackPress，原有细步长拖动和键盘保持兼容。

轨道点击移动最近拇指并恢复该拇指焦点；距离相同使用最近操作索引，重合范围按移动方向展开。刻度不参与交互，标签按邻居限制空间；不引入新的滚动、业务或系统服务。

## v0.9 日期导航与范围组合

calendar/grid 与 types 从原单文件提取，单月和双月共用日期绘制、禁选与键盘模型；根导出不暴露内部网格。period-picker 只依赖纯日期模型，提供独立月/年网格；CalendarGrid 可选择使用年月导航，没有循环依赖。

双月组件管理可见窗口内的活动日期与左右焦点，跨窗口导航仍由应用更新 month。年月视图期间保留日期网格与头部的组件身份，隐藏且禁用其焦点注册，返回时恢复原顺序。清除草稿后将焦点移到取消按钮，避免当前按钮禁用后丢失 Escape 路径。

DateRangePresets 的数据源是调用方给出的范围；内置预设生成器必须接收明确参考日。DateRangePanel 管理独立草稿，只有 Apply 输出完整合法范围；Cancel 不回写，外部日期值改变时同步草稿。DateRangeDialog 只组合已有 Dialog，不另造模态管理服务或持久化层。

版本继续使用 v0.x.0，v0.9.0 后为 v0.10.0；后续按多组件组合批次推进。

## v0.10 桌面动作与导航组合

components/actions/model 保持纯 TypeScript：校验集合、过滤隐藏项、划分工具栏/路径溢出和选择键盘目标。六个公开组件使用同一动作描述与内部平面 ActionMenu，复用已有 Button、Text、Popover、焦点范围和主题 tokens；内部菜单不公开为第七个组件。

ActionMenu 每页最多六项；应用更新集合时修正页码与不可用焦点。菜单自己选择初始受控选中项，关闭 Popover 的默认首项 autofocus，避免两套初始焦点竞争。空/全禁用页保留可聚焦关闭入口。旧 DropdownMenu/ContextMenu 的多级菜单 API 保留；新的平面组合不宣称完整菜单系统。

宽度/visibleCount 由布局所有者提供，不读取缺失的原生测量 API。run、onNavigate、onValueChange 都是应用意图边界；不引入认证、文件系统、路由、网络或持久化。版本当前 v0.10.0，后续 v0.11.0。

## v0.11 颜色组件与组合交互

components/color/model 只处理严格十六进制解析、8 位 RGBA 通道、预览合成和有界调色板规则。ColorField/ColorPanel 的草稿可以暂时非法；ColorPicker 隔离本地草稿，只有 Apply 或显式 Clear 发出应用值。没有系统取色、颜色配置、剪贴板或持久化依赖。

ColorSwatch 通过不透明原生单元合成透明棋盘；ColorWell 和 ColorPalette 使用独立命中层覆盖装饰子树。ColorPanel 用零高度裁切且禁用隐藏控件来保持焦点注册身份；不依赖 fixed host 的 display:none 行为。

Slider/RangeSlider 新增默认开启的 showValue，用于面板关闭重复值显示。嵌套 Popover 中拖动捕获层临时持有原生焦点，每次受控重绘后再次确保焦点；取消/释放恢复拇指，Tab 取消后按所属 scope 移动。捕获层不加入常规 Tab 注册表，避免临时节点改变持久控件顺序。

版本当前 v0.11.0，下一批 v0.12.0。系统颜色面板、二维 HSV/HSL、渐变、广色域和完整 AX 继续列为缺项。


## v0.12 通知生命周期与任务反馈

notifications/model、task-progress/model 保持纯 TypeScript；队列控制器通过 NotificationClock 注入单调时钟和计时器，仅消耗已显示项的剩余时间。原生视口订阅不可变快照，默认 inline；浮动模式使用已有 anchored，不引入全局 overlay 栈。

异步动作以身份和 revision 隔离，执行前同步锁住重复调用。卸载后不更新视图或触发成功，但仍释放队列 busy/hover 暂停；同 id 替换不能被旧回调删除。UndoToast 的受控可用状态也参与身份校验，过期后旧成功不回写 undone。

TaskList 仅挂载当前页，状态和进度全部由应用提供。取消、暂停、重试、撤销均为意图回调；UIKit 不承担任务运行、事务、传输或持久化。任务汇总以成功任务数计比率，不混合任务单位。环形未知进度为静态表达，不假装动画或真实进展。

版本当前 v0.12.0，下一批 v0.13.0。


## v0.13 标签建议与编辑组合

components/token-input/model 复用原 token 规则，分别处理建议身份、目录匹配、自由创建冲突、保留 ID 的改名和保护清除。候选目录有界为 500，当前标签集合沿用 maxTokens 上限 100；两者均非远程服务。

TokenSuggestionList 用稳定根焦点和分页限制原生行数，行不加入常规 Tab 顺序。TokenCombobox/TokenPickerPanel 共享内部 TokenChooser；面板使用内联候选，避免再叠一层弹层。原 TokenField 保留独立批量拆分语义。内部 TokenInput 复用既有 resetKey 修复 Tab 插入，同时明确撤销/光标重置限制。

EditableTag 的编辑身份包含 ID、名称与保护标记，外部变化结束旧草稿。TokenEditor 删除前聚焦稳定根，整个集合参与改名判重；清除只移除可删除项。TokenPickerPanel 持有临时选择，Apply 才发出应用更新，外部快照变化立即替换旧草稿。

回调与校验同步，应用负责受控更新、远程请求竞态及持久化。没有新增业务、文件、数据库和系统编辑 API 依赖。v0.13.0 后为 v0.14.0。

## v0.14 对话与面板层级

纯 layer-model 分配稳定层 ID、父层与优先级，保留不可变排序快照；每个 NativeRenderer 对应一个弱引用注册控制器。Dialog/Popover 挂载后在微任务中决定唯一初始焦点，消除子 effect 先于父 effect 的竞争。卸载后的微任务等整个分支清理完，只允许仍有效的父层触发器或根层外部触发器恢复。无父层关系的兄弟层不自动推断恢复目标，未托管的 Select/Tooltip/自定义 anchored 不计入该栈。

ModalSurface 共享居中、顶部与边缘布局，六个业务无关组合复用输入、按钮和 TaskProgress。Confirm/Prompt 使用异步身份锁隔离旧回调；Prompt 将原样提交后的受控值回写识别为确认，其他外部替换使旧结果失效。revision 由应用提供，UI 不负责取消实际任务。

固定宿主会向祖先重新派发 keydown 并改写 elementId，根节点因而只在 UIKit 记录的焦点确属自身时处理 Tab/Escape，避免子编辑器移动两次。getManagedFocus 不是 OS/AX 焦点查询。Slider、SplitView、DataGrid 的捕获层使用所属层相对优先级，继续保留拖动取消和焦点恢复。

Sheet/Drawer 都在单个原生窗口内，不创建 AppKit 窗口。当前 v0.14.0，下一批 v0.15.0 优先[Apple 风格侧栏](plans/apple-sidebar.md)。

## v0.15 来源侧栏与导航分栏

source-list/model 使用有界的平面分组与稳定 ID，将可见行、可用键盘目标、选择回退和固定行高滚动分开。SourceListSidebar 的正文是唯一 Tab 入口，行末操作以 Right 进入、Left/Escape 返回；嵌套动作已处理的按键由微任务标记隔离，避免固定宿主重派到正文后重复导航。正文和三个固定附属插槽分离，应用负责插槽内容与搜索数据。

navigation-split/model 仅计算可见列和宽度；自动收起 Inspector、侧栏、集合不会回写应用偏好。组件复用 SplitView，隐藏列卸载，业务草稿必须在应用层受控。SourceListSidebar 不是虚拟列表，100 项以上的业务集合应进入中间列分页或后续集合控件。

core/focus 新增区域登记与已记录焦点订阅。区域覆盖 UIKit useFocusTarget 控件，包括不进入 Tab 顺序的行末动作；NavigationSplitView 在持有焦点的列被移除时才使用显式 fallbackFocusRef。该机制不探测 OS/AX；原生编辑器消费且未转发的指针/End 等事件不保证被观察到。不能用父容器冒泡事件替代原生焦点登记。

SplitView 修复受控折叠/禁用发生于拖动过程时残留捕获层的问题。保留既有拖动、键盘与 Escape 取消，原生回归已按本批记录验证。系统材质、SF Symbols、多账户服务和完整 AX 继续作为明确缺项。列表/树状态及集合展示在 v0.16 继续扩展。

## v0.16 集合与异步资源

collection/model 处理当前页身份、有限网格尺寸和二维键盘目标；collection 复用 selectItems，使用固定高度行与单一滚动容器。卡片为呈现插槽，透明命中层统一选择与激活，不支持插槽内嵌编辑器。删除和换页后的受控选择由应用决定。

resource-state/requests 是内部生命周期锁：资源 identity、动作 key 与唯一 Symbol 隔离重复、过期和卸载回调。LazyTreeView 使用整个已加载快照的节点请求 key，因此折叠不释放隐藏分支的锁。树全量快照校验覆盖隐藏重复/循环、200 节点和 9 层边界；加载结果由应用回写 children/loadState，UI 不负责请求取消或数据缓存。

ResourceState、LoadMoreButton 在请求开始前聚焦稳定根入口；嵌套按钮用微任务标记隔离宿主祖先 keydown 重派。AsyncListView 复用原 ListView，首载/错误/空时切换资源状态，刷新时保留列表，统一 disabled 禁用行与重试。本批没有修改公共焦点底座，也没有引入 DOM/网络/文件服务。

筛选条件与保存视图组合在 v0.17 增量实现；虚拟化、拖放、滚动锚定、平台桥和完整应用模板仍按覆盖矩阵逐项推进。

## v0.17 筛选与保存视图

filters/model 是纯 TypeScript 表达式模型，依赖现有公历日期规则，不导入 React 或原生视图。结构校验和可提交值校验分开，允许空/无效/超长草稿继续编辑；字段、条件、视图各自具有数量与身份边界。表达式只描述一层 all/any，执行与持久化不在 UIKit 中。

filters 复用 ActionMenu 的六行分页和焦点规则。FilterBuilder 只挂载当前 1–3 条件，不增加纵向滚动；FilterPanel 按外部表达式/字段/revision 重建草稿，提交提供克隆快照并保留外层焦点。内部事件边界隔离原生祖先 keydown 重派；焦点顺序按子节点优先注册的实际宿主 ID，而非 DOM 假设。

SavedViewPicker 复用 v0.16 请求锁，所有修改操作共享当前快照锁，等待时禁止再保存或改名。应用修改目录、选择、筛选或 revision 后隔离旧内部结果；实际请求取消和陈旧响应写入仍由应用处理。视图只读/禁用为 UI 约束，不承担服务端授权。示例查询只存在于 Gallery，不作为通用查询编译器。

v0.17 的后续表格偏好已于 v0.18 纳入首版清单；长期增强见覆盖矩阵。

## v0.18 表格偏好、宿主接口与首版交付

components/table-preferences/model 保持纯 TypeScript，校验完整列目录、锁位、显隐、三层排序与密度。组件复用 ActionMenu 和 DataGrid；ConfigurableDataGrid 只映射视图，不执行查询。DataGrid 从 model 引入行高，避免反向导入组合视图。应用先排序后分页，通过显式 reconcileTablePreferences 迁移偏好。

TablePreferencesPanel 按 columns/value/revision 隔离草稿，提交复制快照，稳定外层焦点入口在动态节点消失后保留。局部边界隔离祖先 keydown 重派，未修改公共焦点底座。

platform/host 捕获消费应用可选端口、校验输入与结果、复制请求与数组、返回 unsupported/invalid/cancelled/failed。没有真实剪贴板、文件或存储实现；createWindowAdapter 保持原能力语义。

首版清单见 releases/0.18.0.md。API 索引由 TypeScript 公共 exports 生成；原生 runner 顺序执行并记录结果；源码归档用允许列表排除依赖和本机产物。只读 CI 执行规则检查，原生图形验收在本地 macOS 会话执行。

## v0.19 目录补齐

按官网三组共 85 个类别映射公开组件，完整性检查与运行时回归分开。catalog-model 和 event-calendar/model 处理纯输入契约；组件复用基础控件、请求锁和语义主题。二维码以固定纯编码器生成，实际截图由独立解码器验证；GPUIX SVG 按蒙版着色，QR 背景和雷达/仪表各颜色拆层。渐变由原生线性背景组合。

媒体与文件接收受控状态和宿主动作；视频表面不冒充实际解码器。富文本默认原生分块编辑，支持插入应用提供的编辑表面；不引入 DOM。营销区块只提供展示/表单/操作意图。单独事件日历处理日期覆盖和选择，不混同日期选择器。详见 packages/uikit/docs/catalog-completion.md。

## 单行输入垂直对齐修复

固定 GPUIX 0.7.0 的编辑器内部按自身行高布局，单独设置控件 height 不会把文字居中。公共 useInput 显式使用 display:flex 和 alignItems:center，使额外高度平均分配到上下；Textarea 使用 flex-start。保留原生编辑器的焦点、输入和光标，不通过重建、位移或字号相关 padding 补偿。原生截图测试直接测量字体可见像素，防止样式存在但宿主没有执行的假通过。
