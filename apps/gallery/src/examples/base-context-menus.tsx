import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [value, setValue] = useState("Right-click the card");
  const [open, setOpen] = useState(false);
  return (
    <UI.Stack>
      <UI.ContextMenu
        open={open}
        onOpenChange={setOpen}
        testId="example"
        items={[
          {
            id: "copy",
            label: "Copy name",
            run: () => setValue("Copy requested"),
          },
        ]}
      >
        <UI.Card>
          <UI.Text>Project document</UI.Text>
        </UI.Card>
      </UI.ContextMenu>
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
