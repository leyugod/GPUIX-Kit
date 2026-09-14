import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [visible, setVisible] = useState(true);
  return (
    <UI.Stack>
      {visible ? (
        <UI.NoticeCard
          testId="example"
          title="Export ready"
          description="Your document is ready."
          onDismiss={() => setVisible(false)}
        />
      ) : (
        <UI.Button testId="restore" onPress={() => setVisible(true)}>
          Show notification
        </UI.Button>
      )}
    </UI.Stack>
  );
}
