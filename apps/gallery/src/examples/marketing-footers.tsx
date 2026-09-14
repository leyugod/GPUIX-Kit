import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.FooterSection
        testId="example"
        brand="GPUIX-Kit"
        links={[
          { id: "docs", label: "Documentation" },
          { id: "github", label: "GitHub" },
        ]}
        onNavigate={setValue}
        copyright="Your project"
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
