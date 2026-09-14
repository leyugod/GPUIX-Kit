# 通知与任务反馈 · v0.12

本批提供 7 个原生组件，沿用 Darwin 风格的圆角、细边框和深浅主题。通知、任务属于应用内反馈；UIKit 不执行后台任务、数据库撤销或系统通知。

## 公开入口

| 入口 | 导出 |
| --- | --- |
| /notifications | NoticeCard、UndoToast、ToastViewport、useNotificationQueue、createNotificationQueue，以及通知、队列、时钟类型 |
| /notification-model | notificationError、advanceNotifications、nextNotificationDelay 和纯数据类型 |
| /task-progress | ProgressRing、TaskProgress、TaskList、TaskSummary、任务类型与规则 |
| /task-model | taskError、taskCollectionError、taskActions、taskFraction、summarizeTasks、progressFraction |

组件、控制器和类型也从包根入口导出。纯计时规则不依赖 React、DOM 或宿主。控制器默认使用 Bun 的单调时钟与定时器，可注入 NotificationClock。

## 使用通知队列

```tsx
import { Button, ToastViewport, useNotificationQueue } from "@mirai/gpuix-kit";

function Feedback() {
  const queue = useNotificationQueue({
    visibleLimit: 3,
    capacity: 50,
    defaultDurationMs: 5000,
  });
  return (
    <>
      <Button testId="save-notice" onPress={() => {
        const result = queue.enqueue({
          id: "saved",
          title: "Settings saved",
          tone: "success",
          durationMs: 5000,
        });
        if (!result.ok) console.error(result.error);
      }}>Show notice</Button>
      <ToastViewport queue={queue} testId="notices" />
    </>
  );
}
```

放在 UIKitProvider 和 AppShell 内。一次队列绑定一个视口；多视口的 hover 状态不作合并。hook 选项只在初始化读取，后续动态配置应由应用创建新的控制器和视图。

Notification 包含 id、title、description、tone、durationMs、actionLabel、kind、dismissible。id/title 非空，title 最多 500 字符，description 最多 4000；durationMs 为 1–86400000 的整数，null 表示持久，省略使用队列默认值。kind 可为 notice 或 undo。id 也用于组合 testId，应在所属视图内保持稳定和唯一。

队列容量默认 50，上限 100；可见数量默认 3，上限 5，不能超过容量。入队失败返回错误，不静默丢弃已有通知。同 id 入队会原位替换、重置时长、增加 revision，清除旧操作的 busy/error/hover 暂停，保留手动和键盘暂停。

等待项只在进入可见位置后开始计时。延迟触发的定时回调只消耗原先已显示项的时长，新补位项仍有完整时间。快照的 remainingMs 是最近同步值，不承诺每毫秒刷新。最近到期的一项驱动单个定时器；空队列、持久通知和全部暂停时不轮询。

控制器提供 enqueue、dismiss(id, reason?, expectedRevision?)、setPaused(id, reason, paused, expectedRevision?)、setPausedAll、clear、getSnapshot、subscribe、suspend、resume、dispose。reason 为 manual/timeout/action/clear；onDismiss 在状态提交后调用，应用回调应避免抛出异常。suspend 保留剩余时间，resume 从恢复时刻继续；外部控制器最终需要 dispose。hook 在卸载时 suspend，并支持 effect 重放时恢复，不替应用释放仍在执行的业务请求。

## 通知交互

NoticeCard 接收 title、description、tone、testId、revision、action: {label,onPress}、onDismiss、disabled，以及操作成功/失败/忙碌回调。action 可返回 Promise；执行期间阻止重复动作、关闭和 Escape。拒绝后显示 errorLabel（默认英文）并允许重试；成功只通知调用方。新的操作身份需更新 revision；旧身份完成不会更新新视图。

UndoToast 使用 state=available/undone/expired、onUndo、onStateChange。只有撤销回调成功且视图仍是同一有效身份才请求 undone；应用改为 expired 后，未完成回调不能重新打开撤销窗口。独立 UndoToast 无计时器，截止时刻和数据恢复由应用负责。

ToastViewport 的 onAction 收到通知数据，成功后移除对应 revision，失败则保留并暂停计时。默认 inline；top-right 使用原生 anchored、宽度限制 240–480 并按窗口收缩，内部限高滚动。inline 没有自己的滚动容器，可放入侧栏、卡片或应用 overlay 插槽。浮动通知未接入全局模态栈，应用应避免与模态同时争抢交互。

悬停暂停计时，离开或视图卸载释放 hover 暂停。键盘交互会持续暂停，直到使用 Resume；错误也保持暂停，Resume 清除手动、键盘和错误原因，不解除仍有效的 hover/busy。全局暂停与这些原因独立。持久项没有 Pause 按钮。

动作按钮支持 Enter/Space；Escape 在可关闭且非忙碌时关闭。操作前保留卡片焦点，防止加载按钮禁用后丢失键盘入口。可传 restoreFocusRef，在手动关闭或操作成功后恢复应用指定节点；自动超时不承诺焦点恢复。没有屏幕阅读器公告或系统通知中心集成。

## 任务组件

ProgressTask 的最小数据为 id、title、status。可选 description、completed、total、error、pausable、cancellable、retryable、revision。状态是 queued/running/paused/succeeded/failed/cancelled。completed 必须有限且非负；total 若提供须为正数且不小于 completed。没有 total 表示未知进度，succeeded 显示完成。

TaskProgress 接收 task、testId、onAction(id, action)、disabled、errorLabel。running+pausable 提供 Pause；paused+pausable 提供 Resume；queued/running/paused+cancellable 提供 Cancel；failed/cancelled+retryable 提供 Retry。动作仅发出应用请求，UIKit 不自行改变任务状态或百分比。Promise 待定时锁住所有动作；拒绝后显示可重试错误，应用重新传入同一 id 的新任务执行应更新 revision。

TaskList 使用受控 page（从 0 开始）、onPageChange、pageSize、tasks 和可选 onAction/disabled/loading/emptyLabel。每页默认 4，上限 10，只挂载当前页；集合最多 200 项且 id 唯一。越界页码在渲染时夹取，不在挂载时回写应用。支持空、加载和非法集合状态；列表不另建滚动容器。应用删除或翻页卸载任务时，负责相应的业务取消和目标焦点。

TaskSummary 统计成功数、活动数（排队/运行/暂停）、失败数、取消数；环形值为成功数/总数，不混合不同任务的字节/文件单位，也不把取消算作成功。支持 title。

ProgressRing 接收 value（null 表示未知）、max（默认 100）、size（28–128）、tone、label 和 testId。原生 SVG 显示圆环；未知值使用静态短弧与省略号，不伪造进度或动画。无效数值显示问号。

## 验证与边界

76 项纯规则包含 12 项本批规则。原生 TestRenderer 覆盖 1320×920、1000×720 深浅主题，以及队列候补、计时暂停、hover/键盘、异步重复/失败/替换/卸载、受控撤销和任务动作、分页/空/错误/禁用与浮动边界。真实 macOS ARM64 窗口另验启动、中文文本注入、键盘主题切换和截图；没有使用 live simulateClick。独立 tgz 消费检查公开子路径、文档、类型及原生任务动作。

操作结果与通知均为内存状态，没有后台任务调度、跨窗口同步、通知历史持久化、系统通知、进度动画、完整本地化和 AX 公告；Windows/Linux 与真实 IME 组合输入未验证。
