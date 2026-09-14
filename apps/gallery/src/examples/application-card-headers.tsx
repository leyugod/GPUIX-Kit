import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Card>
      <UI.CardHeader
        title="Project overview"
        description="Manage your workspace"
      />
      <UI.CardContent>
        <UI.Text>Your project content</UI.Text>
      </UI.CardContent>
    </UI.Card>
  );
}
