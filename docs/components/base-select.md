# Select

[All components](index.md) · Base components · 基础组件

Public imports: `Select`, `ComboBox` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/base-select.tsx)

![Light preview](../images/components/base-select-light.png)

![Dark preview](../images/components/base-select-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("design");
  return (
    <UI.Select
      testId="example"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "design", label: "Design" },
        { value: "engineering", label: "Engineering" },
      ]}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Select

[Implementation](../../packages/uikit/src/base/selection.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` |  |
| onValueChange | yes | `(value: string) => void` |  |
| options | yes | `readonly Choice[]` |  |
| testId | yes | `string` |  |
| disabled | no | `boolean \| undefined` |  |
| style | no | `StyleDesc \| undefined` |  |
| placeholder | no | `string \| undefined` |  |
| size | no | `"sm" \| "md" \| "lg" \| undefined` |  |

### ComboBox

[Implementation](../../packages/uikit/src/components/combobox/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string \| null` |  |
| onValueChange | yes | `(value: string \| null) => void` |  |
| options | yes | `readonly ComboboxOption[]` |  |
| testId | yes | `string` |  |
| placeholder | no | `string \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| emptyLabel | no | `string \| undefined` |  |
| loadingLabel | no | `string \| undefined` |  |
| query | no | `string \| undefined` |  |
| onQueryChange | no | `((query: string) => void) \| undefined` |  |
| filter | no | `boolean \| undefined` | 服务端已过滤的当前页数据可关闭本地过滤。 |
| popupWidth | no | `number \| undefined` |  |
