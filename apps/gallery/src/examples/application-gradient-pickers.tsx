import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<UI.GradientValue>({
    angle: 90,
    stops: [
      { id: "start", position: 0, color: "#2563EB" },
      { id: "end", position: 1, color: "#EC4899" },
    ],
  });
  return (
    <UI.GradientPicker
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
