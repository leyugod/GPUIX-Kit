import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.AppStoreButton
        testId="example"
        store="apple"
        onPress={() => setValue("Open App Store requested")}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
