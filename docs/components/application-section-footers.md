# Section footers

[All components](index.md) · Application components · 应用组件

Public imports: `SectionFooter` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/application-section-footers.tsx)

![Light preview](../images/components/application-section-footers-light.png)

![Dark preview](../images/components/application-section-footers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.SectionFooter
      testId="example-sectionfooter"
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          Save preferences
        </UI.Button>
      }
    >
      <UI.Text>Changes apply to this workspace.</UI.Text>
    </UI.SectionFooter>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### SectionFooter

[Implementation](../../packages/uikit/src/components/sections/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| children | no | `ReactNode` |  |
| actions | no | `ReactNode` |  |
| testId | yes | `string` |  |
