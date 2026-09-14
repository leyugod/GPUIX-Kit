import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.MetricsSection
        testId="example"
        title="Example metrics"
        items={[
          {
            id: "projects",
            title: "128",
            description: "Demo projects",
            meta: "Workspace",
          },
          {
            id: "uptime",
            title: "99.9%",
            description: "Illustrative availability",
            meta: "Sample data",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
