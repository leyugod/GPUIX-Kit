# Contact sections

[All components](index.md) · Marketing components · 营销组件

Public imports: `ContactSection` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/marketing-contact-sections.tsx)

![Light preview](../images/components/marketing-contact-sections-light.png)

![Dark preview](../images/components/marketing-contact-sections-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <UI.Stack>
      <UI.ContactSection
        testId="example"
        value={value}
        onValueChange={setValue}
        onSubmit={() => {
          setSent(true);
        }}
      />
      <UI.Text>
        {sent
          ? "Demo submitted locally; connect your own delivery service."
          : ""}
      </UI.Text>
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### ContactSection

[Implementation](../../packages/uikit/src/components/marketing/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `ContactValues` |  |
| onValueChange | yes | `(value: ContactValues) => void` |  |
| onSubmit | no | `((value: ContactValues) => void \| Promise<void>) \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
