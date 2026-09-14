# Activity gauges

[All components](index.md) · Application components · 应用组件

Public imports: `ActivityGauge` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-activity-gauges.tsx)

![Light preview](../images/components/application-activity-gauges-light.png)

![Dark preview](../images/components/application-activity-gauges-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.ActivityGauge testId="example" value={72} label="Weekly activity" />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ActivityGauge

[Implementation](../../packages/uikit/src/components/gauges/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `number` |  |
| max | no | `number \| undefined` |  |
| label | yes | `string` |  |
| testId | yes | `string` |  |
