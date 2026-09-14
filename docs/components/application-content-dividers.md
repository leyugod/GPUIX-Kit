# Content dividers

[All components](index.md) · Application components · 应用组件

Public imports: `ContentDivider`, `Separator` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-content-dividers.tsx)

![Light preview](../images/components/application-content-dividers-light.png)

![Dark preview](../images/components/application-content-dividers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Stack>
      <UI.Text>Account settings</UI.Text>
      <UI.ContentDivider testId="example-contentdivider" label="Preferences" />
      <UI.Text>Theme and notifications</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ContentDivider

[Implementation](../../packages/uikit/src/components/sections/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| label | no | `string \| undefined` |  |
| orientation | no | `"horizontal" \| "vertical" \| undefined` |  |
| testId | yes | `string` |  |

### Separator

[Implementation](../../packages/uikit/src/base/primitives.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| testId | no | `string \| undefined` |  |
| style | no | `StyleDesc \| undefined` |  |
