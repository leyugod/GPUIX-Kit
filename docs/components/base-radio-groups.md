# Radio groups

[All components](index.md) · Base components · 基础组件

Public imports: `RadioGroup`, `RadioCardGroup` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-radio-groups.tsx)

![Light preview](../images/components/base-radio-groups-light.png)

![Dark preview](../images/components/base-radio-groups-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("local");
  return (
    <UI.RadioGroup
      testId="example"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "local", label: "Local" },
        { value: "shared", label: "Shared" },
      ]}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### RadioGroup

[Implementation](../../packages/uikit/src/base/selection.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` |  |
| onValueChange | yes | `(value: string) => void` |  |
| options | yes | `readonly Choice[]` |  |
| testId | yes | `string` |  |
| disabled | no | `boolean \| undefined` |  |
| style | no | `StyleDesc \| undefined` |  |

### RadioCardGroup

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| items | yes | `readonly RadioCardOption[]` |  |
| value | yes | `string \| null` |  |
| onValueChange | yes | `(id: string) => void` |  |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
