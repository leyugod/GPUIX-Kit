import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Stack>
      <UI.VideoPlayer
        testId="example"
        sourceId="demo"
        state={{
          status: "idle",
          currentTime: 0,
          duration: 120,
          volume: 1,
          muted: false,
        }}
      />
      <UI.Text>Connect a playback surface and adapter to enable video.</UI.Text>
    </UI.Stack>
  );
}
