# Color pickers

[All components](index.md) · Application components · 应用组件

Public imports: `ColorPicker`, `ColorPanel` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-color-pickers.tsx)

![Light preview](../images/components/application-color-pickers-light.png)

![Dark preview](../images/components/application-color-pickers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("#2563EB");
  const [open, setOpen] = useState(false);
  return (
    <UI.ColorPicker
      open={open}
      onOpenChange={setOpen}
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ColorPicker

[Implementation](../../packages/uikit/src/components/color/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string \| null` |  |
| onValueChange | yes | `(color: string \| null) => void` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| testId | yes | `string` |  |
| label | no | `string \| undefined` |  |
| items | no | `readonly PaletteColor[] \| undefined` |  |
| allowAlpha | no | `boolean \| undefined` |  |
| clearable | no | `boolean \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |

### ColorPanel

[Implementation](../../packages/uikit/src/components/color/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` | 文本编辑时可为未完成草稿；通道和调色板发出规范化颜色。 |
| onValueChange | yes | `(raw: string) => void` |  |
| onValueCommit | no | `((color: string) => void) \| undefined` |  |
| testId | yes | `string` |  |
| items | no | `readonly PaletteColor[] \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| allowAlpha | no | `boolean \| undefined` |  |
