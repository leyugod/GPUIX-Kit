import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState(40);
  return (
    <UI.Slider
      testId="example"
      value={value}
      onValueChange={setValue}
      min={0}
      max={100}
      step={1}
      length={400}
      label="Volume"
    />
  );
}
