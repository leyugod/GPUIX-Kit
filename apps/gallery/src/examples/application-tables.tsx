import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  return (
    <UI.Table
      testId="example"
      columns={[
        {
          key: "name",
          header: "Project",
          width: 280,
          render: (r) => <UI.Text>{r.name}</UI.Text>,
        },
        {
          key: "status",
          header: "Status",
          width: 160,
          render: (r) => <UI.Text>{r.status}</UI.Text>,
        },
      ]}
      rows={[
        { id: "one", name: "Website", status: "Active" },
        { id: "two", name: "Desktop app", status: "Review" },
      ]}
      rowKey={(r) => r.id}
    />
  );
}
