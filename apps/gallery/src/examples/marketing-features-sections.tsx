import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.FeaturesSection
        testId="example"
        title="Built for desktop"
        items={[
          {
            id: "theme",
            title: "Light and dark",
            description: "One semantic color system for both themes.",
            actionLabel: "Explore themes",
          },
          {
            id: "state",
            title: "Controlled state",
            description: "Connect components to your application logic.",
            actionLabel: "Explore patterns",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
