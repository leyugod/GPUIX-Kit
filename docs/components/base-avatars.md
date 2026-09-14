# Avatars

[All components](index.md) · Base components · 基础组件

Public imports: `Avatar`, `AvatarGroup`, `AvatarLabelGroup` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-avatars.tsx)

![Light preview](../images/components/base-avatars-light.png)

![Dark preview](../images/components/base-avatars-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.AvatarGroup
      testId="example"
      items={[
        { id: "alex", name: "Alex Chen" },
        { id: "sam", name: "Sam Lee" },
        { id: "jo", name: "Jo Park" },
      ]}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Avatar

[Implementation](../../packages/uikit/src/data/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| name | yes | `string` |  |
| size | no | `number \| undefined` |  |
| src | no | `string \| undefined` |  |
| testId | no | `string \| undefined` |  |

### AvatarGroup

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| items | yes | `readonly AvatarMember[]` |  |
| max | no | `number \| undefined` |  |
| onOverflow | no | `(() => void) \| undefined` |  |
| testId | yes | `string` |  |

### AvatarLabelGroup

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| name | yes | `string` |  |
| src | no | `string \| undefined` |  |
| description | no | `string \| undefined` |  |
| actions | no | `ReactNode` |  |
| testId | yes | `string` |  |
