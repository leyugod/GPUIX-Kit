import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 多个外观共享同一受控交互；业务动作由使用方替换。
export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <UI.Stack gap={18}>
      <UI.Row>
        <UI.Button
          testId="example"
          variant="primary"
          onPress={() => setCount(count + 1)}
        >
          Primary action
        </UI.Button>
        <UI.Button
          testId="example-secondary"
          onPress={() => setCount(count + 1)}
        >
          Secondary
        </UI.Button>
        <UI.Button
          testId="example-ghost"
          variant="ghost"
          onPress={() => setCount(0)}
        >
          Reset
        </UI.Button>
        <UI.Button testId="example-disabled" onPress={() => {}} disabled>
          Disabled
        </UI.Button>
      </UI.Row>
      <UI.Text testId="example-count">Clicked {count} times</UI.Text>
    </UI.Stack>
  );
}
