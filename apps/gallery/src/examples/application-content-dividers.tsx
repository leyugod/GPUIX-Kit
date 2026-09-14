import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Stack>
      <UI.Text>Account settings</UI.Text>
      <UI.ContentDivider testId="example-contentdivider" label="Preferences" />
      <UI.Text>Theme and notifications</UI.Text>
    </UI.Stack>
  );
}
