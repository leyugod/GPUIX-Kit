import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("one");
  return (
    <UI.Carousel
      testId="example"
      value={value}
      onValueChange={setValue}
      items={[
        {
          id: "one",
          label: "Welcome",
          content: <UI.Text size={24}>Build a native app</UI.Text>,
        },
        {
          id: "two",
          label: "Theme",
          content: <UI.Text size={24}>Light and dark themes</UI.Text>,
        },
      ]}
    />
  );
}
