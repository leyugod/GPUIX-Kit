import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("Not selected");
  return (
    <UI.Stack>
      <UI.ButtonGroup
        testId="example"
        items={[
          { id: "save", label: "Save", run: () => setValue("Saved") },
          { id: "cancel", label: "Cancel", run: () => setValue("Cancelled") },
        ]}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
