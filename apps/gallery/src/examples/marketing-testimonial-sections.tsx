import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 示例数据只说明界面结构；真实内容与操作由应用提供。
export default function Example() {
  const [selected, setSelected] = useState("");
  return (
    <UI.Stack>
      <UI.TestimonialSection
        testId="example"
        title="Example testimonial"
        items={[
          {
            id: "alex",
            title: "Alex Chen",
            description:
              "A consistent interface helps our team focus on the work.",
            meta: "Fictional example",
            actionLabel: "Read story",
          },
        ]}
        onAction={setSelected}
      />
      <UI.Text>{selected ? "Selected: " + selected : ""}</UI.Text>
    </UI.Stack>
  );
}
