# Badge groups

[All components](index.md) · Base components · 基础组件

Public imports: `BadgeGroup` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-badge-groups.tsx)

![Light preview](../images/components/base-badge-groups-light.png)

![Dark preview](../images/components/base-badge-groups-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.BadgeGroup testId="example" label="New">
      Version 0.20 is ready
    </UI.BadgeGroup>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### BadgeGroup

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| label | yes | `string` |  |
| children | yes | `string` |  |
| tone | no | `Tone \| undefined` |  |
| onPress | no | `(() => void) \| undefined` |  |
| testId | yes | `string` |  |
