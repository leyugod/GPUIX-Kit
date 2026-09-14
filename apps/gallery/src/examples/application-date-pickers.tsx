import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("2026-09-14");
  const [month, setMonth] = useState("2026-09");
  return (
    <UI.DatePicker
      month={month}
      onMonthChange={setMonth}
      testId="example"
      value={value}
      onValueChange={setValue}
    />
  );
}
