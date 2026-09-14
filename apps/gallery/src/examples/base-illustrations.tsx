import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Row>
      <UI.Illustration kind="documents" />
      <UI.Illustration kind="search" />
      <UI.Illustration kind="success" />
    </UI.Row>
  );
}
