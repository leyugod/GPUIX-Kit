import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <UI.Checkbox
      testId="example"
      label="Receive updates"
      checked={checked}
      onCheckedChange={(v) => setChecked(v === true)}
    />
  );
}
