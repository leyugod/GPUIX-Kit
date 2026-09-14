import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("review");
  return (
    <UI.ProgressSteps
      testId="example"
      steps={[
        { id: "details", label: "Details", status: "complete" },
        {
          id: "review",
          label: "Review",
          status: value === "review" ? "current" : "complete",
        },
        {
          id: "done",
          label: "Done",
          status: value === "done" ? "current" : "pending",
        },
      ]}
      onStepChange={setValue}
    />
  );
}
