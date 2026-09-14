import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.TeamSection
        testId="example"
        title="Meet the sample team"
        items={[
          {
            id: "alex",
            title: "Alex Chen",
            description: "Designs native desktop experiences.",
            meta: "Product designer",
            actionLabel: "View profile",
          },
          {
            id: "sam",
            title: "Sam Lee",
            description: "Builds reusable application components.",
            meta: "Engineer",
            actionLabel: "View profile",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
