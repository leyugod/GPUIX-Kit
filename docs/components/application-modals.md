# Modals

[All components](index.md) · Application components · 应用组件

Public imports: `Dialog`, `AlertDialog`, `ConfirmDialog`, `PromptDialog` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-modals.tsx)

![Light preview](../images/components/application-modals-light.png)

![Dark preview](../images/components/application-modals-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <UI.Stack>
      <UI.Button testId="example-open" onPress={() => setOpen(true)}>
        Open dialog
      </UI.Button>
      <UI.Dialog
        testId="example"
        open={open}
        onOpenChange={setOpen}
        title="Project details"
        footer={
          <UI.Button testId="example-close" onPress={() => setOpen(false)}>
            Done
          </UI.Button>
        }
      >
        <UI.Text>Reusable native modal content.</UI.Text>
      </UI.Dialog>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Dialog

[Implementation](../../packages/uikit/src/components/modal/surface.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
| children | no | `ReactNode` |  |
| footer | no | `ReactNode` |  |
| testId | yes | `string` |  |
| width | no | `number \| undefined` |  |
| height | no | `number \| undefined` |  |
| closeLabel | no | `string \| undefined` |  |
| restoreFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
| dismissOnBackdrop | no | `boolean \| undefined` |  |
| initialFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
| bodyScrollOffset | no | `number \| undefined` |  |
| surfaceRef | no | `RefObject<Instance \| null> \| undefined` |  |
| dismissible | no | `boolean \| undefined` |  |
| showClose | no | `boolean \| undefined` |  |
| presentation | no | `ModalPresentation \| undefined` |  |
| side | no | `"left" \| "right" \| undefined` |  |

### AlertDialog

[Implementation](../../packages/uikit/src/components/modal/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| children | no | `ReactNode` |  |
| acknowledgeLabel | no | `string \| undefined` |  |
| testId | yes | `string` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| restoreFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
| width | no | `number \| undefined` |  |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |

### ConfirmDialog

[Implementation](../../packages/uikit/src/components/modal/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| children | no | `ReactNode` |  |
| onConfirm | yes | `() => void \| Promise<void>` |  |
| confirmLabel | no | `string \| undefined` |  |
| cancelLabel | no | `string \| undefined` |  |
| destructive | no | `boolean \| undefined` |  |
| revision | no | `string \| number \| undefined` |  |
| errorLabel | no | `string \| undefined` |  |
| testId | yes | `string` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| restoreFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
| width | no | `number \| undefined` |  |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |

### PromptDialog

[Implementation](../../packages/uikit/src/components/modal/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` |  |
| onSubmit | yes | `(value: string) => void \| Promise<void>` |  |
| validate | no | `((value: string) => string \| null) \| undefined` |  |
| label | no | `string \| undefined` |  |
| placeholder | no | `string \| undefined` |  |
| submitLabel | no | `string \| undefined` |  |
| cancelLabel | no | `string \| undefined` |  |
| revision | no | `string \| number \| undefined` |  |
| errorLabel | no | `string \| undefined` |  |
| testId | yes | `string` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| restoreFocusRef | no | `RefObject<Instance \| null> \| undefined` |  |
| width | no | `number \| undefined` |  |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
