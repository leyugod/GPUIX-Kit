import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("local");
  return (
    <UI.RadioGroup
      testId="example"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "local", label: "Local" },
        { value: "shared", label: "Shared" },
      ]}
    />
  );
}
