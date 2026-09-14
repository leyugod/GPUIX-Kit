# Page headers

[All components](index.md) · Application components · 应用组件

Public imports: `PageHeader` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-page-headers.tsx)

![Light preview](../images/components/application-page-headers-light.png)

![Dark preview](../images/components/application-page-headers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.PageHeader
      testId="example-pageheader"
      title="Projects"
      description="Manage your team workspace"
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          New project
        </UI.Button>
      }
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### PageHeader

[Implementation](../../packages/uikit/src/components/sections/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
| eyebrow | no | `string \| undefined` |  |
| actions | no | `ReactNode` |  |
| leading | no | `ReactNode` |  |
| testId | yes | `string` |  |
| breadcrumbs | no | `ReactNode` |  |
| tabs | no | `ReactNode` |  |
