# v0.14 对话框与面板

固定运行于 GPUIX React/native 0.7.0，使用原生 JSX、UIKit 深浅主题及焦点范围。新增六个组件，共享现有 Dialog 的面板实现；不依赖 DOM 或业务服务。

## 导入与组件

```tsx
import {
  AlertDialog,
  ConfirmDialog,
  PromptDialog,
  Sheet,
  Drawer,
  ProgressDialog,
} from "@mirai/gpuix-kit/modal";
import { Dialog } from "@mirai/gpuix-kit/overlays";
import { modalDimensions, validatePrompt } from "@mirai/gpuix-kit/modal-model";
import { createOverlayStack } from "@mirai/gpuix-kit/overlay-model";
```

组件与类型也从包根导出；纯模型从各自子路径导入。共用必需属性为 `open: boolean`、`onOpenChange(open)`、`title: string`、`testId: string`；可选 `description`、`width`、`restoreFocusRef`。应用负责接受关闭意图并更新 open。

| 组件           | 主要属性与行为                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| AlertDialog    | children、acknowledgeLabel（OK）；初始聚焦确认按钮，Enter 确认，Escape 关闭                                                         |
| ConfirmDialog  | onConfirm、children、confirmLabel、cancelLabel、destructive、revision、errorLabel；初始聚焦取消，避免 Enter 意外执行破坏动作        |
| PromptDialog   | value、onSubmit(value)、validate(value)、label、placeholder、submitLabel、cancelLabel、revision、errorLabel；本地草稿，初始聚焦输入 |
| Sheet          | Dialog 属性，窗口顶部居中，默认宽 620、高 420；正文滚动、页脚固定                                                                   |
| Drawer         | Dialog 属性及 side（left/right，默认 right）；默认宽 380、高为窗口高度，贴左右边缘                                                  |
| ProgressDialog | task: ProgressTask、onTaskAction(id, action)、allowBackground、closeLabel、hideLabel；复用受控任务进度和操作                        |

## 确认与输入

```tsx
<ConfirmDialog
  testId="remove-confirm"
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="删除项目？"
  destructive
  confirmLabel="删除"
  cancelLabel="取消"
  revision={item.version}
  restoreFocusRef={removeButtonRef}
  onConfirm={() => viewModel.remove(item.id, item.version)}
/>

<PromptDialog
  testId="rename"
  open={renameOpen}
  onOpenChange={setRenameOpen}
  title="重新命名"
  value={name}
  label="名称"
  submitLabel="保存"
  cancelLabel="取消"
  validate={value => value.trim() ? null : "请输入名称"}
  onSubmit={async value => {
    await viewModel.rename(value);
    setName(value);
  }}
/>
```

示例中的 ViewModel 和 refs 由调用方提供。在 UIKitProvider 下，将顶层对话框放入 AppShell.overlay；不要把面板挂在被裁切的列表行内。业务保存、权限、版本和实际取消请求属于应用边界。

ConfirmDialog/PromptDialog 接受同步或 Promise 回调。等待期间锁定重复操作、取消按钮和 Escape；成功发出关闭意图，拒绝显示 errorLabel 并允许重试，不直接显示异常正文。关闭卸载或 revision 改变后，旧回调不再关闭新视图；网络/数据库任务本身不会被自动取消。不同记录必须使用不同 key 或 revision，不能只更换 callback 并期待 UIKit 推断业务身份。

PromptDialog 仅在提交时向应用传值，取消丢弃草稿。外部 value/revision 更新会重置草稿；最多 10000 个 UTF-16 code unit，同步 validate 可返回错误字符串或 null，未提供规则时允许空值，异常返回通用错误。外部值替换会隔离旧异步结果；提交回调将 value 更新为本次原样提交值时视为确认回写，允许本次成功关闭。若应用回写规范化后的不同值，应显式管理关闭或 revision。Tab 复用 Input.resetKey 防止固定宿主插入制表符，会重置原生编辑器撤销/光标历史。

默认内置标签为英文，公开 label 属性可覆盖；等待文字与部分通用错误暂未提供完整本地化接口。

## 通用面板与尺寸

Dialog、Sheet、Drawer 共用 `children`、`footer`、`initialFocusRef`、`restoreFocusRef`、`closeLabel`、`dismissOnBackdrop`（默认 false）、`dismissible`（默认 true）、`showClose`（默认 true）、`bodyScrollOffset`。高级组合可以通过 surfaceRef 获取稳定的面板根节点，用于内部控件全部禁用期间保留焦点。自定义子控件须使用公开 useFocusTarget 注册焦点并转发事件。

请求宽度先限制到 240–1200，再受窗口宽减 32 约束；Dialog 默认宽 480。height 为 Dialog 最大高度、Sheet/Drawer 固定高度，仍受窗口可用高度约束。标题最多两行、描述最多三行；正文是唯一纵向滚动区域，footer 保持在外部。极小尺寸只保证模型数值有界，不声明任意尺寸下内容均可用。已验证 1320×920 和 1000×720；宿主 bounds 返回去除边框的内容矩形，1px 边框不计入。

Sheet 是窗口内顶部面板，Drawer 是带遮罩的模态边缘面板；均不是 AppKit NSWindow sheet 或独立系统窗口。持续可交互的辅助属性栏应使用已有 Inspector。

## 层级、键盘和恢复契约

Dialog/这六个组合与 UIKit Popover 使用同一 renderer 内的注册栈。最后挂载层接收 Escape/Tab 与外部关闭；上层遮罩阻挡下层指针操作。嵌套时应让子面板保持为父面板的 React 后代，并向子面板提供指向父层触发器的 restoreFocusRef。关闭子层后恢复父层触发器；整个父子分支一起关闭时，仅根层恢复外部触发器，避免聚焦已销毁节点。

初始焦点：显式 initialFocusRef、首个已注册控件、空面板根节点依次回退。Tab/Shift+Tab 在最上层已注册控件内循环；异步处理中没有可用控件时，稳定根节点保留 Escape/Tab 路径。子编辑器先处理其自身 Escape 语义，不保证任意原生自定义控件都转发相同事件。

恢复是显式 ref 契约。独立兄弟弹层没有父层关系，关闭其中一个不会自动选取另一个弹层的焦点；应用应组织为嵌套关系或显式安排焦点。Popover 外部点击关闭时保留点击目标焦点。滑块、SplitView 和 DataGrid 调整大小的捕获层使用所属层相对优先级，避免拖动遮挡或落在所属面板下面。

注册栈只覆盖上述 UIKit 托管层，不覆盖宿主 Select/Tooltip、自定义 anchored、独立顶角 ToastViewport、OS 弹窗或跨窗口的全局仲裁。没有新增快捷键冲突管理或系统 AX 服务。createOverlayStack 是独立的纯规则控制器，不是控制组件内部栈的公共全局实例。

## 进度任务

ProgressDialog 的 queued/running/paused 状态默认不可关闭；allowBackground=true 时可以隐藏界面，任务继续由应用负责。终态显示关闭按钮。onTaskAction 仅发送 pause/resume/cancel 等意图，直到应用更新 task 才改变展示；没有后台任务执行器、系统进度窗口或自动成功模拟。未知进度使用已有静态环，不等于旋转动画。

## 演示与验证

运行 `bun run dev:modals`。Gallery 提供六种对话框、父 Sheet/子 Drawer、内嵌颜色选择器、任务暂停/取消以及深浅切换。

```sh
bun run check
bun run test:modals
bun run test:modals:narrow
bun run test:modals:states
bun run test:live:modals
bun run test:package
```

纯测试覆盖层顺序/卸载/订阅、几何约束和校验；原生测试覆盖重复锁、拒绝重试、旧结果隔离、编辑草稿与 Tab、兄弟遮挡、嵌套焦点、左/右边缘、长标题及任务意图。真实 macOS 窗口单独验证启动、中文注入、主题与截图，不使用 live simulateClick。macOS ARM64 之外、真实 IME 组合输入、AX 和系统材质未验证。
