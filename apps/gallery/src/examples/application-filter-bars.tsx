import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<UI.FilterState>({ query: "", values: {} });
  return (
    <UI.FilterBar
      testId="example"
      value={value}
      onValueChange={setValue}
      placeholder="Search projects"
    />
  );
}
