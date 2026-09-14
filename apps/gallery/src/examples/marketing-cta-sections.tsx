import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.CTASection
      testId="example-ctasection"
      title="Build your next native app"
      description="Start with a reusable template"
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          Get started
        </UI.Button>
      }
    />
  );
}
