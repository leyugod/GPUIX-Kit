# Pricing sections

[All components](index.md) · Marketing components · 营销组件

Public imports: `PricingSection` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/marketing-pricing-sections.tsx)

![Light preview](../images/components/marketing-pricing-sections-light.png)

![Dark preview](../images/components/marketing-pricing-sections-dark.png)

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
      <UI.PricingSection
        testId="example"
        title="Example plans"
        items={[
          {
            id: "starter",
            title: "Starter",
            description: "An illustrative pricing card.",
            price: "$12 / month",
            features: ["3 projects", "Basic support"],
            actionLabel: "Choose Starter",
          },
          {
            id: "team",
            title: "Team",
            description: "For a growing workspace.",
            price: "$29 / month",
            features: ["Unlimited projects", "Team settings"],
            actionLabel: "Choose Team",
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

### PricingSection

[Implementation](../../packages/uikit/src/components/marketing/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| title | yes | `string` |  |
| description | no | `string \| undefined` |  |
| items | no | `readonly SectionItem[] \| undefined` |  |
| actions | no | `ReactNode` |  |
| onAction | no | `((id: string) => void) \| undefined` |  |
| testId | yes | `string` |  |
