import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("#2563EB");
  const [open, setOpen] = useState(false);
  return (
    <UI.ColorPicker
      open={open}
      onOpenChange={setOpen}
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
