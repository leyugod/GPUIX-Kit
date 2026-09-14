import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  return (
    <UI.Stack>
      <UI.NewsletterCTA
        testId="example"
        value={value}
        onValueChange={setValue}
        onSubscribe={() => {
          setDone(true);
        }}
      />
      <UI.Text>
        {done
          ? "Demo submitted locally; connect your own subscription service."
          : ""}
      </UI.Text>
    </UI.Stack>
  );
}
