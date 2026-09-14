# Content & rich text sections

[All components](index.md) · Marketing components · 营销组件

Public imports: `RichContentSection` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/marketing-content-rich-text-sections.tsx)

![Light preview](../images/components/marketing-content-rich-text-sections-light.png)

![Dark preview](../images/components/marketing-content-rich-text-sections-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.RichContentSection
      testId="example-richcontentsection"
      title="Our story"
    >
      <UI.Text>
        Build thoughtful native experiences with reusable components.
      </UI.Text>
    </UI.RichContentSection>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### RichContentSection

[Implementation](../../packages/uikit/src/components/marketing/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| title | yes | `string` |  |
| children | yes | `ReactNode` |  |
| testId | yes | `string` |  |
