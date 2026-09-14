import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("Project");
  return (
    <UI.Stack>
      <UI.Breadcrumb
        testId="example"
        items={[
          { id: "home", label: "Home" },
          { id: "projects", label: "Projects" },
          { id: "current", label: "Project" },
        ]}
        onNavigate={setValue}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
