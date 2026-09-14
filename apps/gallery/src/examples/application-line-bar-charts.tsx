import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.LineChart
      testId="example"
      width={500}
      height={220}
      categories={[
        { id: "mon", label: "Mon" },
        { id: "tue", label: "Tue" },
        { id: "wed", label: "Wed" },
      ]}
      series={[{ id: "views", label: "Views", values: [24, 48, 36] }]}
    />
  );
}
