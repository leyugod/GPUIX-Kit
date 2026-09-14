import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Stack>
      <UI.LoadingIndicator testId="example" label="Loading projects" />
      <UI.Skeleton style={{ width: 280, height: 24 }} />
    </UI.Stack>
  );
}
