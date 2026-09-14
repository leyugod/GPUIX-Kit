import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Row>
      <UI.FeaturedIcon tone="success">✓</UI.FeaturedIcon>
      <UI.FeaturedIcon tone="danger">!</UI.FeaturedIcon>
      <UI.FeaturedIcon>☆</UI.FeaturedIcon>
    </UI.Row>
  );
}
