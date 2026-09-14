# 第二批：数据工作台组件 · v0.3.0

本批增加列表/树、数据表格与筛选、文档标签页、表单控制器和文件/内容预览基础。全部使用 GPUIX 0.7.0 原生 JSX，继承 UIKitProvider 的深浅主题。组件族仍为基础能力，不代表完整桌面框架已完成。

## 公开入口与状态

| 入口             | 组件/工具                                                                        | 主要 API                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/list-view`     | ListView                                                                         | items、selectedIds/onSelectionChange、selectionMode、renderItem、onActivate、height、rowHeight、loading                                    |
| `/tree-view`     | TreeView                                                                         | nodes、expandedIds/onExpandedChange、selectedIds/onSelectionChange、onRequestChildren、onActivate                                          |
| `/data-grid`     | DataGrid、sortRows                                                               | 当前页 rows、columns、rowKey、rowDisabled、sort/onSortChange、selectedIds/onSelectionChange、columnWidths/onColumnWidthsChange、onCellEdit |
| `/filter-bar`    | FilterBar                                                                        | value={query,values}、onValueChange、filters、disabled                                                                                     |
| `/document-tabs` | DocumentTabs、closeDocument                                                      | tabs、value/onValueChange、onClose、onAdd、onReorder、tabWidth                                                                             |
| `/form`          | useForm、FormSection、FormErrorSummary、FormActions                              | values/onValuesChange、rules、onSubmit；field(name)、errors、submitError、submitting、submit、focusField                                   |
| `/content`       | CodeBlock、DiffView、ContentPreview、FileList、FilePickerArea                    | 原生代码/patch 数据、文件状态、应用动作回调                                                                                                |
| `/selection`     | selectItems、togglePageSelection、flattenTree、nextSort、sortRows、closeDocument | 脱离渲染器运行的纯 TypeScript 规则                                                                                                         |

所有交互组件要求唯一 testId。记录 id、列 id、树节点 id、文档 id 在相应集合中唯一。列表/表格传入当前页数据；本批不实现大型数据虚拟化，不负责下载全部数据、查询数据库或保存状态。

## 列表、树和表格

ListView 的 item 至少包含 `{id,disabled?}`，renderItem 收到 selected/active。列表固定行高，方向键使用实际项目索引调整滚动。行内容应在 rowHeight 内完整显示；多行不定高布局应另建组件。height/rowHeight 必须为有限正数，避免放入同方向的外层滚动容器。

- 单选替换选择；多选的 Command/Control 点击切换单项。
- Shift 点击/方向键选择锚点到目标之间的可见可用项；Command/Control+Shift 增选范围。
- 普通范围替换选择，增选保留其他分页中的选择；禁用项不会被选中。
- Up/Down、Home/End、PageUp/PageDown 移动并选择；Space 切换当前项；Enter/double-click 发出 onActivate。
- Command/Control+A 增选当前页全部可用项。selectionMode="none" 只管理活动行，不发出选择变更。
- loading 时隐藏数据行并阻止激活；空列表显示 emptyLabel。

TreeNode 为 `{id,label,disabled?,children?,hasChildren?,loading?}`。展开模型是受控 id 数组。Right 展开分支或进入第一个可用子项；Left 收起当前分支或回到父项。未提供 children、hasChildren=true 的节点展开时发出 onRequestChildren，应用负责加载、取消、错误和填回数据；loading 状态用省略号显示。递归数据转为可见的平面行，保留深度/父节点；可见重复 id 或循环引用会抛出错误。不会自动加载网络数据。

DataColumn 定义 `{id,header,value,render?,width?,minWidth?,maxWidth?,sortable?,editable?,validate?}`。排序列头依次发出 asc → desc → null，**DataGrid 不在内部仅排序当前页**。应用先在完整结果上筛选/排序，再分页；远端数据应把描述传给服务器。sortRows 返回新数组，保持同值稳定顺序，null/undefined 在两个方向都置后。

表头保留在垂直行滚动区之外；横向滚动区包裹表头和行。列宽支持鼠标拖动与 Left/Right/Home/End，Escape 取消拖动。列宽是受控像素值；应用约束 min/max 并持久化。选择页操作仅增加/移除当前页可用记录，保留其他页选择。

点击 editable 单元格进入原生输入；Enter 验证并发出 onCellEdit，Escape 放弃草稿并归还焦点。validate 返回非空错误文本时显示输入无效边框并阻止提交；详细错误文案应由应用展示。回调值为字符串，类型转换、服务端失败和并发写入由应用负责。记录禁用时不能编辑。此版本没有单元格范围选择、公式、冻结列、多列排序、行拖放或异步保存状态。

FilterBar 的下拉空值 `""` 保留为“全部”，options 不应重复占用该值。组件只发出 query/values，调用方负责重置分页和执行筛选；没有保存视图或条件表达式编辑器。

## 文档标签页

DocumentTab 为 `{id,label,dirty?,closable?,disabled?}`。dirty 显示修改标记，**不自动弹出确认**；onClose 是关闭请求，应用应先处理未保存内容，再更新 tabs/value。closeDocument 是可选的状态计算工具：关闭活动文档时选择右侧可用邻居，再退回左侧，没有可用文档则返回 null。示例仅为内存数据，直接关闭。

Left/Right/Home/End 切换并聚焦可用标签；Command+W 请求关闭当前可关闭文档。提供 onReorder 时，Alt+Left/Right 发出重新排列的完整 id 数组；没有鼠标拖放重排。关闭后焦点回到受控活动文档。固定 tabWidth（默认 124px）保证键盘切换时能定位横向滚动；长标题截断，未实现标签列表溢出菜单。

## 表单

useForm 处理平面的字符串字段。应用拥有 values，field(name) 返回可直接传给 Input 的 value/onValueChange/ref/invalid/disabled/onSubmit。

```tsx
const [values, setValues] = useState({ name: "", description: "" });
const form = useForm({
  values,
  onValuesChange: setValues,
  rules: {
    name: composeRules(required("Name is required"), minLength(3)),
    description: required("Description is required"),
  },
  onSubmit: async (snapshot) => {
    await saveThroughYourApplication(snapshot);
  },
});
```

submit 校验所有字段，按 rules 顺序聚焦第一个有错误且已注册的字段，不调用保存。校验失败后编辑会重新校验，包括跨字段规则。FormErrorSummary 的按钮调用 focusField。保存期间锁住 field 输出并防止重复提交；onSubmit 获得浅拷贝快照，可以返回 Promise。失败显示 submitErrorLabel（默认通用错误文案），不会伪造保存成功，也不会把异常正文写入日志。组件卸载后忽略异步 UI 更新。onSubmit 的真实业务操作、取消和恢复由应用管理。

外部替换表单值时按需调用 resetValidation；本版没有嵌套字段数组、异步字段校验、dirty/touched 全量模型、撤销/恢复。resetValidation 仅重置校验，不修改 values。

## 文件与内容

- CodeBlock：code/language/path/showLineNumbers/height，原生语法着色和行号；竖向容器与宿主横向滚动组合。不提供文本编辑。
- DiffView：统一 patch、word diff、collapsedPaths/onCollapsedPathsChange、height/maxLines；点击文件头发出折叠状态，Show more 增加显示行数。patch 由应用提供，不执行 git 命令。
- ContentPreview：标题、关闭动作与内容插槽。不是通用格式解码器。
- FileList：FileItem 的 status 为 ready/queued/uploading/failed/complete；显示进度和错误，发出 onOpen/onRetry/onRemove。应用传当前页文件。只有 ready/complete 可打开。
- FilePickerArea：发出 onChoose，可设置 chooseLabel、description 和 disabled。组件没有系统 Open/Save 面板、文件拖入、上传器或文件权限。示例按钮明确为 Add sample file，仅新增内存样例。

## 已验证与缺口

- `test:workbench` / `test:workbench:narrow`：1320×920、1000×720，深浅主题与草稿保持；范围/跨页选择、禁用行、完整结果排序后分页、筛选空态、列宽鼠标/键盘调整、单元格校验/提交、表单错误聚焦、原生代码/差异折叠、文件动作、树展开、文档重排/关闭。
- `test:workbench:states`：空/加载/禁用、重复提交防护、Promise 失败反馈、加载节点请求、关闭后焦点、20 个标签的键盘溢出可见性。
- `test:live:workbench`：真实 macOS ARM64 窗口启动、中文文本注入、深浅切换、截图与关闭。
- 纯规则测试与独立 tgz 消费测试：选择/树/排序/文档/表单规则及新公开入口。

这些证据只覆盖已实现行为。大型列表虚拟化、完整表格编辑器、拖放体系、真实文件服务、完整应用模板、屏幕阅读器、Windows/Linux 和实体 IME 组合输入尚未完成或验证。
