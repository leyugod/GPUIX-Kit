import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string[]>(["design"]);
  return (
    <UI.MultiSelect
      testId="example"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "design", label: "Design" },
        { value: "engineering", label: "Engineering" },
        { value: "research", label: "Research" },
      ]}
    />
  );
}
