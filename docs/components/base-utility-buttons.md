# Utility buttons

[All components](index.md) · Base components · 基础组件

Public imports: `UtilityButton`, `IconButton` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-utility-buttons.tsx)

![Light preview](../images/components/base-utility-buttons-light.png)

![Dark preview](../images/components/base-utility-buttons-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.UtilityButton
        testId="example"
        label="Copy link"
        onPress={() => setValue("Copy link requested")}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### UtilityButton

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
| style | no | `StyleDesc \| undefined` |  |
| onPress | yes | `() => void` |  |
| variant | no | `ButtonVariant \| undefined` |  |
| size | no | `"sm" \| "md" \| "lg" \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| loadingText | no | `string \| undefined` |  |
| leading | no | `ReactNode` |  |
| trailing | no | `ReactNode` |  |
| fullWidth | no | `boolean \| undefined` |  |
| labelLines | no | `number \| undefined` | 组合控件可显式限制标签行数，避免长名称撑破固定宽度。 |
| ref | no | `ControlRef \| undefined` |  |
| onKeyDown | no | `((event: EventPayload) => boolean \| void) \| undefined` |  |
| label | yes | `string` |  |

### IconButton

[Implementation](../../packages/uikit/src/overlays/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
| style | no | `StyleDesc \| undefined` |  |
| onPress | yes | `() => void` |  |
| variant | no | `ButtonVariant \| undefined` |  |
| size | no | `"sm" \| "md" \| "lg" \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| loadingText | no | `string \| undefined` |  |
| fullWidth | no | `boolean \| undefined` |  |
| labelLines | no | `number \| undefined` | 组合控件可显式限制标签行数，避免长名称撑破固定宽度。 |
| ref | no | `ControlRef \| undefined` |  |
| onKeyDown | no | `((event: EventPayload) => boolean \| void) \| undefined` |  |
| label | yes | `string` |  |
| icon | yes | `ReactNode` |  |
