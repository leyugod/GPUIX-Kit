import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.ActivityFeed
      testId="example"
      items={[
        {
          id: "created",
          title: "Project created",
          actor: "Alex",
          timeLabel: "09:00",
        },
        {
          id: "review",
          title: "Review requested",
          actor: "Sam",
          timeLabel: "09:30",
        },
      ]}
    />
  );
}
