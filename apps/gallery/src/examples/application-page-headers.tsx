import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.PageHeader
      testId="example-pageheader"
      title="Projects"
      description="Manage your team workspace"
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          New project
        </UI.Button>
      }
    />
  );
}
