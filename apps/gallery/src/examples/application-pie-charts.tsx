import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.PieChart
      testId="example"
      data={[
        { id: "design", label: "Design", value: 40 },
        { id: "build", label: "Build", value: 60 },
      ]}
      size={200}
    />
  );
}
