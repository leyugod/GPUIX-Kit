# v0.4 图表、消息与布局

这是第三批基础增量，不代表完整通用桌面 framework 已完成。运行 `bun run dev:studio` 可查看深浅主题示例；示例只修改内存，没有网络发送、文件选择或数据持久化。

## 公共入口

| 子路径         | 主要 API                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `/charts`      | CartesianChart、LineChart、AreaChart、BarChart、PieChart、DonutChart 及 props                                          |
| `/chart-model` | ChartCategory/Series/Datum、validateChart、chartDomain、chartY、categoryX、lineSegments、pieModel、arcPath、chartColor |
| `/metrics`     | MetricCard                                                                                                             |
| `/timeline`    | Timeline、ActivityFeed、ActivityItem                                                                                   |
| `/messages`    | MessageBubble、MessageList、MessageComposer、Message、MessageAttachment、MessageDraft、canSendMessage                  |
| `/patterns`    | DashboardLayout、ConversationLayout、SettingsLayout                                                                    |
| `/platform`    | createWindowAdapter、PlatformResult                                                                                    |

组件与组件类型也从包根导出；低层图表规则从 `/chart-model` 导入。包装组件和 ActivityFeed 别名不算独立成熟组件族。所有组件须置于 UIKitProvider，交互节点传入稳定 `testId`，数据项 ID 在各自集合内唯一。

## 分类图表

```tsx
import { CartesianChart } from "@mirai/gpuix-kit/charts";

<CartesianChart
  testId="weekly"
  width={520}
  height={220}
  variant="stacked-bar"
  categories={[
    { id: "mon", label: "Mon" },
    { id: "tue", label: "Tue" },
  ]}
  series={[
    { id: "gain", label: "Gain", values: [30, 20] },
    { id: "loss", label: "Loss", values: [-8, -12] },
  ]}
/>;
```

- `variant` 为 `line | area | bar | stacked-bar`。LineChart、AreaChart 是包装组件；BarChart 用 `stacked` 切换堆叠。X 轴是等宽类别，日期字符串也仅为标签。
- `width` 默认 520，允许 160–4096；`height` 默认 220，允许 108–2048。都是总图框像素尺寸，调用方负责容器测量。图例和读数位于图框之外，须为整体留出高度。
- `categories: {id,label}[]`、`series: {id,label,values,color?}[]`，每个系列必须与类别数量一致。最多 200 类别、12 系列；有限数值绝对值不超过 1e15。`null` 是缺失值，折线/面积断开，柱图不画该值；不会转换成有意义的零值。
- Y 轴包含零；堆叠图对每个类别分别累加正值和负值。全零数据使用 0–1 显示域。线点、柱与类别标签共用中心坐标。
- `hiddenSeriesIds/onHiddenSeriesChange` 控制隐藏系列；传入回调后图例才成为切换按钮。全部隐藏显示空态，仍保留图例以恢复。
- `activeIndex/onActiveIndexChange` 控制类别高亮；非整数或超出类别范围的值视为未选择，未传 activeIndex 时使用本地临时状态。悬停选择，点击或 Enter 触发 `onActivate(category)`；Left/Right/Home/End 移动，Escape 清除选中。读数通过 Text 显示，`formatValue` 由应用提供。
- `loading`、`emptyLabel` 表示加载与空态。无效数据/尺寸显示错误信息，不绘制无效几何。
- 覆盖颜色只接受十六进制 3/4/6/8 位值，否则退回主题色。SVG 仅含内部计算的几何，不接受任意外部 SVG 标记。

`validateChart` 与 `pieModel` 是公共纯规则。直接调用 chartDomain、chartY、lineSegments、arcPath 等低层几何函数前，调用方应保证输入合法；这些函数不会重复做 UI 层的完整校验。

## 饼图与环形图

`PieChart`/`DonutChart` 接收 `data: {id,label,value,color?}[]`、`size`（默认 180，80–1024）、`selectedId/onSelectionChange`、`loading` 与 `testId`。最多 50 项，非负有限值不超过 1e15；零值不产生扇区且图例禁用，全零为空态。DonutChart 是 PieChart 的 donut 包装。

点击图例或在图区域使用 Left/Right/Home/End 选择扇区，显示数值和百分比；未传 selectedId 时使用本地状态。当前没有直接扇区命中检测。大数据需先由应用聚合；不提供连续/时间轴、缩放、导出、动画或完整图表无障碍语义。

## 指标与活动

`MetricCard` 接收 `label`、格式化 `value: string`、可选 `change`、`trend: positive | negative | neutral`、`description`、`children`、`testId`。趋势影响语义颜色，组件不计算增长率或业务指标。

`Timeline`/`ActivityFeed` 接收当前页 `items`，每项含 `id/title/timeLabel` 与可选 `description/actor/group/tone/actions`。actions 为 `{id,label,onPress,disabled?}[]`。连续相同 group 合并标题；调用方先排序和分组。`loading/emptyLabel/hasMore/onLoadMore` 控制状态与加载意图，不执行请求。相对时间、时区由应用格式化，不启动轮询，不做列表虚拟化。

## 消息列表

`Message` 包含 `id/author/text`，`direction: incoming | outgoing | system`，可选 `timeLabel`、`status: sent | sending | streaming | failed | stopped`、`error`、`attachments` 与 `reply: {author,text}`。附件是 `{id,name,state: ready | loading | failed}` 元数据，不是文件对象。

`MessageBubble` 接收 message 与 `onRetry(id)`、`onReply(id)`、`onOpenAttachment(messageId,attachmentId)` 意图。附件仅在 ready 且有回调时可激活；不会自行读取路径、打开文件、重试网络或生成已送达状态。

`MessageList` 接收 `messages`、上述回调、`height`（默认 340）、`loading/emptyLabel`、`hasEarlier/onLoadEarlier`。只渲染当前消息窗口，不进行远程分页或虚拟化。它有自己的纵向滚动容器，外围避免再加同轴滚动。

`followTail` 默认 false；为 true 时，在传入 messages 数组变化后滚到尾部。应用应不可变更新消息数组，并在用户阅读历史时关闭 followTail；当前不会从滚轮事件自动切换该状态。跳至最新会滚动并调用 `onFollowTailChange(true)`。插入历史消息的视口锚定尚未实现。

## 消息输入区

```tsx
const [draft, setDraft] = useState("");
<MessageComposer
  testId="composer"
  value={draft}
  onValueChange={setDraft}
  onSend={async (snapshot) => {
    await applicationSend(snapshot);
    setDraft("");
  }}
/>;
```

示例中的 useState 来自 React；MessageComposer 来自 `/messages`；applicationSend 由使用方提供。

- `value/onValueChange` 始终受控。onSend 接收激活时的 `{text,attachmentIds,replyToId?}` 快照，可返回 Promise。组件不自动清空草稿；成功后的清空由应用决定。
- `attachments/onRemoveAttachment/onAttach` 管理附件元数据与动作；所有附件 ready 后才能提交。纯附件草稿允许提交，纯空白文本不允许。
- `replyTo: {id,author,text}` 与 `onCancelReply` 控制引用。
- `state: idle | sending | streaming`、`disabled` 控制外部状态；streaming 可通过 `onStop` 显示停止按钮。它只是意图，应用负责取消底层任务并更新消息状态。
- 内部 ref 锁防止连续激活重复提交；Promise 等待期间输入和相关动作禁用。拒绝后显示 `errorLabel` 并释放锁，不主动修改受控草稿；卸载后不会更新组件状态。
- Enter 提交，Shift+Enter 换行。`maxLength` 默认 10000，按 JavaScript UTF-16 code unit 计数，不是字节或模型 token 数。超限禁止提交；调用方传入合理非负上限。
- `placeholder/sendLabel/errorLabel` 可覆盖显示文本，其余内部标签当前为英文，完整国际化尚未封装。默认错误文案假设应用没有在失败前主动清空草稿；不同应用约定应覆盖文案。

没有真实传输、读回执、附件上传、富文本编辑或消息持久化。Studio 的 Add demo message 和 sample.txt 明确为内存演示。

## 布局与窗口端口

- `DashboardLayout`: `title/description/actions/metrics/children/testId`，单一内容滚动和可换行指标区。
- `ConversationLayout`: `sidebar?/header/messages/composer/inspector?/testId`，消息内容和输入区分开；应用根据窗口、引用和附件高度约束消息视口。
- `SettingsLayout`: `navigation/children/testId`，200 px 导航与可滚动内容。这里只是布局插槽，尚无独立完整设置应用场景验证。

这些布局没有路由、业务状态、导航持久化或完整设置/邮件/文件管理流程。

`createWindowAdapter(renderer)` 接收 useGpuix 的 renderer（或 null），返回 `capabilities`、`getSize()`、`setTitle(title)`、`activate()`。结果为 `{ok:true,value}` 或 `{ok:false,reason: unsupported | failed,message}`，错误不泄露原生异常正文。

capabilities 只描述 UIKit 已映射的方法；systemMenus、filePanels、clipboard、screenReaderSemantics 当前为 false，不能据此判断操作系统自身不支持。窗口尺寸已通过原生 TestRenderer 验证；标题和激活仅验证方法转发与失败处理，未验证真实窗口效果。没有系统菜单、文件面板、剪贴板、窗口文档生命周期或 AX 适配。

## 验证范围

纯规则包含无效图表、正负堆叠、缺失折线、饼图比例、草稿提交条件、窗口端口转发/失败。Studio 原生 TestRenderer 覆盖 1320×920、1000×720 深浅主题、图表键盘与图例、活动加载、消息引用/附件/流式停止、重复提交锁与失败保留。真实 macOS ARM64 窗口单独验证启动、中文文本注入、键盘主题切换和截图；不执行 live simulateClick。

这些检查不等于真实 IME 组合输入、屏幕阅读器、跨平台或所有组件变体已验证。完整框架仍有 Calendar/DatePicker、Slider、全局弹层栈、快捷键、虚拟集合、系统服务等缺口。
