import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.MessageList
      testId="example"
      messages={[
        {
          id: "one",
          author: "Alex",
          text: "Ready for review?",
          direction: "incoming",
        },
        {
          id: "two",
          author: "You",
          text: "Yes, looks good.",
          direction: "outgoing",
        },
      ]}
      height={260}
    />
  );
}
