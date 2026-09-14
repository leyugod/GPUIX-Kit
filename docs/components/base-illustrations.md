# Illustrations

[All components](index.md) · Base components · 基础组件

Public imports: `Illustration` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-illustrations.tsx)

![Light preview](../images/components/base-illustrations-light.png)

![Dark preview](../images/components/base-illustrations-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Row>
      <UI.Illustration kind="documents" />
      <UI.Illustration kind="search" />
      <UI.Illustration kind="success" />
    </UI.Row>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Illustration

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| kind | no | `"success" \| "documents" \| "search" \| undefined` |  |
| size | no | `number \| undefined` |  |
| testId | no | `string \| undefined` |  |
