import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.QRCode
      testId="example"
      value="https://github.com/leyugod/GPUIX-Kit"
      label="GPUIX-Kit on GitHub"
      size={160}
    />
  );
}
