import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("overview");
  return (
    <UI.HeaderNavigation
      testId="example"
      value={value}
      onValueChange={setValue}
      items={[
        { id: "overview", label: "Overview" },
        { id: "projects", label: "Projects" },
        { id: "settings", label: "Settings" },
      ]}
    />
  );
}
