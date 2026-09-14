import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.CodeBlock
      testId="example"
      code={'const message = "Hello GPUIX";'}
      language="typescript"
    />
  );
}
