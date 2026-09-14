# Breadcrumbs

[All components](index.md) · Application components · 应用组件

Public imports: `Breadcrumb`, `PathControl` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-breadcrumbs.tsx)

![Light preview](../images/components/application-breadcrumbs-light.png)

![Dark preview](../images/components/application-breadcrumbs-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("Project");
  return (
    <UI.Stack>
      <UI.Breadcrumb
        testId="example"
        items={[
          { id: "home", label: "Home" },
          { id: "projects", label: "Projects" },
          { id: "current", label: "Project" },
        ]}
        onNavigate={setValue}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Breadcrumb

[Implementation](../../packages/uikit/src/components/navigation/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| items | yes | `readonly { id: string; label: string; }[]` |  |
| onNavigate | yes | `(id: string) => void` |  |
| testId | yes | `string` |  |

### PathControl

[Implementation](../../packages/uikit/src/components/actions/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| items | yes | `readonly PathItem[]` |  |
| onNavigate | yes | `(id: string) => void` |  |
| testId | yes | `string` |  |
| maxVisible | no | `number \| undefined` |  |
| segmentWidth | no | `number \| undefined` |  |
| open | yes | `boolean` |  |
| onOpenChange | yes | `(open: boolean) => void` |  |
| disabled | no | `boolean \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| width | no | `number \| undefined` |  |
