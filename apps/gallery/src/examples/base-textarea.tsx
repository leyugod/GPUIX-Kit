import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Textarea
      testId="example"
      value={value}
      onValueChange={setValue}
      placeholder="Describe your project"
      minRows={3}
      maxRows={5}
    />
  );
}
