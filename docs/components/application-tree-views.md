# Tree views

[All components](index.md) · Application components · 应用组件

Public imports: `TreeView`, `LazyTreeView` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-tree-views.tsx)

![Light preview](../images/components/application-tree-views-light.png)

![Dark preview](../images/components/application-tree-views-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(["project"]);
  return (
    <UI.TreeView
      testId="example"
      nodes={[
        {
          id: "project",
          label: "Project",
          children: [
            { id: "src", label: "Source" },
            { id: "docs", label: "Docs" },
          ],
        },
      ]}
      selectedIds={selected}
      onSelectionChange={setSelected}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      height={240}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### TreeView

[Implementation](../../packages/uikit/src/components/tree-view/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| nodes | yes | `readonly TreeNode[]` |  |
| expandedIds | yes | `readonly string[]` |  |
| onExpandedChange | yes | `(ids: string[]) => void` |  |
| selectedIds | yes | `readonly string[]` |  |
| onSelectionChange | yes | `(ids: string[]) => void` |  |
| onActivate | no | `((node: TreeNode) => void) \| undefined` |  |
| onRequestChildren | no | `((id: string) => void) \| undefined` |  |
| selectionMode | no | `"single" \| "multiple" \| undefined` |  |
| height | no | `number \| undefined` |  |
| testId | yes | `string` |  |
| loading | no | `boolean \| undefined` |  |

### LazyTreeView

[Implementation](../../packages/uikit/src/components/lazy-tree/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| nodes | yes | `readonly LazyTreeNode[]` |  |
| expandedIds | yes | `readonly string[]` |  |
| onExpandedChange | yes | `(ids: string[]) => void` |  |
| selectedIds | yes | `readonly string[]` |  |
| onSelectionChange | yes | `(ids: string[]) => void` |  |
| onRequestChildren | no | `((id: string) => void \| Promise<void>) \| undefined` |  |
| onActivate | no | `((node: LazyTreeNode) => void) \| undefined` |  |
| height | no | `number \| undefined` |  |
| selectionMode | no | `"single" \| "multiple" \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| resourceKey | no | `string \| undefined` |  |
| revision | no | `string \| number \| undefined` |  |
| emptyLabel | no | `string \| undefined` |  |
| testId | yes | `string` |  |
