# Image pickers

[All components](index.md) · Application components · 应用组件

Public imports: `ImagePicker`, `ImageViewer` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-image-pickers.tsx)

![Light preview](../images/components/application-image-pickers-light.png)

![Dark preview](../images/components/application-image-pickers-dark.png)

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
      <UI.ImagePicker
        testId="example"
        value={null}
        onChoose={() => {
          setValue("Image selection requested");
        }}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ImagePicker

[Implementation](../../packages/uikit/src/components/media/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `ImageValue \| null` |  |
| onChoose | no | `(() => void \| Promise<void>) \| undefined` |  |
| onRemove | no | `(() => void \| Promise<void>) \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| error | no | `string \| undefined` |  |
| revision | no | `string \| number \| undefined` |  |
| testId | yes | `string` |  |

### ImageViewer

[Implementation](../../packages/uikit/src/components/media/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| image | yes | `ImageValue \| null` |  |
| zoom | no | `number \| undefined` |  |
| onZoomChange | no | `((zoom: number) => void) \| undefined` |  |
| height | no | `number \| undefined` |  |
| testId | yes | `string` |  |
