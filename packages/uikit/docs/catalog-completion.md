# 官网目录补齐：原生组件契约（0.19.0）

本批按 Untitled UI 的基础、应用、营销组件目录补齐独立封装；完整对应关系在仓库 docs/untitled-ui-coverage.md。使用 Darwin 风格深浅主题，消费应用仍负责业务数据与系统服务。所有组件从包根导出，也可按下列子路径导入。各组件 Props 类型随源码公开，支持 React.ComponentProps<typeof Component>。

## 身份与基础展示：/identity

[公开类型与实现](../src/components/identity/index.tsx)。

| 组件 | 必需输入 / 回调 | 行为 |
| --- | --- | --- |
| AvatarGroup | items、testId；onOverflow? | 最多 100 个唯一身份，显示 1–10 个头像、状态与溢出入口 |
| AvatarLabelGroup | name、testId；src?、description?、actions? | 头像、名称、说明和动作插槽 |
| BadgeGroup | label、children、testId；onPress? | 分类徽章与消息/动作组合 |
| FeaturedIcon | children?、tone?、size?、testId? | 24–80 尺寸的语义色图标容器 |
| Illustration | kind?、size?、testId? | 原创 documents/search/success 原生矢量插图；不分发商业素材库 |
| CreditCard | holder、last4、testId；brand?、expiry? | 仅展示末四位；无效 last4 掩码，不接收完整卡号或处理支付 |
| SocialButton | provider、testId、onPress | 提供商动作按钮，复用 Button 禁用/加载；登录服务由应用提供 |
| AppStoreButton | store: apple/google、testId、onPress | 商店动作按钮，无自动打开链接 |
| UtilityButton | label、testId、onPress | 工具动作；可用 Button 的 leading/trailing 插槽 |
| RadioButton | checked、label、onCheckedChange、testId | 独立原生单选按钮，disabled/readOnly 阻止修改 |
| RadioCardGroup | items、value、onValueChange、testId | 最多 20 个带说明/插槽的卡片单选项；保护禁用项 |

## 评分与验证码：/rating

[公开类型](../src/components/rating/index.tsx)。RatingStars 接收 value、testId，可选 onValueChange、max（1–10）、readOnly、disabled；支持点击及方向/Home/End 键，值限定为整数星级。RatingBadge 接收 value（0–5）、count?、testId。VerificationCodeInput 接收 value/onValueChange、testId、length?（4–8）、onComplete?、error?、disabled/readOnly；一个原生输入负责整码编辑与粘贴，下面的格子显示各位值。保留前导零，过滤非数字；补全或有效提交触发回调。它不发送短信，也不是多个浏览器 input 的 DOM 移植。

## 页面与步骤：/sections

[公开类型](../src/components/sections/index.tsx)。SectionHeader / PageHeader / InlineCTA 使用 title、description?、eyebrow?、leading?、actions?、testId；PageHeader 另有 breadcrumbs/tabs 插槽。SectionFooter 接受 children/actions；ContentDivider 接受 label? 与 horizontal/vertical 方向。

HeaderNavigation 使用唯一 items（最多 12）、value/onValueChange、brand/actions；窄窗口允许换行。ProgressSteps 使用最多 12 个唯一 steps，每项 id/label/status（pending/current/complete/error），可选 description/disabled；onStepChange 发出选择意图，orientation 可选横/纵。没有内置路由、导航服务或自动执行步骤。

## 二维码：/qr-code、/qr-model

[组件](../src/components/qr-code/index.tsx) · [模型](../src/components/qr-code/model.ts)。QRCode(value, testId, size?, level?, label?) 使用固定 qrcode-generator 2.0.4 编码，支持 UTF-8、L/M/Q/H。输入上限 1500 字节，纠错级别导致容量不足时显示错误；size 限定 96–512，并至少为每模块预留 2 个逻辑像素和四模块静区。纯 qrMatrix / qrSvg 可独立使用。

GPUIX SVG 是单色蒙版，qrSvg 输出透明底单色路径；QRCode 的白底由原生容器提供。固定黑白静区保证两种主题的对比度，不覆盖 logo。已用独立 jsQR 解码器验证编码矩阵及宽窄/深浅实际 PNG 截图。

## 渐变：/gradient

[公开类型](../src/components/gradient/index.tsx)。GradientValue 为 angle（0–360）和 2–8 个唯一 stops（id、position:0–1、color:#RRGGBB 或 #RRGGBBAA）。GradientPicker(value/onValueChange/testId/disabled?) 提供停靠点选择、添加/删除、位置、角度及颜色草稿提交；GradientPreview 提供宽高受限的预览。gradientError / gradientAt 为纯规则。

多停靠使用小块原生线性渐变组合；不支持径向、网格渐变、广色域或系统取色。预览不传 DOM/CSS 字符串；输入保持可序列化值。

## 仪表与加载：/gauges

[公开类型](../src/components/gauges/index.tsx)。ActivityGauge(value/max?/label/testId) 提供有界半圆比例。LoadingIndicator(label?/active?/reducedMotion?/testId) 在 active 时推进八点动画，停用/卸载取消计时器，reducedMotion 显示静态状态。应用负责将系统偏好传入。

RadarChart(axes/series/testId) 接受 3–12 个唯一轴、最多 6 个唯一系列，每轴有独立正 max，系列值必须在各轴范围内。size 限定 160–480；hiddenIds/onHiddenChange 控制图例过滤。图形分层着色，同时提供可读数值表；空系列与无效数据有明确反馈。无图表后端、缩放/导出或完整 AX 认证。

## 媒体与文件：/media

[公开类型](../src/components/media/index.tsx)。

| 组件 | 输入 / 回调 | 边界 |
| --- | --- | --- |
| Carousel | items（id/label/content）、value/onValueChange、testId；loop?、height?、disabled? | 最多 30 项；上一页/下一页、边界禁用、可循环；不自动播放 |
| ImageViewer | image（id/src/label）或 null、zoom?、onZoomChange?、height?、testId | 原生图片与 1–4 倍预览；图片滚动容器处理平移 |
| ImagePicker | value、testId；onChoose?、onRemove?、disabled?、error?、revision? | 选择/移除意图、预览、请求锁和失败重试；无端口时显示不可用 |
| FileUploader | files、testId；onChoose/onRetry/onRemove/onOpen?、revision?、disabled? | 最多 100 个当前集合文件、五项分页、进度/错误/动作；不自动上传 |
| VideoPlayer | sourceId、state、testId；adapter?、surface?、poster?、height?、disabled? | 播放/暂停、进度、音量、静音、全屏意图，单命令锁和失败反馈 |

VideoState 使用 status、currentTime、duration、volume、muted、error?；VideoPlayerAdapter 各方法均可缺省，接受同步或 Promise 实现。state 始终由应用更新，不在 Promise resolve 后虚构 playing；sourceId 切换隔离旧命令结果。实际播放画面由 surface 注入，固定 GPUIX 0.7.0 没有内建视频 JSX 控件，本包不提供解码器。未接入时明确禁用和显示 unsupported。Gallery 使用内存控制状态演示，不把海报或内存状态视为视频播放成功。

文件拖放、网络上传、图片解码失败处理及权限由宿主/应用负责；ImagePicker 的 error 由应用传入。UI 能力与真实服务分开。外部请求过期写入和取消仍由应用控制。

## 富文本编辑：/rich-editor

[公开类型](../src/components/rich-editor/index.tsx) · [纯模型](../src/components/catalog-model/index.ts)。RichTextEditor 使用 value/onValueChange、testId，可选 disabled/readOnly、revision、renderEditor。RichDocument 包含 1–100 个唯一 RichBlock：id、kind（paragraph/heading/bullet/quote）、text（≤10000）、bold?/italic?/link?。

默认提供**原生分块编辑**：选择块、编辑文本、格式切换、链接/取消链接、增删块、50 步本地撤销与重做、格式预览。更新返回克隆快照，外部文档替换或 revision 重建会清除旧历史。应用可注入 renderEditor 替换编辑表面，沿用相同文档契约。

预览转义普通文本，不接收原始 HTML，链接只允许 http/https。默认表面不提供浏览器 contenteditable/Tiptap 的任意内联选区编辑、浮动工具栏或协同编辑；这些需要专门的宿主编辑器实现，不能把 Markdown 预览宣称为内联 WYSIWYG 引擎。

## 事件日历：/event-calendar、/event-calendar-model

[组件](../src/components/event-calendar/index.tsx) · [模型](../src/components/event-calendar/model.ts)。EventCalendar 使用 events、date/onDateChange、view/onViewChange、testId，可选 onEventPress/onCreate、width/height、disabled。view 为 month/week/day，日期为真实公历 YYYY-MM-DD，时间为同一应用时区的 HH:mm。

最多 200 个唯一事件；CalendarEvent 包含 id/title/date，可选 endDate（包含结束日）、startTime/endTime/disabled。跨日事件显示在覆盖的日期中；月/周有有界预览和更多入口，日视图十项分页；日历内部独立纵向滚动。上一/下一周期、模式切换、创建和事件选择均为应用意图。没有周期事件引擎、时区换算、小时网格冲突布局或事件拖放。事件日历和 Calendar/DatePicker 日期选择器分别封装。

## 营销区块：/marketing

[公开类型](../src/components/marketing/index.tsx)。官网 18 类组件都有原生可组合区块，非整页网站或服务模板。

- BlogSection、CareersSection、FeaturesSection、MetricsSection、PricingSection、SocialProofSection、TeamSection、TestimonialSection：title/description/items/actions/onAction/testId，items 最多 30，展示标题、说明、图片、元数据、价格、功能和动作；团队以头像展示，职业为列表，指标与价格有数值层级。
- Banner：children/actions/onDismiss/testId。
- HeroHeaderSection、HeaderSection、CTASection：title/description/eyebrow/actions/media/testId。
- RichContentSection：title/children/testId；可组合 Markdown 或其他原生内容。
- FooterSection：brand/links/onNavigate/copyright?/testId。
- MarketingHeaderNavigation：沿用 HeaderNavigation 的受控导航契约。
- FAQSection：title/items/expandedIds/onExpandedChange/testId，最多 30 项。
- ContactSection：ContactValues（name/email/message）、onValueChange/onSubmit?/disabled?/testId。
- NewsletterCTA：email value/onValueChange/onSubscribe?/disabled?/testId。

联系与订阅验证非空和基本邮箱形状，提供异步锁/失败反馈，不声称邮件或订阅已送达；实际处理由应用注入。区块应放在应用统一的纵向滚动容器中，长数据先分页。按钮与链接都是原生动作回调，无 DOM 路由、表单导航或浏览器 URL API。

## 接入示例

```tsx
import {useState} from "react";
import {UIKitProvider,AppShell,Stack,VerificationCodeInput,
  RatingStars,QRCode,ProgressSteps} from "@mirai/gpuix-kit";

export function Example() {
  const [code,setCode]=useState("");
  const [rating,setRating]=useState(3);
  return <UIKitProvider mode="dark"><AppShell><Stack>
    <VerificationCodeInput testId="otp" value={code} onValueChange={setCode}/>
    <RatingStars testId="rating" value={rating} onValueChange={setRating}/>
    <QRCode testId="qr" value="https://gpuix.dev/"/>
    <ProgressSteps testId="steps" steps={[
      {id:"details",label:"Details",status:"complete"},
      {id:"review",label:"Review",status:"current"},
    ]}/>
  </Stack></AppShell></UIKitProvider>;
}
```

仓库运行 bun run dev:catalog；九个页面可操作并切换深浅主题。所有交互节点有 testId。bun run check 包含类型/边界及纯规则；test:catalog、test:catalog:narrow、test:catalog:states 包含截图解码、宽窄、输入、禁用、模型边界、请求失败/重复锁、富文本历史与各区块动作；test:live:catalog 另外验证真实 macOS 窗口。完整首版还需旧组件回归、独立包消费者、目录门槛和源码审计。

来源：公开 [Untitled UI 目录](https://www.untitledui.com/react/components)、[文本编辑器说明](https://www.untitledui.com/react/components/text-editors)、[视频组件说明](https://www.untitledui.com/react/components/video-players)；这些用于职责与组织参考，不复制私有 PRO 实现或商业资源。
