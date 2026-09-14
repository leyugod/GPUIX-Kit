# v0.16 集合与异步资源

六个原生组件共用 UIKitProvider 深浅主题、Text、选择模型及焦点适配。GPUIX 0.7.0 / React 19 / Bun；不使用 DOM 或网络请求。

| 组件 | 公共入口 | 职责 |
| --- | --- | --- |
| ResourceState | /resource-state | loading / empty / error 状态和 Promise 重试 |
| LoadMoreButton | /resource-state | idle / loading / error / end 与加载更多意图 |
| AsyncListView | /async-list | ListView 的资源状态、刷新提示与统一禁用 |
| CollectionItem | /collection | 卡片预览、标题、说明、标记及选中视觉 |
| CollectionView | /collection | 当前页网格、单选/多选、二维键盘和滚动 |
| LazyTreeView | /lazy-tree | 受控展开、懒加载分支、局部失败与重试 |

纯规则入口 /collection-model、/lazy-tree-model；根入口也导出六个组件和 props，模型从各自子路径导入。

## 集合

```tsx
import { useState } from "react";
import { CollectionView, CollectionItem } from "@mirai/gpuix-kit/collection";

export function Documents() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const items = [{ id: "a", title: "Design" }, { id: "b", title: "Notes" }];
  return (
    <CollectionView testId="documents" width={600} height={360}
      items={items} selectedIds={selectedIds} onSelectionChange={setSelectedIds}
      selectionMode="multiple"
      renderItem={(item, state) => (
        <CollectionItem title={item.title} selected={state.selected}
          active={state.active} description="Local document" badge="DOC" />
      )}
    />
  );
}
```

CollectionView 必填 items、selectedIds/onSelectionChange、renderItem、width 和 testId。height 默认 360，最小 100；cardHeight 默认 140，范围 80–320；width 有限范围 120–20000，非有限值回退 600。自动使用 1–6 列，按至少约 160 宽的单元计算；columns 可减少列数，不能超过当前宽度允许的列数。单列窄于 160 时允许压缩。间距固定 12。应用须传入实际容器宽度，避免再套同轴滚动。

selectionMode 为 single（默认）/ multiple / none；disabled 禁止交互。onActivate 在双击或非重复 Enter 时发出意图。renderItem 收到 selected/active；卡片本身只有呈现能力。网格的透明命中层覆盖卡片，因此插槽使用文字、图标、图片等呈现内容，不放按钮或编辑器。

- 左右逐项移动；上下保持列方向，跳过禁用项和全禁用行，不完整末行选择最近可用列。
- Home/End、PageUp/PageDown 移动并滚动到目标；Space 切换当前项；Shift 范围选择、Cmd/Ctrl 增选；Cmd/Ctrl+A 增选当前页可用项，保留页外选择。
- 普通选择替换已有选择；范围仅使用当前页可用项。集合变更不自动重写 selectedIds，应用决定删除/换页后的选择保留。
- 每页最多 100 项；ID 非空、最多 128 字符且唯一。无效集合显示错误并阻止数据操作。不是虚拟网格，没有拖放或瀑布流。
- 稳定入口：根 testId、`{testId}-item-{id}`、空/非法集合 `{testId}-status`。

## 资源状态与列表

ResourceState 必填 state、testId。可传 title、description、onRetry、retryLabel、workingLabel、failureLabel、resourceKey、revision、disabled、height。默认高 180，也作为最小高度；标题/说明/失败文字最多两行，长文案需由应用留足宽高。state=error 且有回调才显示重试。

LoadMoreButton 必填 state、onLoadMore、testId，可覆盖 label、retryLabel、loadingLabel、endLabel、errorLabel，以及 resourceKey/revision/disabled。loading 和 end 阻止新请求；error 显示重试。组件不增加 items，不推断分页游标。到达 end 后不再展示内部旧错误。

```tsx
import { ResourceState, LoadMoreButton } from "@mirai/gpuix-kit/resource-state";
// reload / loadNextPage 由应用提供；Promise 表示这次操作的生命周期。
<ResourceState testId="resource" state="error" onRetry={reload}
  resourceKey={queryKey} revision={generation} description="请重试当前查询" />;
<LoadMoreButton testId="more" state={pageState} onLoadMore={loadNextPage}
  resourceKey={queryKey} revision={generation} />;
```

异步回调支持 void 或 Promise<void>。同一资源版本、同一动作在 Promise 未结束前锁定；同步异常和拒绝显示通用失败文案，不直接展示异常对象。Promise 成功只解除锁，资源 state/items 仍由应用更新。异步操作应返回完整 Promise；仅发起后台请求然后返回 void 无法维持锁。

resourceKey 默认 testId，revision 默认 0。切换查询或重新建立同 ID 资源时修改 key/revision；旧回调不得污染新的内部失败状态。卸载后也忽略旧结果。这只隔离 UIKit 的锁和反馈：请求取消、响应版本校验、数据写入和缓存由应用负责，不能依赖组件阻止应用自己的陈旧 setState。

加载期间根节点保留 Tab 入口，触发重试后焦点转到根；在 UIKit Dialog 内可继续 Tab 或 Escape。树分支也使用同样策略。不把这里的焦点登记等同于完整系统 AX。

AsyncListView 继承 ListView props（移除 loading），增加 status=loading/ready/error、errorLabel、onRetry、resourceKey、revision、refreshing 和 disabled。height 默认 260、最小 180。ready+空数组展示 empty；loading/error 展示 ResourceState；ready+有数据渲染原 ListView。refreshing 只在现有列表上方增加 28 高提示，保留内容交互；disabled 禁用当前行与失败重试。应用持有的 selectedIds 不因状态切换自动清空。首次加载、错误和空状态会卸载列表视图；不承诺恢复原生内部滚动/焦点。

列表仍接受应用已分页数据和固定行高，没有虚拟化或自动无限滚动。资源入口为 `{testId}-state`；正常列表根沿用 testId，行沿用 `{testId}-{id}`，刷新提示为 `{testId}-refreshing`。ResourceState 重试和失败入口为 `-retry`、`-error`；LoadMoreButton 为 `-button`、`-error`。

## 懒加载树

```tsx
import { LazyTreeView, type LazyTreeNode } from "@mirai/gpuix-kit/lazy-tree";
// 所有数据与展开/选择状态由使用方维护。
<LazyTreeView testId="folders" nodes={nodes} height={360}
  expandedIds={expanded} onExpandedChange={setExpanded}
  selectedIds={selected} onSelectionChange={setSelected}
  onRequestChildren={loadChildren} resourceKey={accountId} revision={generation} />;
```

LazyTreeNode 字段：id、label、disabled?、children?、hasChildren?、loadState?（unloaded/loading/ready/error）、errorLabel?、revision?。未提供 loadState 时：已有 children（包括 []）或不是分支则 ready，否则 unloaded。已加载的空分支不会反复请求。节点 disabled 仅限制此节点，不递归修改子节点状态。

LazyTreeView 必填 nodes、expandedIds/onExpandedChange、selectedIds/onSelectionChange、testId；可传 onRequestChildren(id)、onActivate(node)、selectionMode（single/multiple）、disabled、resourceKey/revision、height、emptyLabel。固定 44 高行，height 默认 360、最小 120。整个已加载树（包括隐藏节点）最多 200 项、深度 0–8；ID 非空、最多 128 字符且全树唯一，label 非空且最多 300 字符。重复、循环和超限数据展示错误，不进行部分操作。

- 点击箭头或 Right 展开 unloaded/error 分支并请求；已展开失败分支可用 Right 或 Retry 再试。外部更新 expandedIds 不会自动请求，挂载时也不自动加载。
- Right 进入已加载子节点；Left 折叠当前分支或回到父节点；上下/Home/End 移动，Space/Cmd/Ctrl/Shift 使用已有选择规则，Enter/双击激活。没有树 Cmd+A 或 Page 导航。
- 每个分支独立锁定，允许不同分支同时加载；折叠隐藏父分支不释放子请求锁。外部 loading 同样阻止重复请求。
- 应用在加载成功后提供新的 children/loadState；组件只发出请求意图。节点 revision 标识同一 ID 的新资源；移除节点或修改节点/树版本后，旧内部错误不会回流。
- testId 派生：`-row-{id}`、`-item-{id}`、`-toggle-{id}`、`-retry-{id}`；空树 `-empty`、无效树 `-invalid`。

## 验证与边界

Collections Gallery 将本批组件与 v0.15 NavigationSplitView/NavigationPane 组合；样例只使用内存数据，故意先失败再成功。运行 `bun run dev:collections`。

check 包含 122 项纯规则；本批原生宽窄窗口、状态专项、真实 macOS 窗口输入/主题截图和临时消费者 tgz 安装分别记录于仓库 docs/compatibility.json。Linux/Windows、系统文件服务、拖放、虚拟化、图片解码失败、滚动锚定、完整本地化和 AX/IME 不属于本批完成范围。
