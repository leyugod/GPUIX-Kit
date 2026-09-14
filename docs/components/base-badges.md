# Badges

[All components](index.md) · Base components · 基础组件

Public imports: `Badge` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/base-badges.tsx)

![Light preview](../images/components/base-badges-light.png)

![Dark preview](../images/components/base-badges-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Row>
      <UI.Badge tone="success">Active</UI.Badge>
      <UI.Badge tone="warning">Pending</UI.Badge>
    </UI.Row>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Badge

[Implementation](../../packages/uikit/src/data/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| children | no | `ReactNode` |  |
| style | no | `StyleDesc \| undefined` |  |
| testId | no | `string \| undefined` |  |
| tone | no | `Tone \| undefined` |  |
