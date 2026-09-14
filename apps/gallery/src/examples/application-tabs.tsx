import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("overview");
  return (
    <UI.Stack>
      <UI.Tabs
        testId="example"
        value={value}
        onValueChange={setValue}
        panels={{
          overview: <UI.Text>Overview panel</UI.Text>,
          activity: <UI.Text>Activity panel</UI.Text>,
        }}
        options={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity" },
        ]}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
