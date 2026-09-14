import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <UI.Stack>
      <UI.ContactSection
        testId="example"
        value={value}
        onValueChange={setValue}
        onSubmit={() => {
          setSent(true);
        }}
      />
      <UI.Text>
        {sent
          ? "Demo submitted locally; connect your own delivery service."
          : ""}
      </UI.Text>
    </UI.Stack>
  );
}
