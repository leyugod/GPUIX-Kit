import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(["project"]);
  return (
    <UI.TreeView
      testId="example"
      nodes={[
        {
          id: "project",
          label: "Project",
          children: [
            { id: "src", label: "Source" },
            { id: "docs", label: "Docs" },
          ],
        },
      ]}
      selectedIds={selected}
      onSelectionChange={setSelected}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      height={240}
    />
  );
}
