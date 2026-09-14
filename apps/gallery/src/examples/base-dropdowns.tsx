import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Choose an action");
  return (
    <UI.Stack>
      <UI.DropdownMenu
        testId="example"
        label="Actions"
        open={open}
        onOpenChange={setOpen}
        items={[
          {
            id: "rename",
            label: "Rename",
            run: () => setValue("Rename requested"),
          },
          {
            id: "archive",
            label: "Archive",
            run: () => setValue("Archive requested"),
          },
        ]}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
