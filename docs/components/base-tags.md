# Tags

[All components](index.md) · Base components · 基础组件

Public imports: `Tag`, `TokenField`, `TokenEditor` from `@mirai/gpuix-kit`.

[Behavior and host boundaries](../../packages/uikit/README.md) · [Runnable source](../../apps/gallery/src/examples/base-tags.tsx)

![Light preview](../images/components/base-tags-light.png)

![Dark preview](../images/components/base-tags-dark.png)

## Example

Render inside `UIKitProvider` and `AppShell`; see [quick start](../getting-started.md). State and service callbacks belong to your application.

```tsx
import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [visible, setVisible] = useState(true);
  return (
    <UI.Row>
      {visible ? (
        <UI.Tag
          testId="example"
          onRemove={() => setVisible(false)}
          label="Design"
        />
      ) : (
        <UI.Button testId="restore" onPress={() => setVisible(true)}>
          Restore tag
        </UI.Button>
      )}
    </UI.Row>
  );
}
```

## Props

Generated from the shipped TypeScript API. For model types and supporting helpers see the [full API index](../api-index.md).

### Tag

[Implementation](../../packages/uikit/src/components/tags/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| label | yes | `string` |  |
| testId | yes | `string` |  |
| tone | no | `Tone \| undefined` |  |
| selected | no | `boolean \| undefined` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| onPress | no | `(() => void) \| undefined` |  |
| onRemove | no | `(() => void) \| undefined` |  |
| maxWidth | no | `number \| undefined` |  |
| ref | no | `Ref<Instance> \| undefined` |  |
| onKeyDown | no | `((event: EventPayload) => boolean \| void) \| undefined` |  |

### TokenField

[Implementation](../../packages/uikit/src/components/tags/index.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `readonly Token[]` |  |
| onValueChange | yes | `(value: Token[]) => void` |  |
| inputValue | yes | `string` |  |
| onInputValueChange | yes | `(value: string) => void` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| label | no | `string \| undefined` |  |
| placeholder | no | `string \| undefined` |  |
| addLabel | no | `string \| undefined` |  |
| hint | no | `string \| undefined` |  |
| testId | yes | `string` |  |
| maxTokens | no | `number \| undefined` |  |
| maxTokenLength | no | `number \| undefined` |  |
| caseSensitive | no | `boolean \| undefined` |  |
| separators | no | `readonly string[] \| undefined` |  |
| validateToken | no | `((label: string) => string \| null) \| undefined` |  |
| createToken | no | `((label: string) => Token) \| undefined` |  |

### TokenEditor

[Implementation](../../packages/uikit/src/components/token-input/editor.tsx)

| Prop | Required | Type | Description |
| --- | --- | --- | --- |
| value | yes | `readonly EditableToken[]` |  |
| onValueChange | yes | `(value: EditableToken[]) => void` |  |
| page | yes | `number` |  |
| onPageChange | yes | `(page: number) => void` |  |
| pageSize | no | `number \| undefined` |  |
| testId | yes | `string` |  |
| disabled | no | `boolean \| undefined` |  |
| readOnly | no | `boolean \| undefined` |  |
| loading | no | `boolean \| undefined` |  |
| label | no | `string \| undefined` |  |
| allowClear | no | `boolean \| undefined` |  |
| maxTokens | no | `number \| undefined` |  |
| maxTokenLength | no | `number \| undefined` |  |
| caseSensitive | no | `boolean \| undefined` |  |
| validateToken | no | `((label: string) => string \| null) \| undefined` |  |
