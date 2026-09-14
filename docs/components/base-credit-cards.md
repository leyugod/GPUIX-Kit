# Credit cards

[All components](index.md) · Base components · 基础组件

Public imports: `CreditCard` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-credit-cards.tsx)

![Light preview](../images/components/base-credit-cards-light.png)

![Dark preview](../images/components/base-credit-cards-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.CreditCard
      testId="example"
      holder="Alex Chen"
      last4="4242"
      expiry="12/29"
      brand="Card"
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### CreditCard

[Implementation](../../packages/uikit/src/components/identity/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| holder | yes | `string` |  |
| last4 | yes | `string` |  |
| brand | no | `string \| undefined` |  |
| expiry | no | `string \| undefined` |  |
| testId | yes | `string` |  |
