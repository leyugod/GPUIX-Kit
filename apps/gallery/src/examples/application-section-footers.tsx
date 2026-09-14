import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.SectionFooter
      testId="example-sectionfooter"
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          Save preferences
        </UI.Button>
      }
    >
      <UI.Text>Changes apply to this workspace.</UI.Text>
    </UI.SectionFooter>
  );
}
