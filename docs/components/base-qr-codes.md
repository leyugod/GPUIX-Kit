# QR codes

[All components](index.md) · Base components · 基础组件

Public imports: `QRCode` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-qr-codes.tsx)

![Light preview](../images/components/base-qr-codes-light.png)

![Dark preview](../images/components/base-qr-codes-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.QRCode
      testId="example"
      value="https://github.com/leyugod/GPUIX-Kit"
      label="GPUIX-Kit on GitHub"
      size={160}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### QRCode

[Implementation](../../packages/uikit/src/components/qr-code/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` |  |
| size | no | `number \| undefined` |  |
| level | no | `"L" \| "M" \| "Q" \| "H" \| undefined` |  |
| label | no | `string \| undefined` |  |
| testId | yes | `string` |  |
