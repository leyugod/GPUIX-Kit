# Blog sections

[All components](index.md) · Marketing components · 营销组件

Public imports: `BlogSection` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/marketing-blog-sections.tsx)

![Light preview](../images/components/marketing-blog-sections-light.png)

![Dark preview](../images/components/marketing-blog-sections-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.BlogSection
        testId="example"
        title="From the journal"
        items={[
          {
            id: "native",
            title: "Designing a native workspace",
            description: "A practical guide to layout and controlled state.",
            meta: "Design · 5 min",
            actionLabel: "Read article",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### BlogSection

[Implementation](../../packages/uikit/src/components/marketing/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
| items | no | `readonly SectionItem[] \| undefined` |  |
| actions | no | `ReactNode` |  |
| onAction | no | `((id: string) => void) \| undefined` |  |
| testId | yes | `string` |  |
