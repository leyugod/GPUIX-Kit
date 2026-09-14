import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.SectionHeader
      testId="example-sectionheader"
      title="Team members"
      description="Manage access and permissions"
    />
  );
}
