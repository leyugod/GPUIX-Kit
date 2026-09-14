import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.BadgeGroup testId="example" label="New">
      Version 0.20 is ready
    </UI.BadgeGroup>
  );
}
