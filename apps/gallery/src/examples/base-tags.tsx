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
