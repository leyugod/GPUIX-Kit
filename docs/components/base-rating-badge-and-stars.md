# Rating badge and stars

[All components](index.md) · Base components · 基础组件

Public imports: `RatingStars`, `RatingBadge` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/docs/catalog-completion.md) · [Runnable source](../../apps/gallery/src/examples/base-rating-badge-and-stars.tsx)

![Light preview](../images/components/base-rating-badge-and-stars-light.png)

![Dark preview](../images/components/base-rating-badge-and-stars-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState(3);
  return (
    <UI.Stack>
      <UI.RatingStars testId="example" value={value} onValueChange={setValue} />
      <UI.RatingBadge testId="example-ratingbadge" value={value} count={128} />
    </UI.Stack>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### RatingStars

[Implementation](../../packages/uikit/src/components/rating/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `number` |  |
| onValueChange | no | `((value: number) => void) \| undefined` |  |
| max | no | `number \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |

### RatingBadge

[Implementation](../../packages/uikit/src/components/rating/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `number` |  |
| count | no | `number \| undefined` |  |
| testId | yes | `string` |  |
