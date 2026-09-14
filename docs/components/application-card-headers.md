# Card headers

[All components](index.md) · Application components · 应用组件

Public imports: `CardHeader` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-card-headers.tsx)

![Light preview](../images/components/application-card-headers-light.png)

![Dark preview](../images/components/application-card-headers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Card>
      <UI.CardHeader
        title="Project overview"
        description="Manage your workspace"
      />
      <UI.CardContent>
        <UI.Text>Your project content</UI.Text>
      </UI.CardContent>
    </UI.Card>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### CardHeader

[Implementation](../../packages/uikit/src/layout/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
| trailing | no | `ReactNode` |  |
