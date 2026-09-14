import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Row>
      <UI.Badge tone="success">Active</UI.Badge>
      <UI.Badge tone="warning">Pending</UI.Badge>
    </UI.Row>
  );
}
