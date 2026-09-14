# Command menus

[All components](index.md) · Application components · 应用组件

Public imports: `CommandPalette` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-command-menus.tsx)

![Light preview](../images/components/application-command-menus-light.png)

![Dark preview](../images/components/application-command-menus-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.Button testId="example-open" onPress={() => setOpen(true)}>
        Open commands
      </UI.Button>
      <UI.CommandPalette
        testId="example"
        open={open}
        onOpenChange={setOpen}
        commands={[
          {
            id: "new",
            label: "New project",
            run: () => setValue("New project requested"),
          },
        ]}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### CommandPalette

[Implementation](../../packages/uikit/src/components/command/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| commands | yes | `readonly Command[]` |  |
| title | no | `string \| undefined` |  |
| placeholder | no | `string \| undefined` |  |
| emptyLabel | no | `string \| undefined` |  |
| testId | yes | `string` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| restoreFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
