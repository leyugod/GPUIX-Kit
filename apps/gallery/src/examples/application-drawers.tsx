import { useState } from "react";
import * as UI from "@mirai/gpuix-kit";
// 状态由应用管理；接入时替换示例回调。
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <UI.Stack>
      <UI.Button testId="example-open" onPress={() => setOpen(true)}>
        Open drawer
      </UI.Button>
      <UI.Drawer
        testId="example"
        open={open}
        onOpenChange={setOpen}
        title="Inspector"
      >
        <UI.Text>Inspect the selected project.</UI.Text>
      </UI.Drawer>
    </UI.Stack>
  );
}
