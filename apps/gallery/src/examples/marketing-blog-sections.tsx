import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.BlogSection
        testId="example"
        title="From the journal"
        items={[
          {
            id: "native",
            title: "Designing a native workspace",
            description: "A practical guide to layout and controlled state.",
            meta: "Design · 5 min",
            actionLabel: "Read article",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
