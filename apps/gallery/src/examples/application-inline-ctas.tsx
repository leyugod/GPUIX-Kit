import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.InlineCTA
      testId="example-inlinecta"
      title="Invite your team"
      description={value || "Work together on your next project"}
      actions={
        <UI.Button
          testId="example"
          onPress={() => setValue("Invitation requested")}
        >
          Invite
        </UI.Button>
      }
    />
  );
}
