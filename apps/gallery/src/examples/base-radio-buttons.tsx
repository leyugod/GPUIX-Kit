import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <UI.RadioButton
      testId="example"
      label="Local workspace"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
