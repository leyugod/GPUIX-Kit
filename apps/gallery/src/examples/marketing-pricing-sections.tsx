import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.PricingSection
        testId="example"
        title="Example plans"
        items={[
          {
            id: "starter",
            title: "Starter",
            description: "An illustrative pricing card.",
            price: "$12 / month",
            features: ["3 projects", "Basic support"],
            actionLabel: "Choose Starter",
          },
          {
            id: "team",
            title: "Team",
            description: "For a growing workspace.",
            price: "$29 / month",
            features: ["Unlimited projects", "Team settings"],
            actionLabel: "Choose Team",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
