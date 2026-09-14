import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Tooltip testId="example-tooltip" content="Create a new project">
      <UI.Button testId="example" onPress={() => {}}>
        Hover or focus
      </UI.Button>
    </UI.Tooltip>
  );
}
