import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.RichContentSection
      testId="example-richcontentsection"
      title="Our story"
    >
      <UI.Text>
        Build thoughtful native experiences with reusable components.
      </UI.Text>
    </UI.RichContentSection>
  );
}
