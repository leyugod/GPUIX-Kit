import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.ImagePicker
        testId="example"
        value={null}
        onChoose={() => {
          setValue("Image selection requested");
        }}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
