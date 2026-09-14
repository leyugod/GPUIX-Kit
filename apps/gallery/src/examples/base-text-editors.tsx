import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<UI.RichBlock[]>([
    {
      id: "intro",
      kind: "paragraph",
      text: "Write your first native document.",
    },
  ]);
  return (
    <UI.RichTextEditor
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
