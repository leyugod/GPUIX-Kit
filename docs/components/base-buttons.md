# Buttons

[All components](index.md) · Base components · 基础组件

Public imports: `Button` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/base-buttons.tsx)

![Light preview](../images/components/base-buttons-light.png)

![Dark preview](../images/components/base-buttons-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 多个外观共享同一受控交互；业务动作由使用方替换。
export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <UI.Stack gap={18}>
      <UI.Row>
        <UI.Button
          testId="example"
          variant="primary"
          onPress={() => setCount(count + 1)}
        >
          Primary action
        </UI.Button>
        <UI.Button
          testId="example-secondary"
          onPress={() => setCount(count + 1)}
        >
          Secondary
        </UI.Button>
        <UI.Button
          testId="example-ghost"
          variant="ghost"
          onPress={() => setCount(0)}
        >
          Reset
        </UI.Button>
        <UI.Button testId="example-disabled" onPress={() => {}} disabled>
          Disabled
        </UI.Button>
      </UI.Row>
      <UI.Text testId="example-count">Clicked {count} times</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Button

[Implementation](../../packages/uikit/src/base/button.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| children | no | `ReactNode` |  |
| onPress | yes | `() => void` |  |
| testId | yes | `string` |  |
| variant | no | `ButtonVariant \| undefined` |  |
| size | no | `"sm" \| "md" \| "lg" \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| loadingText | no | `string \| undefined` |  |
| leading | no | `ReactNode` |  |
| trailing | no | `ReactNode` |  |
| fullWidth | no | `boolean \| undefined` |  |
| labelLines | no | `number \| undefined` | 组合控件可显式限制标签行数，避免长名称撑破固定宽度。 |
| style | no | `StyleDesc \| undefined` |  |
| ref | no | `ControlRef \| undefined` |  |
| onKeyDown | no | `((event: EventPayload) => boolean \| void) \| undefined` |  |
