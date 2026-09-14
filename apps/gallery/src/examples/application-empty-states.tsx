import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.EmptyState
      title="No projects yet"
      description="Create a project to get started."
      action={
        <UI.Button
          testId="example"
          onPress={() => setValue("Project requested")}
        >
          {value || "New project"}
        </UI.Button>
      }
    />
  );
}
