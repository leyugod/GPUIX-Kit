# Loading indicators

[All components](index.md) · Application components · 应用组件

Public imports: `LoadingIndicator`, `Skeleton` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-loading-indicators.tsx)

![Light preview](../images/components/application-loading-indicators-light.png)

![Dark preview](../images/components/application-loading-indicators-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Stack>
      <UI.LoadingIndicator testId="example" label="Loading projects" />
      <UI.Skeleton style={{ width: 280, height: 24 }} />
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### LoadingIndicator

[Implementation](../../packages/uikit/src/components/gauges/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| label | no | `string \| undefined` |  |
| active | no | `boolean \| undefined` |  |
| reducedMotion | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |

### Skeleton

[Implementation](../../packages/uikit/src/data/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| testId | no | `string \| undefined` |  |
| style | no | `StyleDesc \| undefined` |  |
