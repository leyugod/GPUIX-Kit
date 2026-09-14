# Verification code inputs

[All components](index.md) · Base components · 基础组件

Public imports: `VerificationCodeInput` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-verification-code-inputs.tsx)

![Light preview](../images/components/base-verification-code-inputs-light.png)

![Dark preview](../images/components/base-verification-code-inputs-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.VerificationCodeInput
      testId="example"
      value={value}
      onValueChange={setValue}
      length={6}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### VerificationCodeInput

[Implementation](../../packages/uikit/src/components/rating/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `string` |  |
| onValueChange | yes | `(value: string) => void` |  |
| onComplete | no | `((value: string) => void) \| undefined` |  |
| length | no | `number \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| error | no | `string \| undefined` |  |
| testId | yes | `string` |  |
