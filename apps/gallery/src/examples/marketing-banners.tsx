import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [visible, setVisible] = useState(true);
  return (
    <UI.Stack>
      {visible ? (
        <UI.Banner testId="example" onDismiss={() => setVisible(false)}>
          A new version is available.
        </UI.Banner>
      ) : (
        <UI.Button testId="restore" onPress={() => setVisible(true)}>
          Show banner
        </UI.Button>
      )}
    </UI.Stack>
  );
}
