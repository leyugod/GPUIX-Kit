import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.SocialProofSection
        testId="example"
        title="Example partners"
        items={[
          {
            id: "northstar",
            title: "Northstar",
            description: "Sample organization",
            meta: "Design",
          },
          {
            id: "orbital",
            title: "Orbital",
            description: "Sample organization",
            meta: "Engineering",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
