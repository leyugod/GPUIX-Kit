import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.HeroHeaderSection
      testId="example-heroheadersection"
      eyebrow="Native by design"
      title="Your next great app starts here"
      description="Reusable GPUIX components with light and dark themes."
      actions={
        <UI.Button testId="example" onPress={() => {}}>
          Get started
        </UI.Button>
      }
    />
  );
}
