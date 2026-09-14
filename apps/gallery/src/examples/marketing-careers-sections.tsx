import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.CareersSection
        testId="example"
        title="Open roles"
        items={[
          {
            id: "engineer",
            title: "Desktop engineer",
            description: "Build thoughtful native experiences.",
            meta: "Remote · Full time",
            actionLabel: "View role",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
