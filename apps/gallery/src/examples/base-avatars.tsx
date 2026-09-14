import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.AvatarGroup
      testId="example"
      items={[
        { id: "alex", name: "Alex Chen" },
        { id: "sam", name: "Sam Lee" },
        { id: "jo", name: "Jo Park" },
      ]}
    />
  );
}
