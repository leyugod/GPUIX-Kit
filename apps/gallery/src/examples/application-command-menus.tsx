import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <UI.Stack>
      <UI.Button testId="example-open" onPress={() => setOpen(true)}>
        Open commands
      </UI.Button>
      <UI.CommandPalette
        testId="example"
        open={open}
        onOpenChange={setOpen}
        commands={[
          {
            id: "new",
            label: "New project",
            run: () => setValue("New project requested"),
          },
        ]}
      />
      <UI.Text>{value}</UI.Text>
    </UI.Stack>
  );
}
