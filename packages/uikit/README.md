# @mirai/gpuix-kit

用于 GPUIX 0.7.0 + React 19 + Bun 的原生 UIKit 组件库，当前目录补齐版本 0.20.0。Darwin 风格，支持 dark/light 和语义色覆盖；不依赖 CRM 或浏览器。

本版只交付组件、纯模型和适配接口；窗口映射与应用注入实现明确区分。完整 macOS 框架、高级 UI 增强和业务服务不在已完成功能声明中。

[快速开始与应用模板](https://github.com/leyugod/GPUIX-Kit/blob/main/docs/getting-started.md) · [统一组件手册](https://github.com/leyugod/GPUIX-Kit/blob/main/docs/components/index.md)

## 接入

通过 GitHub Release 安装固定版本（npm 未发布）：

```sh
bun add https://github.com/leyugod/GPUIX-Kit/releases/download/v0.20.0/mirai-gpuix-kit-0.20.0.tgz
bun add @gpuix/react@0.7.0 react@19.2.4
```

在使用方 tsconfig 中配置 `jsx: "react-jsx"`、`jsxImportSource: "@gpuix/react"`、`moduleResolution: "Bundler"`。本包公开 TypeScript/TSX 源码，由 Bun 编译；无需 CSS 文件。类型与源码一起分发。

```tsx
import { useState } from "react";
import { render } from "@gpuix/react";
import {
  UIKitProvider,
  AppShell,
  Card,
  CardHeader,
  CardContent,
  Field,
  Input,
  Button,
} from "@mirai/gpuix-kit";

function App() {
  const [name, setName] = useState("");
  return (
    <UIKitProvider mode="light">
      <AppShell>
        <Card style={{ margin: 24, width: 400 }}>
          <CardHeader title="New workspace" />
          <CardContent>
            <Field label="Name">
              <Input testId="name" value={name} onValueChange={setName} />
            </Field>
            <Button
              testId="create"
              variant="primary"
              disabled={!name.trim()}
              onPress={() => console.log(name)}
            >
              Create
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    </UIKitProvider>
  );
}
render(<App />, { title: "Example", width: 800, height: 600 });
```

## 主题

`UIKitProvider mode="dark" | "light"` 是受控属性，切换不重建组件树或清空输入草稿。`colors={{ primary: "#7C3AED", primaryHover: "#6D28D9" }}` 可覆盖品牌色。用 `useTheme()` 获取 tokens；OS 主题、语言与偏好持久化由应用注入。

v0.19 补齐身份/评分/验证码、页面区块、QR、渐变、仪表/雷达、媒体控制、富文本分块编辑、事件日历与营销 UI。见[完整契约与接入](docs/catalog-completion.md)。

## 公共入口

| 入口               | 能力                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `@mirai/gpuix-kit` | 全部公开组件与类型                                                                                             |
| `/tokens`          | createTheme、darkColors、lightColors、space、radius、typography、controlSizes、toneColors                      |
| `/theme`           | UIKitProvider、useTheme、useNativeTheme                                                                        |
| `/focus`           | useFocusTarget：为自定义原生控件注册 Dialog 焦点和键盘事件                                                     |
| `/base`            | Text、Stack、Row、Separator、Button、Input、Textarea、SearchField、Field、Checkbox、Switch、RadioGroup、Select |
| `/layout`          | Card、CardHeader、CardContent、CardFooter、Toolbar、Sidebar、SegmentedControl、Tabs、Accordion、AppShell       |
| `/data`            | Badge、Avatar、Progress、Skeleton、Table、Pagination、Markdown                                                 |
| `/feedback`        | Alert、EmptyState、Toast                                                                                       |
| `/overlays`        | Dialog、Tooltip、IconButton                                                                                    |

新增公共子路径：`/navigation`、`/split-view`、`/popover`、`/menu`、`/command`、`/combobox`、`/value-input`、`/interaction`。详见[桌面组件 API、示例与键盘约定](docs/desktop.md)。

v0.3 新增 `/list-view`、`/tree-view`、`/data-grid`、`/filter-bar`、`/document-tabs`、`/form`、`/content` 与 `/selection`。详见[工作台组件 API 和测试边界](docs/workbench.md)。

v0.4 新增 `/charts`、`/chart-model`、`/metrics`、`/timeline`、`/messages`、`/patterns`、`/platform`。详见[图表、消息与布局 API 和边界](docs/studio.md)。

v0.5 新增 `/slider`、`/slider-model`、`/calendar`、`/calendar-model`。详见[滑块、日历与日期选择](docs/controls.md)。

v0.6 新增 `/checkbox`、`/checkbox-model`、`/tags`、`/token-model`。现有 Checkbox 兼容布尔值并增加 indeterminate；详见[三态选择和标签输入](docs/choices.md)。

v0.7 新增 `/time-input`、`/time-model`，提供 TimeField、TimeList、TimePicker；详见[时间控件 API 与边界](docs/time.md)。

v0.8 扩展 Slider/RangeSlider 的 trackPress、marks、readOnly；详见[轨道与刻度](docs/slider-tracks.md)。

v0.11 新增 /color、/color-model，包含色块、ColorWell、颜色输入、调色板、面板及弹出选择。见[颜色组件 API](docs/colors.md)。

v0.10 新增 /actions、/action-model，提供按钮组、分裂按钮、工具栏溢出、路径、工作区和账户菜单。见[桌面动作与导航](docs/actions.md)。

v0.9 新增 /period-picker、/period-model、/date-range、/date-range-model；提供月/年、双月和范围草稿工作流，详见[日期导航与范围工作流](docs/date-navigation.md)。

v0.12 新增 /notifications、/notification-model、/task-progress、/task-model，提供七个通知/任务组件、计时队列和 hook。见[通知与任务反馈](docs/notifications.md)。

v0.13 新增 /token-input、/token-input-model，提供六个标签建议、改名与选择草稿组件。见[标签建议与编辑 API](docs/token-input.md)。

v0.14 新增 /modal、/modal-model、/overlay-model，提供六个对话与面板组件及托管 Dialog/Popover 层级协作。见[对话框与面板 API](docs/modals.md)。

v0.18 新增 `/table-preferences`、`/table-preferences-model`、`/host-adapter`。见[列配置、排序与显示偏好](docs/table-preferences.md)及[宿主注入接口](docs/host-adapter.md)。DataGrid 新增可选 density，默认 regular。

v0.17 新增 /filters、/filter-model，提供条件标签/摘要、类型编辑行、构建器、草稿面板与保存视图选择器。见[筛选与保存视图 API](docs/filters.md)。

v0.16 新增 /resource-state、/async-list、/collection、/collection-model、/lazy-tree、/lazy-tree-model，提供资源反馈、加载更多、异步列表、集合卡片/网格和分支加载树。见[集合与异步资源 API](docs/collections.md)。

v0.15 新增 /source-list、/source-list-model、/navigation-split、/navigation-split-model，提供来源侧栏、分组头、导航行、显隐开关、内容面板与自适应分栏。见[Apple 风格侧栏 API](docs/sidebars.md)。

## 接口约定

- Button：`variant` = default / primary / secondary / outline / ghost / destructive；`size` = sm / md / lg；`disabled`、`loading`、`leading`、`trailing`、`onPress`。
- 单行 Input 使用原生 flex 垂直居中，SearchField、NumberField、DateField 等复用同一规则；显式 style 可覆盖，Textarea 保留顶部编辑。
- Input / Textarea：`value`、`onValueChange`、`placeholder`、`disabled`、`readOnly`、`invalid`、`onSubmit`。Textarea 的 Enter 提交、Shift+Enter 换行遵循原生宿主。
- Checkbox / Switch：`checked`、`onCheckedChange`、`label`、`disabled/readOnly`。Checkbox 的 checked 还支持 `"indeterminate"`；Switch 仍是布尔值。
- Select / RadioGroup / SegmentedControl：`value`、`onValueChange`、`options: {value,label,disabled?}[]`。Select 的弹层使用 GPUIX 公共实现。
- Field：`label`、`hint`、`error`、`required`。业务校验由使用方执行，并同时给输入传入 `invalid`。
- Table：泛型 `columns: {key,header,width?,render}[]`、当前页 `rows`、`rowKey`、`loading`、`empty`。配合 Pagination 的 `page/pageSize/total/onPageChange`。
- Dialog：新增 dismissible/showClose、height 与空内容焦点回退，详细契约见面板 API。原属性：`open/onOpenChange`、`title`、`children`、`footer`、`restoreFocusRef`。放在 AppShell 的 `overlay` 中；背景默认不触发关闭。自定义 native 子控件使用 `/focus` 的 useFocusTarget 并转发 ref、onKeyDown、onMouseDown。
- Toast：受控显示，`onDismiss` 关闭；原有组件保持受控；自动队列可改用 ToastViewport/useNotificationQueue。
- 所有稳定交互都要求 `testId`；普通文字使用 Text；交互图标可通过 IconButton 包装传入原生 SVG，label 显示为 Tooltip；文字 Tooltip 支持悬停或 Enter/Space 打开、Escape 关闭。

## 边界

v0.19 已提供目录 85 类对应的原生封装与适配接口，完整契约见 [新增组件指南](docs/catalog-completion.md)。这不代表 Darwin / Untitled 所有商业变体或完整 macOS 框架等价。历史批次能力和组件专门限制见上方各指南。

富文本默认为带历史记录的原生块编辑，视频需注入播放表面与控制端口。渐变支持有界线性多停靠点，未提供系统取色、HSV/HSL、径向/网格渐变和广色域；事件日历未包含循环事件、时区换算和冲突网格。大型数据虚拟化、冻结列/范围编辑、拖放、连续时间轴和图表缩放仍属于深度增强。真实文件服务由应用负责。

Skeleton 为静态占位，LoadingIndicator 另行提供动画与 reducedMotion；Toast 保持受控，自动关闭由通知队列提供。没有系统通知或后台任务执行。Avatar 的 src 由 GPUIX 图片控件加载，网络失败状态由应用处理。

当前不声明屏幕阅读器、真实 IME 组合输入、跨平台或复杂毛玻璃特效的完整支持。验证记录见项目 docs/compatibility.json。复制或分发本包时保留 LICENSE、THIRD_PARTY_NOTICES.md 与 licenses/。
