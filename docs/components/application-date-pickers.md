# Date pickers

[All components](index.md) · Application components · 应用组件

Public imports: `DatePicker`, `DateRangePicker` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/application-date-pickers.tsx)

![Light preview](../images/components/application-date-pickers-light.png)

![Dark preview](../images/components/application-date-pickers-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("2026-09-14");
  const [month, setMonth] = useState("2026-09");
  return (
    <UI.DatePicker
      month={month}
      onMonthChange={setMonth}
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### DatePicker

[Implementation](../../packages/uikit/src/components/calendar/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| onValueChange | yes | `(value: string \| null) => void` |  |
| placeholder | no | `string \| undefined` |  |
| clearLabel | no | `string \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
| value | yes | `string \| null` |  |
| min | no | `string \| undefined` |  |
| max | no | `string \| undefined` |  |
| month | yes | `string` |  |
| onMonthChange | yes | `(month: string) => void` |  |
| isDateDisabled | no | `((date: string) => boolean) \| undefined` |  |
| navigation | no | `"arrows" \| "month-year" \| undefined` |  |
| weekStartsOn | no | `0 \| 1 \| undefined` |  |
| locale | no | `string \| undefined` |  |
| today | no | `string \| undefined` |  |
| autoFocus | no | `boolean \| undefined` |  |

### DateRangePicker

[Implementation](../../packages/uikit/src/components/calendar/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| onValueChange | yes | `(value: DateRange) => void` |  |
| placeholder | no | `string \| undefined` |  |
| clearLabel | no | `string \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| testId | yes | `string` |  |
| value | yes | `DateRange` |  |
| min | no | `string \| undefined` |  |
| max | no | `string \| undefined` |  |
| month | yes | `string` |  |
| onMonthChange | yes | `(month: string) => void` |  |
| isDateDisabled | no | `((date: string) => boolean) \| undefined` |  |
| navigation | no | `"arrows" \| "month-year" \| undefined` |  |
| weekStartsOn | no | `0 \| 1 \| undefined` |  |
| locale | no | `string \| undefined` |  |
| today | no | `string \| undefined` |  |
| autoFocus | no | `boolean \| undefined` |  |
| maxRangeDays | no | `number \| undefined` |  |
