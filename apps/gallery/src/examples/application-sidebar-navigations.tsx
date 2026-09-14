import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState<string | null>("home");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  return (
    <UI.SourceListSidebar
      testId="example"
      height={300}
      groups={[
        {
          id: "workspace",
          label: "Workspace",
          items: [
            { id: "home", label: "Home" },
            { id: "projects", label: "Projects", badge: "8" },
            { id: "settings", label: "Settings" },
          ],
        },
      ]}
      value={value}
      onValueChange={setValue}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
    />
  );
}
