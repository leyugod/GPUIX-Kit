import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.MetricCard
      testId="example"
      label="Active projects"
      value="24"
      change="+12%"
      description="Compared with last month"
    />
  );
}
