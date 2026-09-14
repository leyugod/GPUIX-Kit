# Context menus

[All components](index.md) · Base components · 基础组件

Public imports: `ContextMenu` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/base-context-menus.tsx)

![Light preview](../images/components/base-context-menus-light.png)

![Dark preview](../images/components/base-context-menus-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("Right-click the card");
  const [open, setOpen] = useState(false);
  return (
    <UI.Stack>
      <UI.ContextMenu
        open={open}
        onOpenChange={setOpen}
        testId="example"
        items={[
          {
            id: "copy",
            label: "Copy name",
            run: () => setValue("Copy requested"),
          },
        ]}
      >
        <UI.Card>
          <UI.Text>Project document</UI.Text>
        </UI.Card>
      </UI.ContextMenu>
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ContextMenu

[Implementation](../../packages/uikit/src/components/menu/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
| items | yes | `readonly MenuItem[]` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| children | yes | `ReactNode` |  |
